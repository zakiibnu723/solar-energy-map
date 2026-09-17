'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ProvLayer from './ProvLayer';
import KabLayer from './KabLayer';
import Legend from './Legend';
import DataVisual from '../visual/DataVisual';
import { INDONESIA_BOUNDS, MAP_CENTER } from './mapUtils';

// Fix missing marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// FitBounds controller component
function FitBoundsHandler({ bounds, isIndonesia }: { bounds: any; isIndonesia: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      const isMobile = window.innerWidth <= 768;
      map.flyToBounds(bounds, {
        paddingBottomRight: isIndonesia ? [0, 0] : isMobile ? [0, 200] : [450, 60],
        paddingTopLeft: isIndonesia ? [0, 0] : [20, 20],
        animate: true,
        duration: 1.6,
      });
    }
  }, [bounds, isIndonesia, map]);

  return null;
}

// Listener for user dragging map to auto-hide hero title
function MapMoveListener({ onUserMove }: { onUserMove: () => void }) {
  const map = useMap();

  useEffect(() => {
    const handleMove = () => {
      onUserMove();
    };
    map.on('dragstart', handleMove);
    return () => {
      map.off('dragstart', handleMove);
    };
  }, [map, onUserMove]);

  return null;
}

export default function LeafletMap() {
  const [provGeoData, setProvGeoData] = useState<any>(null);
  const [provGhiMap, setProvGhiMap] = useState<Record<string, number>>({});
  const [kabGeoData, setKabGeoData] = useState<any>(null);
  const [kabGhiMap, setKabGhiMap] = useState<Record<string, number>>({});

  const [selectedProvinceName, setSelectedProvinceName] = useState<string | null>(null);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string | null>(null);

  const [fitBounds, setFitBounds] = useState<any>(null);
  const [isIndonesiaBounds, setIsIndonesiaBounds] = useState<boolean>(true);

  const [displayData, setDisplayData] = useState<any>(null);
  const [dataFrequency, setDataFrequency] = useState<string>('Monthly');
  const [isLoadingVisual, setIsLoadingVisual] = useState<boolean>(false);
  const [showHeader, setShowHeader] = useState<boolean>(true);

  // 1. Initial load: Fetch Province GeoJSON and Province GHI Summary in parallel
  useEffect(() => {
    // Province boundary
    fetch('/api/geojson/provinces')
      .then((res) => res.json())
      .then((data) => setProvGeoData(data))
      .catch((err) => console.error('Error loading province geojson:', err));

    // Province GHI summary (1 single instant call replacing 38 waterfalls)
    fetch('/api/solar/provinces-summary')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.ghiMap) {
          setProvGhiMap(res.ghiMap);
        }
      })
      .catch((err) => console.error('Error loading province GHI summary:', err));
  }, []);

  // Handler when a province is clicked
  const handleSelectProvince = (provName: string, bounds: any) => {
    setShowHeader(false);
    setSelectedProvinceName(provName);
    setSelectedDistrictName(null);
    setFitBounds(bounds);
    setIsIndonesiaBounds(false);
    setIsLoadingVisual(true);

    // Fetch on-demand district GeoJSON for this province (only ~200KB)
    fetch(`/api/geojson/districts?prov=${encodeURIComponent(provName)}`)
      .then((res) => res.json())
      .then((data) => setKabGeoData(data))
      .catch((err) => console.error('Error loading district geojson:', err));

    // Fetch district GHI summary for this province (1 call replacing 25 waterfalls)
    fetch(`/api/solar/districts-summary?prov=${encodeURIComponent(provName)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.ghiMap) {
          setKabGhiMap(res.ghiMap);
        }
      })
      .catch((err) => console.error('Error loading district GHI:', err));

    // Fetch historical solar data for province
    fetch(
      `/api/solar/historical?location=${encodeURIComponent(provName)}&type=PROVINCE&frequency=${dataFrequency}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDisplayData({
            prov_name: provName,
            avgGhi: provGhiMap[provName],
            numKab: kabGeoData?.features?.length || 0,
            data: res.data,
          });
        }
      })
      .catch((err) => console.error('Error loading province solar historical data:', err))
      .finally(() => setIsLoadingVisual(false));
  };

  // Handler when a district is clicked
  const handleSelectDistrict = (districtName: string, lat?: number, lng?: number) => {
    if (!selectedProvinceName) return;

    setSelectedDistrictName(districtName);
    setIsLoadingVisual(true);

    fetch(
      `/api/solar/historical?location=${encodeURIComponent(districtName)}&type=DISTRICT&frequency=${dataFrequency}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDisplayData({
            prov_name: selectedProvinceName,
            kab_name: districtName,
            latitude: lat,
            longitude: lng,
            avgGhi: kabGhiMap[districtName],
            data: res.data,
          });
        }
      })
      .catch((err) => console.error('Error loading district solar historical data:', err))
      .finally(() => setIsLoadingVisual(false));
  };

  // Handler when frequency is changed (Daily, Monthly, Yearly)
  const handleFrequencyChange = (newFreq: string) => {
    setDataFrequency(newFreq);
    setIsLoadingVisual(true);

    const location = selectedDistrictName || selectedProvinceName;
    const type = selectedDistrictName ? 'DISTRICT' : 'PROVINCE';

    if (!location) {
      setIsLoadingVisual(false);
      return;
    }

    fetch(
      `/api/solar/historical?location=${encodeURIComponent(location)}&type=${type}&frequency=${newFreq}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDisplayData((prev: any) => ({
            ...prev,
            data: res.data,
          }));
        }
      })
      .catch((err) => console.error('Error updating frequency solar data:', err))
      .finally(() => setIsLoadingVisual(false));
  };

  // Handler to close & reset map view
  const handleClose = () => {
    setFitBounds(INDONESIA_BOUNDS);
    setIsIndonesiaBounds(true);
    setSelectedProvinceName(null);
    setSelectedDistrictName(null);
    setKabGeoData(null);
    setKabGhiMap({});
    setDisplayData(null);
    setShowHeader(true);
  };

  return (
    <div className="map-wrapper">
      {/* Floating Grand Header: INDONESIA SOLAR ENERGY MAP */}
      <div className={`hero-title-overlay ${showHeader ? 'visible' : 'hidden'}`}>
        <div className="hero-badge">RENEWABLE ENERGY ATLAS</div>
        <h1 className="hero-title">INDONESIA SOLAR ENERGY MAP</h1>
        <p className="hero-subtitle">
          Visualisasi Potensi Radiasi Matahari (GHI, DHI, DNI) Tingkat Provinsi & Kabupaten
        </p>
      </div>

      <MapContainer
        center={MAP_CENTER}
        zoom={5}
        style={{ height: '100vh', width: '100%' }}
        doubleClickZoom={false}
        zoomSnap={0.1}
        className="mapContainer"
      >
        {/* Map interaction listener to slide-up header on pan/drag */}
        <MapMoveListener onUserMove={() => setShowHeader(false)} />

        {/* District choropleth layer (on-demand) */}
        {kabGeoData && (
          <KabLayer
            data={kabGeoData}
            kabGhiMap={kabGhiMap}
            onSelectDistrict={handleSelectDistrict}
            selectedDistrictName={selectedDistrictName}
          />
        )}

        {/* Province choropleth layer */}
        {provGeoData && (
          <ProvLayer
            data={provGeoData}
            provGhiMap={provGhiMap}
            onSelectProvince={handleSelectProvince}
            selectedProvinceName={selectedProvinceName}
          />
        )}

        {/* Automatic smooth pan/zoom handler */}
        {fitBounds && (
          <FitBoundsHandler bounds={fitBounds} isIndonesia={isIndonesiaBounds} />
        )}

        {/* CartoDB Map TileLayers */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="leafletMap"
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="label-map"
          zIndex={2}
        />

        {/* GHI Color Legend */}
        <Legend />
      </MapContainer>

      {/* Cinematic Vignette Shadows */}
      <div className="vignette" />
      {displayData && <div className="vignette2" />}

      {/* HUD Data Visualization Panel */}
      {displayData && (
        <DataVisual
          displayData={displayData}
          loading={isLoadingVisual}
          onFrequencyChange={handleFrequencyChange}
          currentFrequency={dataFrequency}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
