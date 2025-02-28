import React, { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

export default function ProvLayer({ 
    data, 
    setSelectedProvince, 
    setFitBounds, 
    setDisplayProv, 
    lastRemovedLayer
}) {
    const [provGHI, setProvGHI] = useState({}); // State to hold GHI values for provinces

    const provStyle = (feature) => {
        const ghiValue = provGHI[feature.properties.name];
        const fillColor = ghiValue ? getColorForGHI(ghiValue) : 'grey'; // Default color if GHI is not available
        return {
            fillColor,
            weight: 0.8,
            opacity: 1,
            color: 'darkgrey',
            fillOpacity: 0.8,
        };
    };

    const getColorForGHI = (value) => {
        // Define color ranges based on GHI average values
        if (value < 185) return '#00FFFB'; // Yellow for low GHI
        if (value < 190) return '#1AE6F3'; // Orange for moderate GHI
        if (value < 195) return '#33CCEA'; // Orange for moderate GHI
        if (value < 200) return '#4CB3E2'; // Dark orange for high GHI
        if (value < 205) return '#6699D9'; // Dark orange for high GHI
        if (value < 210) return '#8080D1'; // Dark orange for high GHI
        if (value < 215) return '#9966C8'; // Dark orange for high GHI
        if (value < 220) return '#B34DC0'; // Dark orange for high GHI
        if (value < 225) return '#CC33B7'; // Dark orange for high GHI
        if (value < 230) return '#E61AAF'; // Dark orange for high GHI
        return '#FF00A6'; // Red for very high GHI
    };

    useEffect(() => {
        const fetchGHIData = async () => {
            const ghiData = {};
            for (const feature of data.features) {
                const provName = feature.properties.name;
                try {
                    const response = await fetch(`/dataset/Provinsi/${provName}/${provName}_Yearly.json`);
                    const json = await response.json();

                    // Calculate average GHI from shortwave_radiation
                    const shortwaveRadiation = json.data.shortwave_radiation;
                    const avgGHI = shortwaveRadiation.reduce((sum, val) => sum + val, 0) / shortwaveRadiation.length;
                    ghiData[provName] = avgGHI;
                } catch (error) {
                    console.error(`Error fetching data for ${provName}:`, error);
                }
            }
            console.log('ghi: ' +  JSON.stringify(ghiData, null, 2))
            setProvGHI(ghiData); // Set GHI values state
        };

        

        fetchGHIData();
    }, [data]); // Fetch GHI data when the GeoJSON data changes

    const highlightFeature = (e) => {
        const layer = e.target;
        layer.setStyle({
            weight: 2,
            color: 'white',
        });
        layer.bringToFront();
    };

    const resetHighlight = (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 0.3,
          color: 'darkgrey'
        });
    };

    const onEachProvinceFeature = (feature, layer) => {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: (e) => {
                const prov_name = feature.properties.name;
                setDisplayProv(prov_name);
                console.log('prov clicked:', JSON.stringify(feature.properties, null, 2));
                setSelectedProvince(layer.feature.properties);
                const bounds = layer.getBounds();
                setFitBounds(bounds);
                const map = layer._map;

                if (lastRemovedLayer.current) {
                    map.addLayer(lastRemovedLayer.current);
                }

                map.eachLayer((lyr) => {
                    if (lyr._path) {
                        lyr._path.classList.add('nonActive'); // Add nonActive class to all layers
                    }
                });

                // Remove 'nonActive' from the clicked layer
                if (layer._path) {
                    layer._path.classList.remove('nonActive'); // Remove from clicked layer
                }

                map.removeLayer(layer);
                lastRemovedLayer.current = layer;
                resetHighlight(e);
            },
        });
    };

    return (
        <GeoJSON data={data} style={provStyle} onEachFeature={onEachProvinceFeature} />
    );
}
