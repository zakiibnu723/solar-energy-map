'use client';

import React from 'react';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { getColorForGHI } from './mapUtils';

interface KabLayerProps {
  data: any;
  kabGhiMap: Record<string, number>;
  onSelectDistrict: (districtName: string, lat?: number, lng?: number) => void;
  selectedDistrictName: string | null;
}

export default function KabLayer({
  data,
  kabGhiMap,
  onSelectDistrict,
  selectedDistrictName,
}: KabLayerProps) {
  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  const kabStyle = (feature: any) => {
    const kabName = feature?.properties?.name;
    const isSelected = selectedDistrictName === kabName;
    const ghiValue = kabGhiMap[kabName];
    const fillColor = ghiValue ? getColorForGHI(ghiValue) : '#777777';

    return {
      weight: isSelected ? 2.5 : 1,
      opacity: 1,
      color: isSelected ? '#ffffff' : '#d0d0d0',
      fillColor,
      fillOpacity: isSelected ? 1 : 0.85,
    };
  };

  const kabHighlightFeature = (layer: any) => {
    layer.setStyle({
      weight: 2.8,
      color: '#ffffff',
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  };

  const kabResetHighlight = (layer: any, feature: any) => {
    const isSelected = selectedDistrictName === feature?.properties?.name;
    layer.setStyle({
      weight: isSelected ? 2.5 : 1,
      color: isSelected ? '#ffffff' : '#d0d0d0',
    });
  };

  const onEachKabFeature = (feature: any, layer: any) => {
    const kabName = feature?.properties?.name;
    const isSelected = selectedDistrictName === kabName;

    layer.bindTooltip(`${kabName}`, {
      permanent: isSelected,
      direction: 'center',
      className: 'label-tooltip',
    });

    layer.on({
      mouseover: () => {
        kabHighlightFeature(layer);
      },
      mouseout: () => {
        kabResetHighlight(layer, feature);
      },
      click: () => {
        const lat = feature?.properties?.lat ? Number(feature.properties.lat) : undefined;
        const lng = feature?.properties?.lng ? Number(feature.properties.lng) : undefined;
        onSelectDistrict(kabName, lat, lng);
      },
    });
  };

  return (
    <GeoJSON
      key={data.province || 'kab-layer'}
      data={data}
      style={kabStyle}
      onEachFeature={onEachKabFeature}
    />
  );
}
