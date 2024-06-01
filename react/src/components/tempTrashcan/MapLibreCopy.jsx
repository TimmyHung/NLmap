import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapLibreMap = ({ geoJsonData, onBoundsChange }) => {
  const mapRef = useRef(null);
  const [mapState, setMapState] = useState({
    center: [120.55, 23.67],
    zoom: 7
  });

  const createPolygonGeoJSON = (nodes, way) => {
    const coordinates = way.nodes.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      console.log("ID" + node)
      return [node.lon, node.lat];
    });

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates] // Polygon coordinates need to be an array of arrays
      },
      properties: {}
    };
  };

  useEffect(() => {
    if (mapRef.current) {
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: {
          "version": 8,
          "sources": {
            "osm": {
              "type": "raster",
              "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
              "tileSize": 256,
              "maxzoom": 19
            }
          },
          "layers": [
            {
              "id": "osm",
              "type": "raster",
              "source": "osm"
            }
          ]
        },
        center: mapState.center,
        zoom: mapState.zoom,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.on('moveend', () => {
        const bounds = map.getBounds();
        onBoundsChange(bounds);
        setMapState({
          center: map.getCenter().toArray(),
          zoom: map.getZoom()
        });
      });

      map.on('load', () => {
        if (geoJsonData) {
          console.log(geoJsonData)
          const nodes = geoJsonData.elements.filter(element => element.type === 'node');
          const way = geoJsonData.elements.find(element => element.type === 'way');
          console.log(nodes)
          console.log(way)
          const polygonData = createPolygonGeoJSON(nodes, way);

          map.addSource('polygon-data', {
            type: 'geojson',
            data: polygonData
          });

          map.addLayer({
            id: 'polygon',
            type: 'fill',
            source: 'polygon-data',
            paint: {
              'fill-color': '#ff0000', // Use red color to fill the polygon
              'fill-opacity': 0.5
            }
          });

          map.addSource('geojson-data', {
            type: 'geojson',
            data: geoJsonData
          });

          map.addLayer({
            id: 'geojson-points',
            type: 'circle',
            source: 'geojson-data',
            filter: ['==', '$type', 'Point'],
            paint: {
              'circle-radius': 5,
              'circle-color': '#007cbf'
            }
          });

          map.addLayer({
            id: 'geojson-lines',
            type: 'line',
            source: 'geojson-data',
            filter: ['==', '$type', 'LineString'],
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#007cbf',
              'line-width': 3
            }
          });
        }
      });

      return () => map.remove();
    }
  }, [geoJsonData, mapState.center, mapState.zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapLibreMap;
