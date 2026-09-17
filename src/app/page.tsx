'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import for Leaflet map component with SSR disabled
const LeafletMap = dynamic(
  () => import('@/components/map/LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(0, 255, 251, 0.2)',
            borderTopColor: '#00fffb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#00fffb', fontSize: '14px', letterSpacing: '1px' }}>
          LOADING INDONESIA SOLAR MAP...
        </p>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main>
      <LeafletMap />
    </main>
  );
}
