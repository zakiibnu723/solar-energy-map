'use client';

import React from 'react';
import { GHI_GRADES, getColorForGHI } from './mapUtils';

export default function Legend() {
  return (
    <div className="legend">
      <h4>GHI Scale (W/m²)</h4>
      <div className="legend-items-grid">
        {GHI_GRADES.map((grade, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-color-box"
              style={{
                backgroundColor: getColorForGHI(grade),
              }}
            />
            <span className="legend-label">{grade}+</span>
          </div>
        ))}
      </div>
    </div>
  );
}
