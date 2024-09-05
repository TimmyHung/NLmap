import React, { useRef, useEffect, useState, ReactElement } from 'react';
import maplibregl, { LngLatLike, Map, MapOptions, LngLatBoundsLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import GeojsonLayer from "@/components/lib/GeojsonLayer";
import Popup from "@/components/lib/Popup";
import getRandomDarkColor from '@/components/lib/Utils';
// @ts-ignore
import bbox from '@turf/bbox';

interface GeoJsonData {
  id: string;
  data: GeoJSON.FeatureCollection;
}

interface MapLibreMapProps {
  geoJsonDataArray: GeoJsonData[];
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
    zoom: initialZoom
  });
  const [colors, setColors] = useState<{ [key: string]: string }>({});

  // 初始化地圖
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
        zoom: mapState.zoom
      };

      mapInstance.current = new maplibregl.Map(mapOptions);
      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-left');

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

  // 根據 geoJsonDataArray 設定隨機顏色
  useEffect(() => {
    const newColors = geoJsonDataArray.reduce((acc, geoJsonData) => {
      if (!acc[geoJsonData.id]) {
        acc[geoJsonData.id] = getRandomDarkColor();
      }
      return acc;
    }, {} as { [key: string]: string });
    setColors((prevColors) => ({ ...prevColors, ...newColors }));
  }, [geoJsonDataArray]);

  // 跳轉到指定經緯度和縮放級別
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

  // 自動跳轉到所有 GeoJSON 的範圍
  useEffect(() => {
    if (mapInstance.current && geoJsonDataArray.length > 0 && !ChildComponent) {
      const allGeoJsonFeatures = {
        type: 'FeatureCollection',
        features: geoJsonDataArray.flatMap((geoJsonData) => geoJsonData.data.features),
      };
      const bounds = bbox(allGeoJsonFeatures) as LngLatBoundsLike;
      if (bounds) {
        mapInstance.current.fitBounds(bounds, {
          padding: 300,
          duration: 2000,
        });
      }
    }
  }, [geoJsonDataArray]);

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
          />
        ))}
      <Popup map={mapInstance.current}/>
      
      { showInfo &&
        <div className="absolute bottom-[8vh] md:bottom-2 left-2 bg-white bg-opacity-80 p-2 rounded-md">
        <div>{"經度 " + mapState.center[0].toFixed(2) + "    緯度 " + mapState.center[1].toFixed(2)}</div>
        <div>{"縮放等級 " + mapState.zoom.toFixed(2)}</div>
      </div>}
    </>
  );
};

export default MapLibreMap;
