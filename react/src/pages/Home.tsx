import { useEffect, useState, useRef, useCallback, ReactElement } from 'react';
import { getOverPassQL, getGeoJsonData } from '@/components/lib/API';
import MapLibreMap from "@/components/layout/MapLibreMap";
import css from "@/css/Home.module.css";
import Toast from '@/components/ui/Toast';
import Swal from 'sweetalert2';
import { isInputElement } from 'react-router-dom/dist/dom';
import HomeSideBar from '@/components/layout/HomeSidebar';

const querystates = {
  idle: "idle",
  generating_query: "generating_query",
  extracting_from_osm: "extracting_from_osm",
  extraction_done: "extraction_done"
};

const tabs = {
  manual: "manual",
  askgpt: "askgpt"
};

export default function Home(): ReactElement {
  const [overpassQL, setOverPassQL] = useState('');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [bounds, setBounds] = useState("21.20,117.67,26.25,124.18");

  const handleBoundsChange = useCallback((rawBounds: any) => {
    const bounds = `${parseFloat(rawBounds._sw.lat).toFixed(2)},${parseFloat(rawBounds._sw.lng).toFixed(2)},${parseFloat(rawBounds._ne.lat).toFixed(2)},${parseFloat(rawBounds._ne.lng).toFixed(2)}`;
    setBounds(bounds);
  }, []);

  return (
    <div className={css.content}>
      <div className={css.map}>
        {/* TODO: 加上node, way, relations 數量 */}
        <MapLibreMap
          geoJsonData={geoJsonData}
          onBoundsChange={handleBoundsChange}
        />
      </div>

      <HomeSideBar/>
    </div>
  );
}
