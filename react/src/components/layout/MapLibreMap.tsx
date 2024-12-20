import React, { useRef, useEffect, useState, ReactElement } from 'react';
import maplibregl, { LngLatLike, Map, MapOptions, LngLatBoundsLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import GeojsonLayer from "@/components/lib/GeojsonLayer";
import Popup from "@/components/lib/Popup";
import getRandomDarkColor, { record_getDisplayAddress, record_getDisplayName } from '@/components/lib/Utils';
import bbox from '@turf/bbox';
import { useAuth } from "@/components/lib/AuthProvider";
import { FavoriteAndResultModal } from './FavoriteSelectionModal';

interface MapLibreMapProps {
  geoJsonDataArray;
  onBoundsChange: (bounds: maplibregl.LngLatBounds) => void;
  initialCenter?: LngLatLike;
  initialZoom?: number;
  showInfo?: boolean;
  ChildComponent?: boolean;
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({
  geoJsonDataArray,
  onBoundsChange,
  initialCenter = [120.76, 23.80],
  initialZoom = 7,
  showInfo = true,
  ChildComponent = false,
}): ReactElement => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [mapState, setMapState] = useState({
    center: initialCenter,
    zoom: initialZoom,
  });
  const [userLocationMarker, setUserLocationMarker] = useState<maplibregl.Marker | null>(null);
  const [colors, setColors] = useState<{ [key: string]: string }>({});
  const [zoomLevel, setZoomLevel] = useState<number>(initialZoom);
  const [isFavoriteModalVisible, setIsFavoriteModalVisible] = useState<boolean>(false);
  const [recordToAppend, setRecordToAppend] = useState(null);
  const { JWTtoken } = useAuth();

  class CustomButtonControl {
    private map: maplibregl.Map | undefined;
    private container: HTMLElement | undefined;

    onAdd(map: maplibregl.Map) {
      this.map = map;

      // 建立控制器的容器
      this.container = document.createElement('div');
      this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

      // 設定按鈕之間的距離
      this.container.style.display = 'flex';
      this.container.style.flexDirection = 'column';
      this.container.style.gap = '2px';

      // 建立按鈕 1 (Home)
      const homeButton = document.createElement('button');
      homeButton.innerHTML = '<i class="fa-solid fa-house text-black"></i>';
      homeButton.onclick = () => {
        if (this.map) {
          // 回到初始中心位置
          this.map.flyTo({
            center: initialCenter,
            zoom: initialZoom,
            essential: true,
            duration: 1500,
          });
        }
      };
      this.container.appendChild(homeButton);

      // 建立按鈕 2 (Location)
      const locationButton = document.createElement('button');
      locationButton.innerHTML = '<i class="fa-solid fa-location-crosshairs text-black"></i>';
      locationButton.onclick = () => {
        // 獲取使用者位置
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            if (this.map) {
              // 跳轉到使用者位置
              this.map.flyTo({
                center: [longitude, latitude],
                zoom: 14,
                essential: true,
                duration: 1500,
              });

              if (userLocationMarker) {
                userLocationMarker.setLngLat([longitude, latitude]);
              } else {
                const marker = new maplibregl.Marker({ color: 'rgb(20, 69, 131)' })
                  .setLngLat([longitude, latitude])
                  .addTo(this.map);
                setUserLocationMarker(marker);
              }
            }
          }, (error) => {
            console.error("取得使用者位置時發生錯誤: ", error);
          });
        } else {
          alert("你的瀏覽器不支援取得自己的位置");
        }
      };
      this.container.appendChild(locationButton);

      return this.container;
    }

    onRemove() {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      this.map = undefined;
    }
  }

  


  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const mapOptions: MapOptions = {
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              maxzoom: 19
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: mapState.center,
        zoom: mapState.zoom,
        minZoom: 6.5
      };

      mapInstance.current = new maplibregl.Map(mapOptions);
      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-left');
      // 加入自訂控制器
      if(!ChildComponent){
        const customButtonControl = new CustomButtonControl();
        mapInstance.current.addControl(customButtonControl, 'top-left');
      }

      mapInstance.current.on('zoom', () => {
        setZoomLevel(mapInstance.current!.getZoom());
      });

      mapInstance.current.on('moveend', () => {
        const bounds = mapInstance.current!.getBounds();
        onBoundsChange(bounds);
        setMapState({
          center: mapInstance.current!.getCenter().toArray() as LngLatLike,
          zoom: mapInstance.current!.getZoom()
        });
      });
    }
  }, [mapState.center, mapState.zoom, onBoundsChange]);

  useEffect(() => {
    const newColors = geoJsonDataArray.reduce((acc, geoJsonData) => {
      if (!acc[geoJsonData.id]) {
        acc[geoJsonData.id] = getRandomDarkColor();
      }
      return acc;
    }, {} as { [key: string]: string });
    setColors((prevColors) => ({ ...prevColors, ...newColors }));
  }, [geoJsonDataArray]);

  //跳轉到指定經緯度和縮放級別
  useEffect(() => {
    if (mapInstance.current && ChildComponent) {
      mapInstance.current.flyTo({
        center: initialCenter,
        zoom: initialZoom,
        essential: true,
        duration: 2000,
      });
    }
  }, [initialCenter, initialZoom]);

  //自動跳轉到所有 GeoJSON 的範圍
  useEffect(() => {
    if (mapInstance.current && geoJsonDataArray.length > 0 && !ChildComponent) {
      const latestGeoJsonData = geoJsonDataArray[geoJsonDataArray.length - 1];
      const latestGeoJsonFeatures: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: latestGeoJsonData.data.features,
      };
      const bounds = bbox(latestGeoJsonFeatures) as [number, number, number, number];
      if (bounds) {
        const boundsArray: [LngLatLike, LngLatLike] = [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]]
        ];
        
        const screenWidth = window.innerWidth;
        let padding;

        if (screenWidth <= 480) { // 手機
          padding = 100;  // 較小的 padding
        } else if (screenWidth <= 768) { // 平板
          padding = 150; // 中等 padding
        } else { // 桌面設備
          padding = 200; // 大 padding
        }


        mapInstance.current.fitBounds(boundsArray, {
          padding,
          duration: 2000,
        });
      }
    }
  }, [geoJsonDataArray]);

  const generateUpdatedRecordSet = (recordSet, selectedRecord, whitelist = true) => {
    console.log(recordSet.data.elements);
    const nodesToInclude = new Set();
    const targetId = selectedRecord.properties.id;
    const targetRecord = recordSet.data.elements.filter((element) => element.id === targetId)[0];

    //若是way或是relation將其附屬node都加入List
    if (selectedRecord.properties.type === 'way' || selectedRecord.properties.type === 'relation') {
      targetRecord.nodes?.forEach(nodeId => nodesToInclude.add(nodeId));
    }

    //設置一些基本的node資訊
    targetRecord.displayName= record_getDisplayName(targetRecord);
    targetRecord.displayAddress= record_getDisplayAddress(targetRecord);
    targetRecord.lats = targetRecord.type == "node" ? [targetRecord.lat] : [];
    targetRecord.lons = targetRecord.type == "node" ? [targetRecord.lon] : [];

    //根據nodesToInclude還有selectedId從recordSet中篩選出想要加入的地點
    const updatedRecords = recordSet.data.elements.filter(record => {
        const isSelected = targetId === record.id || nodesToInclude.has(record.id);
        return whitelist ? isSelected : !isSelected;
    });

    //如果是way或是relations則將所有附屬node的經緯度都放入lats跟lons
    recordSet.data.elements.map((element)=>{
      if(nodesToInclude.has(element.id) && selectedRecord.properties.type != "node"){
        targetRecord.lats = [...targetRecord.lats, element.lat];
        targetRecord.lons = [...targetRecord.lons, element.lon];
      }
    })

    return {
        records: {
            ...recordSet.data,
            elements: updatedRecords,
        },
    };
  };



  const handleFunction = (selectedRecord, overpassJson: any) => {
    const filteredRecordSet = generateUpdatedRecordSet(overpassJson, selectedRecord);
    setRecordToAppend(filteredRecordSet);
    setIsFavoriteModalVisible(true);
  };
  

  return (
    <>
      <div ref={mapRef} className="w-full h-full" />
        {geoJsonDataArray.map((geoJsonData) => (
          <GeojsonLayer
            key={geoJsonData.id}
            map={mapInstance.current}
            maploaded={!!mapInstance.current}
            id={geoJsonData.id}
            geojson={geoJsonData.data}
            color={colors[geoJsonData.id]}
            zoomLevel={zoomLevel}
          />
        ))}
      <Popup 
        map={mapInstance.current} 
        onAppendCollection={(selectedRecord)=>{handleFunction(selectedRecord, geoJsonDataArray[0].overpassJson);}}
        disableAppend={ChildComponent}
        JWTtoken={JWTtoken}
      />
      
      {showInfo &&
        <div className="absolute bottom-[8vh] lg:bottom-2 left-2 bg-white bg-opacity-80 p-2 rounded-md">
          <div>{"經度 " + mapState.center[0].toFixed(2) + "    緯度 " + mapState.center[1].toFixed(2)}</div>
          <div>{"縮放等級 " + mapState.zoom.toFixed(2)}</div>
        </div>
      }

        
      <FavoriteAndResultModal
        isVisible={isFavoriteModalVisible}
        onClose={() => setIsFavoriteModalVisible(false)}
        JWTtoken={JWTtoken}
        recordToAppend={recordToAppend}
        onSuccessAppendFavorite={() => {}}
      />
    </>
  );
};

export default MapLibreMap;
