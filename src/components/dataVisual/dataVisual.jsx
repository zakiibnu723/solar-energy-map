import React, { useEffect, useRef, useState } from 'react';
import Header from './header';
import FrequencySelector from './frequencySelector';
import DateRangePicker from './dateRangePicker';
import ChartComponent from './chartComponent';

export default function DiagramView({ displayData, setDisplayProv, setDisplayKab, dataFrequency }) {
  const initialStartDate = new Date(displayData.data.time[0]);
  const initialEndDate = new Date(displayData.data.time[displayData.data.time.length - 1]);

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  useEffect(() => {
    // const availableDates = displayData.data.time.map(date => new Date(date));
    // const minDate = new Date(Math.min(...availableDates));
    // const maxDate = new Date(Math.max(...availableDates));
    
    setStartDate(startDate);
    setEndDate(endDate);
  }, [displayData]);

  const handleFrequencyChange = (newFrequency) => {
    dataFrequency.current = newFrequency;
    if (displayData?.kab_name) {
      setDisplayKab(displayData.prov_name, displayData.kab_name, newFrequency);
    } else {
      setDisplayProv(displayData.prov_name, newFrequency);
    }
  };

  const datePickerFormat = dataFrequency.current === 'Daily' ? "YYYY/MM/DD" : dataFrequency.current === 'Monthly' ? "YYYY/MM" : "YYYY";

  return (
    <div className="data-visual">
      <Header displayData={displayData} />
      <div className="historical-data">
        <h2>Historical Data</h2>
        <FrequencySelector dataFrequency={dataFrequency} onFrequencyChange={handleFrequencyChange} />
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          initialStartDate={initialStartDate}
          initialEndDate={initialEndDate}
          datePickerFormat={datePickerFormat}
          dataFrequency={dataFrequency}
        />
        <ChartComponent displayData={displayData} startDate={startDate} endDate={endDate} />
        <div className="vignette2"></div>
      </div>
    </div>
  );
}
