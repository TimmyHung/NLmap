import { useState, useCallback, ReactElement } from 'react';
import MapLibreMap from "@/components/layout/MapLibreMap";
import css from "@/css/Home.module.css";
import HomeSideBar from '@/components/layout/HomeSidebar';

interface GeoJsonData {
  id: string;
  data: GeoJSON.FeatureCollection;
}

export default function Home(): ReactElement {
  const [geoJsonDataArray, setGeoJsonDataArray] = useState<GeoJsonData[]>([]);
  const [bounds, setBounds] = useState("21.20,117.67,26.25,124.18");

  const handleBoundsChange = useCallback((rawBounds: any) => {
    const newBounds = `${parseFloat(rawBounds._sw.lat).toFixed(2)},${parseFloat(rawBounds._sw.lng).toFixed(2)},${parseFloat(rawBounds._ne.lat).toFixed(2)},${parseFloat(rawBounds._ne.lng).toFixed(2)}`;
    setBounds(newBounds);
  }, []);

  const handleGeoJsonData = useCallback((data: GeoJSON.FeatureCollection) => {
    const newGeoJsonData: GeoJsonData = {
      id: `${Date.now()}`, //使用時間作為唯一的ID(這是React Array的要求)
      data
    };
    setGeoJsonDataArray((prevDataArray) => [...prevDataArray, newGeoJsonData]);
  }, []);

  return (
    <div className={css.content}>
      <div className={css.map}>
        <MapLibreMap
          geoJsonDataArray={geoJsonDataArray}
          onBoundsChange={handleBoundsChange}
        />
      </div>
      <HomeSideBar
        setGeoJsonData={handleGeoJsonData}
        bounds={bounds}
      />
    </div>
  );
}
