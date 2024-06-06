import { useState, useCallback, ReactElement } from 'react';
import MapLibreMap from "@/components/layout/MapLibreMap";
import css from "@/css/Home.module.css";
import HomeSideBar from '@/components/layout/HomeSidebar';

export default function Home(): ReactElement {
  const [overpassQL, setOverPassQL] = useState('');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [bounds, setBounds] = useState("21.20,117.67,26.25,124.18");

  const handleBoundsChange = useCallback((rawBounds: any) => {
    const newBounds = `${parseFloat(rawBounds._sw.lat).toFixed(2)},${parseFloat(rawBounds._sw.lng).toFixed(2)},${parseFloat(rawBounds._ne.lat).toFixed(2)},${parseFloat(rawBounds._ne.lng).toFixed(2)}`;
    setBounds(newBounds);
  }, []);

  const handleGeoJsonData = useCallback((data) => {
    setGeoJsonData(data);
  }, []);

  return (
    <div className={css.content}>
      <div className={css.map}>
        <MapLibreMap
          geoJsonData={geoJsonData}
          onBoundsChange={handleBoundsChange}
        />
      </div>
      <HomeSideBar
        setGeoJsonData={handleGeoJsonData}
        bounds={bounds}
        setBounds={setBounds}
      />
    </div>
  );
}
