import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import css from "@/css/Home.module.css";
import axios from "axios";
import { record_getDisplayName } from "./Utils";
import Swal from 'sweetalert2';
import { FavoriteAndResultModal } from "../layout/FavoriteSelectionModal";

interface PopupProps {
  map: maplibregl.Map;
  children?: React.ReactNode;
  disablePopup?: boolean;
  onFeatureClick?: (feature: maplibregl.MapGeoJSONFeature) => void;
  onAppendCollection;
  disableAppend?: boolean;
}

const Popup: React.FC<PopupProps> = ({
  map,
  disablePopup = false,
  onFeatureClick = () => {},
  onAppendCollection,
  disableAppend = false,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupProperties, setPopupProperties] = useState<any>(null);
  const [featureType, setFeatureType] = useState<string | null>(null);
  const [featureId, setFeatureId] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [popup, setPopup] = useState<maplibregl.Popup | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [locationInfo, setLocationInfo] = useState<{ ctyName: string; townName: string; villageName: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    if (!map) return;

    const fetchLocationInfo = async (lng: number, lat: number) => {
      try {
        setLoading(true); // 開始加載
        const response = await axios.get(`https://api.nlsc.gov.tw/other/TownVillagePointQuery1/${lng}/${lat}`);
        const ctyName = response.data.ctyName || "未知";
        const townName = response.data.townName || "未知";
        const villageName = response.data.villageName || "未知";

        setLocationInfo({ ctyName, townName, villageName });
      } catch (error) {
        console.error("Failed to fetch location info:", error);
      } finally {
        setLoading(false); // 加載結束
      }
    };

    const findNearestNode = (geometry: any) => {
      if (geometry.type === "LineString" || geometry.type === "Polygon") {
        const coordinates = geometry.type === "LineString" ? geometry.coordinates : geometry.coordinates[0];
        const nearestNode = coordinates[0];
        return nearestNode;
      }
      return null;
    };
    
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point);
      if (features.length > 0) {
        if (!disablePopup) {
          const clickedFeature = features[0];
          onFeatureClick(clickedFeature);
    
          const featureIdRaw = clickedFeature.properties["id"];
          let displayName = "";
    
          let parsedTags;
          try {
            parsedTags = JSON.parse(clickedFeature.properties.tags);
          } catch (error) {
            console.error("Failed to parse tags:", error);
            parsedTags = {};
          }
          clickedFeature.properties.tags = parsedTags;
    
          if (typeof featureIdRaw === "string" && featureIdRaw.includes("/")) {
            const featureId = featureIdRaw.split("/")[1];
            const rawType = featureIdRaw.split("/")[0];
            const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
    
            setFeatureId(featureId?.toString() || null);
            setFeatureType(type);
    
            displayName = record_getDisplayName(clickedFeature.properties);
          } else if (typeof featureIdRaw === "number") {
            const featureId = featureIdRaw;
            const rawType = clickedFeature.properties["type"];
            const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
    
            setFeatureId(featureId?.toString() || null);
            setFeatureType(type);
    
            displayName = record_getDisplayName(clickedFeature.properties);
          } else {
            console.error("Invalid feature ID:", featureIdRaw);
            setFeatureId(null);
            setFeatureType(null);
            displayName = "地點獲取失敗";
          }
    
          setDisplayName(displayName);
          setPopupProperties(parsedTags);
          setSelectedRecord(clickedFeature); 

          if (clickedFeature.geometry.type === "Point") {
            const coordinates = clickedFeature.geometry.coordinates;
            setLongitude(coordinates[0]);
            setLatitude(coordinates[1]);
            fetchLocationInfo(coordinates[0], coordinates[1]);
          } else if (clickedFeature.geometry.type === "LineString" || clickedFeature.geometry.type === "Polygon") {
            const nearestNode = findNearestNode(clickedFeature.geometry);
            if (nearestNode) {
              setLongitude(nearestNode[0]);
              setLatitude(nearestNode[1]);
              fetchLocationInfo(nearestNode[0], nearestNode[1]);
            } else {
              setLongitude(null);
              setLatitude(null);
              setLocationInfo(null);
            }
          } else {
            setLongitude(null);
            setLatitude(null);
            setLocationInfo(null);
          }
    
          setIsExpanded(false);
    
          const newPopup = new maplibregl.Popup({
            maxWidth: "none",
            closeButton: false,
            closeOnClick: false,
          })
            .setLngLat(e.lngLat)
            .setDOMContent(popupRef.current!)
            .addTo(map);
    
          setPopup(newPopup);
        }
      } else {
        if (popup) {
          popup.remove();
          setPopup(null);
        }
      }
    };
    
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
      if (popup) {
        popup.remove();
      }
    };
  }, [map, disablePopup, popup]);

  // 處理加入收藏的邏輯
  const handleAddToFavorites = () => {
    if (selectedRecord) {
      onAppendCollection(selectedRecord);
    }
  };

  return (
    <div
      ref={popupRef}
      className="max-w-full sm:max-w-lg lg:max-w-xl max-h-64 w-full sm:w-auto overflow-auto break-words"
    >
      {loading ? (
        <div>資料載入中...</div>
      ) : (
        <div className="w-full flex flex-col overflow-y-auto">

          {featureType && featureId && (
            <div>
              {displayName && (
                <div className="text-lg font-semibold text-base">{displayName}</div>
              )}
              {featureType}
              <a
                href={`https://www.openstreetmap.org/${featureType.toLowerCase()}/${featureId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 text-nodeIDBlue"
              >
                {featureId}
              </a>
            </div>
          )}
          {latitude !== null && longitude !== null && (
            <>
              <div className={css.coordinates}>經度: {longitude}</div>
              <div>緯度: {latitude}</div>
            </>
          )}
          {locationInfo && (
            <div>
              <div>{`${locationInfo.ctyName} / ${locationInfo.townName} / ${locationInfo.villageName}`}</div>
            </div>
          )}
          {
            !disableAppend &&
            <div className="text-base cursor-pointer" onClick={handleAddToFavorites}>
              [加入收藏]▸
            </div>
          }
          {popupProperties && (
            <div className="max-h-32">
              <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-base cursor-pointer"
              >
                [標籤]{isExpanded ? '▾' : '▸'}
              </div>
              {isExpanded && (
                <div className="max-h-32">
                    {Object.keys(popupProperties).map((prop, i) => (
                    <div className="flex flex-wrap" key={`prop-${i}`}>
                      <span className="font-semibold truncate">{prop}</span>
                      <span className="mx-2 whitespace-nowrap">=</span>
                      <span className="whitespace-nowrap">
                            {popupProperties[prop]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Popup;
