import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="skeleton-container">
      <div className="skeleton-pulse skeleton-title"></div>
      <div className="skeleton-pulse skeleton-subtitle"></div>
      <div className="skeleton-pulse skeleton-controls"></div>
      <div className="skeleton-pulse skeleton-chart"></div>
    </div>
  );
}
