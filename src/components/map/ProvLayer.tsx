'use client';

import React from 'react';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { getColorForGHI } from './mapUtils';

interface ProvLayerProps {
  data: any;
  provGhiMap: Record<string, number>;
  onSelectProvince: (provName: string, bounds: any, layer: any) => void;
  selectedProvinceName: string | null;
}

export default function ProvLayer({
  data,
  provGhiMap,
  onSelectProvince,
  selectedProvinceName,
}: ProvLayerProps) {
  const provStyle = (feature: any) => {
    const provName = feature?.properties?.name;
    const isSelected = selectedProvinceName === provName;
    const isOtherSelected = selectedProvinceName && !isSelected;

    const ghiValue = provGhiMap[provName];
    const fillColor = ghiValue ? getColorForGHI(ghiValue) : '#555555';

    return {
      fillColor,
      weight: isSelected ? 2 : 0.9,
      opacity: 1,
      color: isSelected ? '#ffffff' : '#a8a8a8',
      fillOpacity: isOtherSelected ? 0.15 : 0.85,
      className: isOtherSelected ? 'nonActive' : '',
    };
  };

  const highlightFeature = (e: any) => {
    const layer = e.target;
    layer.setStyle({
      weight: 2.2,
      color: '#ffffff',
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  };

  const resetHighlight = (e: any) => {
    const layer = e.target;
    layer.setStyle({
      weight: 0.9,
      color: '#a8a8a8',
    });
  };

  const onEachProvinceFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: (e: any) => {
        const provName = feature.properties.name;
        const bounds = layer.getBounds();
        onSelectProvince(provName, bounds, layer);
      },
    });
  };

  return (
    <GeoJSON
      key={selectedProvinceName ? `prov-${selectedProvinceName}` : 'prov-all'}
      data={data}
      style={provStyle}
      onEachFeature={onEachProvinceFeature}
    />
  );
}
