'use client';

import React, { useState, useEffect } from 'react';
import ChartComponent from './ChartComponent';
import SkeletonLoader from './SkeletonLoader';
import CustomDateRangePicker from './CustomDateRangePicker';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface DataVisualProps {
  displayData: any;
  loading?: boolean;
  onFrequencyChange: (freq: string) => void;
  currentFrequency: string;
  onClose: () => void;
}

export default function DataVisual({
  displayData,
  loading = false,
  onFrequencyChange,
  currentFrequency,
  onClose,
}: DataVisualProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [minDate, setMinDate] = useState<Date | undefined>(undefined);
  const [maxDate, setMaxDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (displayData?.data?.time && displayData.data.time.length > 0) {
      const first = new Date(displayData.data.time[0]);
      const last = new Date(displayData.data.time[displayData.data.time.length - 1]);
      setMinDate(first);
      setMaxDate(last);
      setStartDate(first);
      setEndDate(last);
    }
  }, [displayData, currentFrequency]);

  const provName = displayData?.prov_name;
  const kabName = displayData?.kab_name;

  return (
    <aside className={`data-visual ${isMobileExpanded ? 'mobile-expanded' : 'mobile-minimized'}`}>
      {/* Mobile drag / collapse handle */}
      <div
        className="mobile-handle-bar"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
      >
        <div className="mobile-handle-pill" />
        <span className="mobile-handle-title">
          {kabName || provName || 'Region Data'}
        </span>
        {isMobileExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </div>

      {/* Close button */}
      <button
        className="close-button"
        onClick={onClose}
        title="Close & Reset Map"
        aria-label="Close View"
      >
        <X size={24} color="#ffffff" />
      </button>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Header */}
          <div className="header">
            {kabName ? (
              <>
                <h1>{kabName}</h1>
                <h4>{provName}</h4>
                <div className="longlat">
                  {displayData?.latitude && (
                    <span>Lat: {Number(displayData.latitude).toFixed(4)}°</span>
                  )}
                  {displayData?.latitude && displayData?.longitude && <span>|</span>}
                  {displayData?.longitude && (
                    <span>Lng: {Number(displayData.longitude).toFixed(4)}°</span>
                  )}
                </div>
              </>
            ) : provName ? (
              <>
                <h1>{provName}</h1>
                <p className="total-regency">
                  Total Regencies / Cities: <strong>{displayData?.num_kab || 0}</strong>
                </p>
                {displayData?.avgGhi && (
                  <p className="ghi-badge">
                    Avg Annual GHI: <strong>{Number(displayData.avgGhi).toFixed(1)} W/m²</strong>
                  </p>
                )}
              </>
            ) : (
              <div className="header-placeholder">Select a Region</div>
            )}
          </div>

          {/* Historical Data Section */}
          <div className="historical-data">
            <div className="historical-header">
              <h2>Historical Solar Data</h2>
            </div>

            {/* Frequency Selector */}
            <div className="data-frequency">
              <label htmlFor="frequency">Data Frequency: </label>
              <select
                id="frequency"
                value={currentFrequency}
                onChange={(e) => onFrequencyChange(e.target.value)}
              >
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            {/* Custom Date Range Picker */}
            {displayData?.data?.time && (
              <CustomDateRangePicker
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                minDate={minDate}
                maxDate={maxDate}
                frequency={currentFrequency}
              />
            )}

            {/* Chart Component */}
            <ChartComponent
              displayData={displayData}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </>
      )}
    </aside>
  );
}
