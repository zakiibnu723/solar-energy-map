import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import KabLayer from './layers/kabLayer';
import ProvLayer from './layers/provLayer';

// Fix for missing marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Legend component to display color scale for GHI values
const Legend = () => {
  const grades = [185, 190, 195, 200, 205, 210, 215, 220, 225, 230];
  const getColorForGHI = (value) => {
    if (value < 185) return '#00FFFB';
    if (value < 190) return '#1AE6F3';
    if (value < 195) return '#33CCEA';
    if (value < 200) return '#4CB3E2';
    if (value < 205) return '#6699D9';
    if (value < 210) return '#8080D1';
    if (value < 215) return '#9966C8';
    if (value < 220) return '#B34DC0';
    if (value < 225) return '#CC33B7';
    if (value < 230) return '#E61AAF';
    return '#FF00A6';
  };

  return (
    <div className="legend">
      <h4>GHI Color Scale</h4>
      {grades.map((grade, index) => (
        <div key={index} className="legend-item">
          <i
            style={{
              backgroundColor: getColorForGHI(grade),
              display: 'inline-block',
              width: '20px',
              height: '20px',
              marginRight: '8px',
            }}
          ></i>
          {grade}+
        </div>
      ))}
    </div>
  );
};

// Indonesia map boundaries
const indonesiaBounds = [
  [6.1352, 94.974],  // Top-left corner (north-west point of Indonesia)
  [-11.0076, 141.018]  // Bottom-right corner (south-east point of Indonesia)
];

// Component to handle automatic map bounds fitting
const FitBoundsHandler = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, {
        paddingBottomRight: bounds === indonesiaBounds ? [0, 0] : [500, 75],
        paddingTopLeft: bounds === indonesiaBounds ? [0, 0] : [0, 30],
        animate: true,
        duration: 2,
      });
    }
  }, [bounds, map]);

  return null; // No visible UI
};

const LeafletMap = ({ displayData, setDisplayData, setDisplayProv, setDisplayKab }) => {
  const [provGeoData, setProvGeoData] = useState(null);
  const [kabGeoData, setKabGeoData] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [fitBounds, setFitBounds] = useState(null); // Track map bounds for fitBounds
  const mapRef = useRef();
  const lastRemovedLayer = useRef(null);

  // Fetch GeoJSON data for provinces
  useEffect(() => {
    fetch('/geojson/prov-37-simplified.geojson')
      .then((response) => response.json())
      .then((data) => setProvGeoData(data))
      .catch((error) => console.error('Error loading GeoJSON data:', error));
  }, []);

  // Fetch GeoJSON data for regions (kabupaten)
  useEffect(() => {
    fetch('/geojson/kab-37.geojson')
      .then((response) => response.json())
      .then((data) => setKabGeoData(data))
      .catch((error) => console.error('Error loading GeoJSON data:', error));
  }, []);

  // Filter kabGeoData based on selected province
  const filteredKabGeoData = kabGeoData
    ? {
        type: 'FeatureCollection',
        id: selectedProvince?.uuid,
        features: kabGeoData.features.filter(
          (feature) => feature.properties.prov_name === selectedProvince?.name
        ),
      }
    : null;

  useEffect(() => {
    console.log("Filtered kab geo data:", filteredKabGeoData);
  }, [selectedProvince]);

  // Handler to reset map view and selection state
  const closeHandler = () => {
    setFitBounds(indonesiaBounds);
    setSelectedProvince(null);
    setDisplayData(null);
    setDisplayProv(null);
    setDisplayKab(null);

    // Reapply layer styles if necessary
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer._path) {
          layer._path.classList.remove('nonActive');
        }
      });
      mapRef.current.addLayer(lastRemovedLayer.current);
    }
  };

  return (
    <>
      <MapContainer
        ref={mapRef}
        center={[-2.5489, 118.0149]} // Center of Indonesia
        zoom={5}
        style={{ height: '100vh', width: '100%' }}
        doubleClickZoom={false}
        zoomSnap={0.1}
        className="mapContainer"
      >
        {kabGeoData && (
          <KabLayer data={filteredKabGeoData} setDisplayKab={setDisplayKab} />
        )}
        {provGeoData && (
          <ProvLayer
            data={provGeoData}
            setSelectedProvince={setSelectedProvince}
            setFitBounds={setFitBounds}
            filteredKabGeoData={filteredKabGeoData}
            setDisplayProv={setDisplayProv}
            lastRemovedLayer={lastRemovedLayer}
          />
        )}

        {/* FitBoundsHandler to automatically adjust map view */}
        {fitBounds && <FitBoundsHandler bounds={fitBounds} />}

        {/* Map TileLayers for background and labels */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="leafletMap"
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="label-map"
          zIndex={1}
        />

        {/* Legend for color scale information */}
        <Legend />

        {/* Close button to reset map view */}
        {displayData && (
          <>
            <button className="close-button" onClick={closeHandler}>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="m7 7 18 18M7 25 25 7" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2px" className="stroke-000000"></path>
              </svg>
            </button>
            <div className="vignette2"></div>
          </>
        )}
      </MapContainer>
    </>
  );
};

export default LeafletMap;
