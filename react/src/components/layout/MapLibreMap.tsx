import React, { useRef, useEffect, useState, ReactElement } from 'react';
import maplibregl, { LngLatLike, Map, MapboxOptions } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapProps {
  geoJsonData: GeoJSON.FeatureCollection | null;
  onBoundsChange: (bounds: maplibregl.LngLatBounds) => void;
}

const MapLibreMap: React.FC<MapLibreMapProps> = ({ geoJsonData, onBoundsChange }): ReactElement => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState({
    center: [120.55, 23.67] as LngLatLike,
    zoom: 7
  });

  useEffect(() => {
    if (mapRef.current) {
      const mapOptions: MapboxOptions = {
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
      };

      const map: Map = new maplibregl.Map(mapOptions);

      // Add navigation controls to the map.
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.on('moveend', () => {
        const bounds = map.getBounds();
        onBoundsChange(bounds);
        setMapState({
          center: map.getCenter().toArray() as LngLatLike,
          zoom: map.getZoom()
        });
      });

      map.on('load', () => {
        if (geoJsonData) {
          map.addSource('geojson-data', {
            type: 'geojson',
            data: geoJsonData
          });

          // Add a layer for point features (nodes)
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

          // Add a layer for line features (ways)
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
  }, [geoJsonData, mapState.center, mapState.zoom, onBoundsChange]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapLibreMap;
