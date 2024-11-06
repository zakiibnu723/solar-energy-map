// Legend.js
import React from 'react';

// Color legend component for GHI values
const Legend = () => {
  const grades = [185, 190, 195, 200, 205, 210, 215, 220, 225, 230];

  // Function to get the color based on the GHI value
  const getColorForGHI = (value) => {
    if (value < 185) return '#00FFFB';
    if (value < 190) return '#1AE6F3';
    if (value < 195) return '#33CCEA';
    if (value < 200) return '#4CB3E2';
    if (value < 205) return '#6699D9';
    if (value < 210) return '#8080D1';
    if (value < 215) return '#9966C8';
    if (value < 220) return '#B34DC0';
    if (value < 225) return '#CC33B7';
    if (value < 230) return '#E61AAF';
    return '#FF00A6';
  };

  return (
    <div className="legend">
      <h4>GHI Color Scale</h4>
      {grades.map((grade, index) => (
        <div key={index} className="legend-item">
          <i
            style={{
              backgroundColor: getColorForGHI(grade),
              display: 'inline-block',
              width: '20px',
              height: '20px',
              marginRight: '8px',
            }}
          ></i>
          {grade}+
        </div>
      ))}
    </div>
  );
};

export default Legend;
