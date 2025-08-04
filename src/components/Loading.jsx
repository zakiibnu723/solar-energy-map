import React from 'react';
import '../assets/styles/loading.css';

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <div className="loading-text">Loading energy data...</div>
      </div>
    </div>
  );
};

export default Loading;
