import { useState, useCallback, ReactElement } from 'react';
import MapLibreMap from "@/components/layout/MapLibreMap";
import HomeSideBar from '@/components/layout/HomeSidebar';
import HomeBottomDrawer from '@/components/layout/HomeBottomDrawer';

interface GeoJsonData {
  id: string;
  overpassJson;
  data: GeoJSON.FeatureCollection;
}

export default function Home(): ReactElement {
  const [geoJsonDataArray, setGeoJsonDataArray] = useState<GeoJsonData[]>([]);
  const [bounds, setBounds] = useState("21.20,117.67,26.25,124.18");

  const handleBoundsChange = useCallback((rawBounds: any) => {
    const newBounds = `${parseFloat(rawBounds._sw.lat).toFixed(2)},${parseFloat(rawBounds._sw.lng).toFixed(2)},${parseFloat(rawBounds._ne.lat).toFixed(2)},${parseFloat(rawBounds._ne.lng).toFixed(2)}`;
    setBounds(newBounds);
  }, []);

  const handleGeoJsonData = useCallback((data) => {
    const newGeoJsonData: GeoJsonData = {
      id: `${Date.now()}`, //使用時間作為唯一的ID(這是React Array的要求)
      overpassJson: data[1],
      data: data[0],
    };
    setGeoJsonDataArray((prevDataArray) => [...prevDataArray, newGeoJsonData]);
  }, []);

  return (
    <div className="flex w-full h-full">
      <div className="w-full h-full">
        <MapLibreMap
          geoJsonDataArray={geoJsonDataArray}
          onBoundsChange={handleBoundsChange}
        />
      </div>
      <HomeSideBar
        setGeoJsonData={handleGeoJsonData}
        bounds={bounds}
      />
      <HomeBottomDrawer
        setGeoJsonData={handleGeoJsonData}
        bounds={bounds}
      />
    </div>
  );
}
