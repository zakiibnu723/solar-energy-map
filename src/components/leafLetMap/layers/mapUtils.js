// mapUtils.js
// Utility functions for fetching and calculating GHI (Global Horizontal Irradiance) data.

// Fetch and calculate the average GHI for a specific province or district.
export const fetchGHIData = async (path, name, ghiData) => {
  try {
      const response = await fetch(path);
      const json = await response.json();

      // Calculate the average GHI from shortwave_radiation array.
      const shortwaveRadiation = json.data.shortwave_radiation;
      const avgGHI = shortwaveRadiation.reduce((sum, val) => sum + val, 0) / shortwaveRadiation.length;
      ghiData[name] = avgGHI;
  } catch (error) {
      console.error(`Error fetching data for ${name}:`, error);
  }
};

// Define color based on the GHI value range to visualize data intensity.
export const getColorForGHI = (value) => {
  if (value < 185) return '#00FFFB'; // Very low GHI
  if (value < 190) return '#1AE6F3';
  if (value < 195) return '#33CCEA';
  if (value < 200) return '#4CB3E2';
  if (value < 205) return '#6699D9';
  if (value < 210) return '#8080D1';
  if (value < 215) return '#9966C8';
  if (value < 220) return '#B34DC0';
  if (value < 225) return '#CC33B7';
  if (value < 230) return '#E61AAF';
  return '#FF00A6'; // Highest GHI level
};
