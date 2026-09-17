// Color scale mapping for GHI (Global Horizontal Irradiance) values in W/m²
export const GHI_GRADES = [185, 190, 195, 200, 205, 210, 215, 220, 225, 230];

export const getColorForGHI = (value: number): string => {
  if (value < 185) return '#00FFFB'; // Cyan / Teal
  if (value < 190) return '#1AE6F3';
  if (value < 195) return '#33CCEA';
  if (value < 200) return '#4CB3E2';
  if (value < 205) return '#6699D9';
  if (value < 210) return '#8080D1';
  if (value < 215) return '#9966C8';
  if (value < 220) return '#B34DC0';
  if (value < 225) return '#CC33B7';
  if (value < 230) return '#E61AAF';
  return '#FF00A6'; // Deep Magenta / Pink
};

// Indonesia bounding coordinates [North-West, South-East]
export const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [6.1352, 94.974],
  [-11.0076, 141.018],
];

export const MAP_CENTER: [number, number] = [-2.5489, 118.0149];
