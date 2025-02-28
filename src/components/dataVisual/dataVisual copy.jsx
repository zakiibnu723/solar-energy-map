import React, { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/colors/teal.css';

export default function DataVisual({ displayData, setDisplayProv, setDisplayKab, dataFrequency }) {
  const chartRef = useRef(null);
  const initialStartDate = new Date(displayData.data.time[0]);
  const initialEndDate = new Date(displayData.data.time[displayData.data.time.length - 1]);

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  useEffect(() => {
    const availableDates = displayData.data.time.map(date => new Date(date));
    const minDate = new Date(Math.min(...availableDates));
    const maxDate = new Date(Math.max(...availableDates));
  
    // Only update the start and end dates if they fall outside the range for the new frequency
    if (startDate < minDate || startDate > maxDate) {
      setStartDate(minDate);
    }
    if (endDate < minDate || endDate > maxDate) {
      setEndDate(maxDate);
    }

    // setStartDate(minDate);
    // setEndDate(maxDate);

  }, [displayData, dataFrequency]);

  useEffect(() => {
    if (!displayData || !window.Chart) return;

    const ctx = chartRef.current.getContext('2d');

    // Extract time and radiation data
    const availableDates = displayData.data.time.map(date => new Date(date));
    const filteredIndices = availableDates
      .map((dateObj, index) => (dateObj >= startDate && dateObj <= endDate ? index : -1))
      .filter(index => index !== -1);
   
    const labels = filteredIndices.map(index => displayData.data.time[index]);
    const shortwaveRadiation = filteredIndices.map(index => displayData.data.shortwave_radiation[index]);
    const difuseRadiation = filteredIndices.map(index => displayData.data.diffuse_radiation[index]);
    const directNormalIrradiance = filteredIndices.map(index => displayData.data.direct_normal_irradiance[index]);
      
    if (window.myChart) {
      window.myChart.destroy();
    }
    window.Chart.defaults.font.size = 12;
    window.myChart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels, // X-axis labels (dates)
        datasets: [
          {
            label: 'Shortwave Solar Radiation (GHI)',
            data: shortwaveRadiation,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 2,
          },
          {
            label: 'Diffuse Solar Radiation (DHI)',
            data: difuseRadiation,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 2,
          },
          {
            label: 'Direct Normal Irradiance (DNI)',
            data: directNormalIrradiance,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 2,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
            },
            ticks: {
              display: true,
              maxTicksLimit: 6,
              beginAtZero: false,
              font: {
                size: 10,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Irradiance (W/m²)',
            },
            ticks: {
              display: true,
              maxTicksLimit: 6,
              beginAtZero: false,
              font: {
                size: 10,
              },
            },
            suggestedMin: 10,
          },
        },
        interaction: {
          mode: 'nearest',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
          },
        },
        hover: {
          mode: 'index',
          intersect: false,
        },
      },
    });

    // Cleanup the chart on component unmount
    return () => {
      if (window.myChart) {
        window.myChart.destroy();
      }
    };
  }, [displayData, startDate, endDate]);

  const prov_name = displayData?.prov_name;
  const kab_name = displayData?.kab_name;

  let header;

  if (kab_name) {
    header = (
      <div className="header">
        <h1>{kab_name}</h1>
        <h4>{prov_name}</h4>
        <div className="longlat">
          <p>Latitude: {displayData?.latitude}</p>
          <p>|</p>
          <p>Longitude: {displayData?.longitude}</p>
        </div>
      </div>
    );
  } else if (prov_name) {
    header = (
      <div className="header">
        <h1>{prov_name}</h1>
        <p>Total Regency: {displayData?.num_kab}</p>
      </div>
    );
  } else {
    header = <div>No data available</div>;
  }

  const handleFrequencyChange = (event) => {
    const newFrequency = event.target.value;
    dataFrequency.current = newFrequency;

    if (kab_name) {
      setDisplayKab(prov_name, kab_name, newFrequency);
    } else {
      setDisplayProv(prov_name, newFrequency);
    }
  };

  // Determine the date picker format and view directly from dataFrequency
  const datePickerFormat = dataFrequency.current === 'Daily' ? "YYYY/MM/DD" : dataFrequency.current === 'Monthly' ? "YYYY/MM" : "YYYY";

  return (
    <div className="data-visual">
      {header}
      <div className="historical-data">
        <h2>Historical Data</h2>
        <div className="data-frequency">
          <label htmlFor="frequency">Select Data Frequency: </label>
          <select id="frequency" value={dataFrequency.current} onChange={handleFrequencyChange}>
            <option value="Daily">Daily</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
        <div className="date-picker">
          <label>Time range: </label>
          <div className="time-range">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              onlyShowInRange={true}
              minDate={initialStartDate}
              maxDate={initialEndDate}
              format={datePickerFormat}
              select={dataFrequency.current === 'Daily'} // Show day picker only for daily frequency
              onlyMonthPicker={dataFrequency.current === 'Monthly'} // Only show month picker for monthly frequency
              onlyYearPicker={dataFrequency.current === 'Yearly'} // Only show year picker for yearly frequency
            />
            <label className="arrow-date">
              <svg viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 512 512"><path d="M160 128.4 192.3 96 352 256 192.3 416 160 383.6 287.3 256z" fill="#ffffff" class="fill-000000"></path></svg>
            </label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              onlyShowInRange={true}
              minDate={initialStartDate}
              maxDate={initialEndDate}
              className='custom-popper'
              format={datePickerFormat}
              select={dataFrequency.current === 'Daily'} // Show day picker only for daily frequency
              onlyMonthPicker={dataFrequency.current === 'Monthly'} // Only show month picker for monthly frequency
              onlyYearPicker={dataFrequency.current === 'Yearly'} // Only show year picker for yearly frequency
            />
          </div>
        </div>
        
        <div className="chart-container">
          <canvas className='chart' ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
