import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet"; // Import leaflet library
import Swal from "sweetalert2"; // Import SweetAlert library
import css from "../../css/Home.module.css";
import "leaflet/dist/leaflet.css";

//要求權限並導向到自己的位置
const SelfLocationMarker = ({ setPosition}) => {
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      // map.flyTo(e.latlng, 16);
    });
  }, [map, setPosition]);

  return null;
};

const LeafletMap = ({ geoJsonData, onBoundsChange }) => {
  const mapRef = useRef();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (geoJsonData && mapRef.current) {
      const map = mapRef.current;
      map.eachLayer(layer => {
        if (layer.options && layer.options.pane === "overlayPane") {
          map.removeLayer(layer);
        }
      });
      const geoJsonLayer = new L.GeoJSON(geoJsonData);
      geoJsonLayer.addTo(map);
    }
  }, [geoJsonData]);

  //取得當前地圖邊界
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.on("moveend", () => {
        const bounds = map.getBounds();
        onBoundsChange(bounds);
      });
    }
  }, [mapRef.current,onBoundsChange]);


  const goToCurrentLocation = () => {
    if (mapRef.current && position) {
      mapRef.current.flyTo(position, 16);
    } else {
      Swal.fire("請先允許網站存取您的位置");
    }
  };

  return (
    <MapContainer
      center={[23.756440628198764, 120.9309176734606]}
      zoom={8}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
      attributionControl={false}
    > 
      <SelfLocationMarker setPosition={setPosition} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoJsonData && <GeoJSON data={geoJsonData} />}
      {position && (
        <Marker position={position} icon={new L.Icon({ iconUrl: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png', iconSize: [30, 30] })}>
          <Popup><img src="https://i.imgur.com/a5m71bv.jpg" width="150em" height="150em" /><br />這你的位置</Popup>
        </Marker>
      )}
      <button onClick={goToCurrentLocation} className={css.map_button_selfLocation}>
        <i className="fa-solid fa-location-crosshairs"></i>
      </button>
    </MapContainer>
  );
};

export default LeafletMap;
