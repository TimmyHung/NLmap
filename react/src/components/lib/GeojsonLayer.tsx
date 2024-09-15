import React, { useEffect } from "react";
import * as turf from "@turf/turf"; // 引入 turf.js

interface ContainingGeometry {
  type: string;
  visibleOnMap: boolean;
}

interface GeoJsonLayerProps {
  map: any;
  maploaded: boolean;
  id: string;
  geojson: GeoJSON.FeatureCollection;
  color: string;
  containingGeometries?: ContainingGeometry[];
  zoomLevel: number;
}

const GeojsonLayer: React.FC<GeoJsonLayerProps> = ({
  map,
  maploaded,
  id,
  geojson,
  color,
  zoomLevel,
  containingGeometries = [
    { type: 'Point', visibleOnMap: true },
    { type: 'Line', visibleOnMap: true },
    { type: 'Polygon', visibleOnMap: true },
  ],
}) => {
  useEffect(() => {
    if (!map || !geojson || !maploaded || !color) return;

    if (!map.getSource(`${id}-source`)) {
      map.addSource(`${id}-source`, {
        type: "geojson",
        data: geojson,
      });
    }

    // 添加 Polygon 層
    if (!map.getLayer(`${id}-Polygon`)) {
      map.addLayer({
        id: `${id}-Polygon`,
        type: "fill",
        source: `${id}-source`,
        paint: {
          "fill-color": color,
          "fill-opacity": 1,
        },
        filter: [
          "match",
          ["geometry-type"],
          ["Polygon", "MultiPolygon"],
          true,
          false,
        ],
      });
    }

    // 添加 Line 層
    if (!map.getLayer(`${id}-Line`)) {
      map.addLayer({
        id: `${id}-Line`,
        type: "line",
        source: `${id}-source`,
        paint: {
          "line-color": color,
          "line-width": 4,
        },
        filter: [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false,
        ],
      });
    }

    // 添加 Point 層
    if (!map.getLayer(`${id}-Point`)) {
      map.addLayer({
        id: `${id}-Point`,
        type: "circle",
        source: `${id}-source`,
        paint: {
          "circle-radius": 8,
          "circle-color": color,
          "circle-opacity": 0.9,
          "circle-stroke-color": "white",
          "circle-stroke-width": 1.5,
        },
        filter: ["==", "$type", "Point"],
      });
    }

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("mouseenter", `${id}-Point`, handleMouseEnter);
    map.on("mouseleave", `${id}-Point`, handleMouseLeave);
    map.on("mouseenter", `${id}-Line`, handleMouseEnter);
    map.on("mouseleave", `${id}-Line`, handleMouseLeave);
    map.on("mouseenter", `${id}-Polygon`, handleMouseEnter);
    map.on("mouseleave", `${id}-Polygon`, handleMouseLeave);

    return () => {
      map.off("mouseenter", `${id}-Point`, handleMouseEnter);
      map.off("mouseleave", `${id}-Point`, handleMouseLeave);
      map.off("mouseenter", `${id}-Line`, handleMouseEnter);
      map.off("mouseleave", `${id}-Line`, handleMouseLeave);
      map.off("mouseenter", `${id}-Polygon`, handleMouseEnter);
      map.off("mouseleave", `${id}-Polygon`, handleMouseLeave);

      if (map.getLayer(`${id}-Point`)) {
        map.removeLayer(`${id}-Point`);
      }
      if (map.getLayer(`${id}-Polygon`)) {
        map.removeLayer(`${id}-Polygon`);
      }
      if (map.getLayer(`${id}-Line`)) {
        map.removeLayer(`${id}-Line`);
      }

      if (map.getSource(`${id}-source`)) {
        map.removeSource(`${id}-source`);
      }
    };
  }, [map, maploaded, geojson, id, color]);

  // 根據 zoomLevel 動態顯示 Polygon 或 Point
  useEffect(() => {
    if (!map || !maploaded || !geojson || !zoomLevel) return;

    const updatedGeojson = { ...geojson };

    updatedGeojson.features = geojson.features.map((feature) => {
      if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
        const polygonArea = turf.area(feature); // 使用 Turf.js 計算 Polygon 面積

        // 根據面積計算出顯示閾值
        let thresholdZoom;
        if (polygonArea > 1000000) {
          thresholdZoom = Math.log(polygonArea) / Math.log(3.7);
        } else if(polygonArea > 500000)   {
          // 對於非常大的多邊形，調整顯示縮放等級
          thresholdZoom = Math.log(polygonArea) / Math.log(3.3);
        } else if(polygonArea > 200000)   {
          // 對於非常大的多邊形，調整顯示縮放等級
          thresholdZoom = Math.log(polygonArea) / Math.log(3);
        } else if(polygonArea > 100000)   {
          // 對於非常大的多邊形，調整顯示縮放等級
          thresholdZoom = Math.log(polygonArea) / Math.log(2.65);
        } else if(polygonArea > 50000)   {
          // 對於非常大的多邊形，調整顯示縮放等級
          thresholdZoom = Math.log(polygonArea) / Math.log(2.5);
        } else if (polygonArea > 10000) {
          thresholdZoom = Math.log(polygonArea) / Math.log(2.4);
        } else if (polygonArea > 1000) {
          // 對於中等大小的多邊形，使用較合理的縮放級別
          thresholdZoom = Math.log(polygonArea) / Math.log(2) + 4;
        } else {
          // 對於小的多邊形
          thresholdZoom = Math.log(polygonArea) / Math.log(2) + 9;
        }

        // 如果當前 zoomLevel 小於閾值，將其轉換為 Point
        if (zoomLevel < thresholdZoom) {
          const centroid = turf.centroid(feature);
          return {
            ...centroid,
            properties: feature.properties,
          };
        }
      }
      return feature;
    });

    if (map.getSource(`${id}-source`)) {
      map.getSource(`${id}-source`).setData(updatedGeojson);
    }
  }, [map, geojson, zoomLevel, maploaded, id]);

  // 動態改變顏色
  useEffect(() => {
    if (!map || !maploaded || !color) return;

    [
      { type: "Point", proptochange: "circle-color" },
      { type: "Line", proptochange: "line-color" },
      { type: "Polygon", proptochange: "fill-color" },
    ].forEach((a) => {
      if (map.getLayer(`${id}-${a.type}`)) {
        map.setPaintProperty(`${id}-${a.type}`, a.proptochange, color);
      }
    });
  }, [map, color, id, maploaded]);

  // 動態控制幾何物件的可見性
  useEffect(() => {
    if (!map || !maploaded) return;

    containingGeometries.forEach((a) => {
      if (map.getLayer(`${id}-${a.type}`)) {
        map.setLayoutProperty(
          `${id}-${a.type}`,
          "visibility",
          a.visibleOnMap ? "visible" : "none"
        );
      }
    });
  }, [map, containingGeometries, id, maploaded]);

  return null;
};

export default GeojsonLayer;
