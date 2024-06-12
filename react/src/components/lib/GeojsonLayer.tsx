import React, { useEffect } from "react";

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
}

const GeojsonLayer: React.FC<GeoJsonLayerProps> = ({
  map,
  maploaded,
  id,
  geojson,
  color,
  containingGeometries = [
    { type: 'Point', visibleOnMap: true },
    { type: 'Line', visibleOnMap: true },
    { type: 'Polygon', visibleOnMap: true },
  ],
}) => {
  useEffect(() => {
    if (!map || !geojson || !maploaded || !color) return;

    // console.log(`Adding layers for id: ${id}, color: ${color}`);

    if (!map.getSource(`${id}-source`)) {
      map.addSource(`${id}-source`, {
        type: "geojson",
        data: geojson,
      });
    }

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

  useEffect(() => {
    if (!map || !maploaded || !color) return;

    // console.log(`Updating color for id: ${id}, color: ${color}`);

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
