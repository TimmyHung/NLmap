import React from 'react';
import MapLibreMap from "@/components/layout/MapLibreMap";

interface MapModalProps {
  isVisible: boolean;
  textTitle: string;
  onClose: () => void;
  geoJsonData: GeoJSON.FeatureCollection | null;
  center?: [number, number];
  zoom?: number;
  ChildComponent: boolean;
}

const MapModal: React.FC<MapModalProps> = ({ isVisible, textTitle, onClose, geoJsonData, center, zoom = 12, ChildComponent}) => {
  if (!isVisible) return null;

  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50" onClick={onClose}>
      <div className="flex flex-col gap-2 bg-white p-5 rounded-lg shadow-lg w-4/5 h-4/5 relative" onClick={handleMapClick}>
        <div className="w-full flex justify-between items-center relative break-words">
          <p className="text-lg md:text-2xl">
            {textTitle}
          </p>
          <div className="max-h-8 hover:bg-red-700 border border-black rounded-xl h-full flex justify-center items-center bg-gray-200" onClick={() => onClose()}>
              <i className="fa-solid fa-x cursor-pointer px-4 hover:text-white"></i>
          </div>
        </div>
        <div className="w-full h-full border-4 border-grey-500">
          <MapLibreMap 
              geoJsonDataArray={[{ id: 'modalMap', data: geoJsonData }]} 
              onBoundsChange={() => {}}
              initialCenter={center}
              initialZoom={zoom}
              showInfo={false}
              ChildComponent={ChildComponent}
          />
        </div>
      </div>
    </div>
  );
};

export default MapModal;
