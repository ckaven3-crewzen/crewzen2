import React from 'react';

// Props for the zoomed image modal
interface EmployeeZoomedImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

// This modal displays a zoomed-in image
const EmployeeZoomedImageModal: React.FC<EmployeeZoomedImageModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80" onClick={onClose}>
      <img
        src={imageUrl}
        alt="Zoomed ID Copy"
        className="max-w-full max-h-[90vh] rounded shadow-lg border-4 border-white"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking the image
      />
      <button
        className="absolute top-4 right-4 text-white text-3xl font-bold bg-black bg-opacity-50 rounded-full px-3 py-1"
        onClick={onClose}
        aria-label="Close zoomed image"
      >
        ×
      </button>
    </div>
  );
};

export default EmployeeZoomedImageModal; 