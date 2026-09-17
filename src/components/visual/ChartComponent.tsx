'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components cleanly without window.Chart globals
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartComponentProps {
  displayData: any;
  startDate?: Date;
  endDate?: Date;
}

export default function ChartComponent({ displayData, startDate, endDate }: ChartComponentProps) {
  if (!displayData || !displayData.data || !displayData.data.time) {
    return <div className="no-chart-data">No historical data available</div>;
  }

  const times: string[] = displayData.data.time;
  const shortwave: number[] = displayData.data.shortwave_radiation || [];
  const diffuse: number[] = displayData.data.diffuse_radiation || [];
  const direct: number[] = displayData.data.direct_normal_irradiance || [];

  // Filter indices based on startDate and endDate if provided
  let filteredIndices: number[] = [];
  if (startDate && endDate) {
    filteredIndices = times
      .map((dateStr, idx) => {
        const d = new Date(dateStr);
        return d >= startDate && d <= endDate ? idx : -1;
      })
      .filter((idx) => idx !== -1);
  } else {
    filteredIndices = times.map((_, idx) => idx);
  }

  const labels = filteredIndices.map((idx) => times[idx]);
  const shortwaveData = filteredIndices.map((idx) => shortwave[idx]);
  const diffuseData = filteredIndices.map((idx) => diffuse[idx]);
  const directData = filteredIndices.map((idx) => direct[idx]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Shortwave Radiation (GHI)',
        data: shortwaveData,
        borderColor: 'rgba(0, 255, 251, 0.9)',
        backgroundColor: 'rgba(0, 255, 251, 0.15)',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.2,
      },
      {
        label: 'Diffuse Radiation (DHI)',
        data: diffuseData,
        borderColor: 'rgba(153, 102, 255, 0.9)',
        backgroundColor: 'rgba(153, 102, 255, 0.15)',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.2,
      },
      {
        label: 'Direct Normal Irradiance (DNI)',
        data: directData,
        borderColor: 'rgba(255, 0, 166, 0.9)',
        backgroundColor: 'rgba(255, 0, 166, 0.15)',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#e0e0e0',
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#8e8e93',
          font: { family: 'inherit', size: 11 },
        },
        ticks: {
          maxTicksLimit: 6,
          color: '#8e8e93',
          font: { family: 'inherit', size: 10 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Irradiance (W/m²)',
          color: '#8e8e93',
          font: { family: 'inherit', size: 11 },
        },
        ticks: {
          maxTicksLimit: 6,
          color: '#8e8e93',
          font: { family: 'inherit', size: 10 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        suggestedMin: 10,
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cfcfcf',
          boxWidth: 12,
          font: { size: 11, family: 'inherit' },
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(20, 20, 25, 0.9)',
        titleColor: '#00FFFB',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  return (
    <div className="chart-container" style={{ position: 'relative', width: '100%', height: '240px' }}>
      <Line data={data} options={options} />
    </div>
  );
}
