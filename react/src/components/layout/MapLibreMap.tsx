import React, { useRef, useEffect, useState, ReactElement } from 'react';
import maplibregl, { LngLatLike, Map, MapOptions } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import GeojsonLayer from "@/components/lib/GeojsonLayer";
import Popup from "@/components/lib/Popup";
import getRandomDarkColor from '@/components/lib/Utils';

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
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({
  geoJsonDataArray,
  onBoundsChange,
  initialCenter = [120.76, 23.80],
  initialZoom = 7,
  showInfo = true,
}): ReactElement => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [mapState, setMapState] = useState({
    center: initialCenter,
    zoom: initialZoom
  });
  const [colors, setColors] = useState<{ [key: string]: string }>({});

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

  useEffect(() => {
    const newColors = geoJsonDataArray.reduce((acc, geoJsonData) => {
      if (!acc[geoJsonData.id]) {
        acc[geoJsonData.id] = getRandomDarkColor();
      }
      return acc;
    }, {} as { [key: string]: string });
    setColors((prevColors) => ({ ...prevColors, ...newColors }));
  }, [geoJsonDataArray]);

  return (
    <>
      <div ref={mapRef} className="w-full md:h-full" style={{ height: 'calc(100vh - 3rem)' }} />
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
      <Popup map={mapInstance.current} />
      
      { showInfo &&
        <div className="absolute bottom-[8vh] md:bottom-2 left-2 bg-white bg-opacity-80 p-2 rounded-md">
        <div>{"經度 " + mapState.center[0].toFixed(2) + "    緯度 " + mapState.center[1].toFixed(2)}</div>
        <div>{"縮放等級 " + mapState.zoom.toFixed(2)}</div>
      </div>}
    </>
  );
};

export default MapLibreMap;
