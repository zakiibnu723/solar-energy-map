'use client';

import React from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/colors/teal.css';

interface CustomDateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  minDate: Date | undefined;
  maxDate: Date | undefined;
  frequency: string; // 'Daily' | 'Monthly' | 'Yearly'
}

export default function CustomDateRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  minDate,
  maxDate,
  frequency,
}: CustomDateRangePickerProps) {
  const datePickerFormat =
    frequency === 'Daily'
      ? 'YYYY/MM/DD'
      : frequency === 'Monthly'
      ? 'YYYY/MM'
      : 'YYYY';

  const handleStartChange = (val: any) => {
    if (val && val.toDate) {
      setStartDate(val.toDate());
    } else if (val instanceof Date) {
      setStartDate(val);
    }
  };

  const handleEndChange = (val: any) => {
    if (val && val.toDate) {
      setEndDate(val.toDate());
    } else if (val instanceof Date) {
      setEndDate(val);
    }
  };

  return (
    <div className="date-picker">
      <label>Time range: </label>
      <div className="time-range" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DatePicker
          value={startDate}
          onChange={handleStartChange}
          onlyShowInRangeDates={true}
          minDate={minDate}
          maxDate={endDate || maxDate}
          format={datePickerFormat}
          onlyMonthPicker={frequency === 'Monthly'}
          onlyYearPicker={frequency === 'Yearly'}
          className="custom-popper"
        />
        <label className="arrow-date">
          <svg viewBox="0 0 512 512" style={{ width: '10px', height: '10px' }} xmlns="http://www.w3.org/2000/svg">
            <path d="M160 128.4 192.3 96 352 256 192.3 416 160 383.6 287.3 256z" fill="#ffffff"></path>
          </svg>
        </label>
        <DatePicker
          value={endDate}
          onChange={handleEndChange}
          onlyShowInRangeDates={true}
          minDate={startDate || minDate}
          maxDate={maxDate}
          className="custom-popper"
          format={datePickerFormat}
          onlyMonthPicker={frequency === 'Monthly'}
          onlyYearPicker={frequency === 'Yearly'}
        />
      </div>
    </div>
  );
}
