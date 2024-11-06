// FitBoundsHandler.js
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Define Indonesia boundaries for map fitting
const indonesiaBounds = [
  [6.1352, 94.974],  // Top-left corner of Indonesia
  [-11.0076, 141.018]  // Bottom-right corner of Indonesia
];

// Component to control map view based on bounds updates
const FitBoundsHandler = ({ bounds }) => {
  const map = useMap(); // Access the Leaflet map instance

  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, {
        paddingBottomRight: bounds === indonesiaBounds ? [0, 0] : [500, 75],
        paddingTopLeft: bounds === indonesiaBounds ?[0, 0] : [0, 30],
        animate: true,
        duration: 2,
      });
    }
  }, [bounds, map]);

  return null; // No UI elements are rendered by this component
};

export default FitBoundsHandler;
