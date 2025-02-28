import React, { useEffect, useRef } from 'react';

const ChartComponent = ({ displayData, startDate, endDate }) => {
  const chartRef = useRef(null);

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

  return (
    <div className="chart-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartComponent;
