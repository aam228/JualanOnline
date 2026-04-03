// MeasurementGuideModal: Shows visual diagrams for measurement guidance
import React from 'react';

const MeasurementGuideModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-2">Measurement Guide</h2>
        {/* TODO: Add visual diagrams for chest, length, shoulder, sleeve */}
        <div className="space-y-4">
          <div>
            <div className="font-semibold">Chest Width</div>
            <img src="/assets/measurements/chest.png" alt="Chest Width" className="w-full h-32 object-contain" />
          </div>
          <div>
            <div className="font-semibold">Length</div>
            <img src="/assets/measurements/length.png" alt="Length" className="w-full h-32 object-contain" />
          </div>
          {/* Add more diagrams as needed */}
        </div>
      </div>
    </div>
  );
};

export default MeasurementGuideModal;
