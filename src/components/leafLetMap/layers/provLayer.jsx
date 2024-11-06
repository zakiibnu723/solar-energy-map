import React, { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { fetchGHIData, getColorForGHI } from "./mapUtils";

// ProvLayer component displays province layers on the map with GHI-based coloring.
export default function ProvLayer({ 
    data, 
    setSelectedProvince, 
    setFitBounds, 
    setDisplayProv, 
    lastRemovedLayer
}) {
    const [provGHI, setProvGHI] = useState({}); // State to hold GHI values for provinces.

    // Style function for provinces based on GHI values.
    const provStyle = (feature) => {
        const ghiValue = provGHI[feature.properties.name];
        const fillColor = ghiValue ? getColorForGHI(ghiValue) : 'grey'; // Default color if GHI is not available.
        return {
            fillColor,
            weight: 0.8,
            opacity: 1,
            color: 'darkgrey',
            fillOpacity: 0.8,
        };
    };

    // Fetch GHI data for each province when the component mounts or data updates.
    useEffect(() => {
        const loadGHIData = async () => {
            const ghiData = {};
            for (const feature of data.features) {
                const provName = feature.properties.name;
                const path = `/dataset/Provinsi/${provName}/${provName}_Yearly.json`;
                await fetchGHIData(path, provName, ghiData);
            }
            setProvGHI(ghiData); // Update state with GHI data.
        };

        loadGHIData();
    }, [data]);

    // Highlights a province on mouse hover.
    const highlightFeature = (e) => {
        const layer = e.target;
        layer.setStyle({
            weight: 2,
            color: 'white',
        });
        layer.bringToFront();
    };

    // Resets province highlight style on mouse out.
    const resetHighlight = (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 0.3,
          color: 'darkgrey'
        });
    };

    // Handles interactions for each province feature on the map.
    const onEachProvinceFeature = (feature, layer) => {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: (e) => {
                const prov_name = feature.properties.name;
                setDisplayProv(prov_name); // Display province name on click.
                setSelectedProvince(layer.feature.properties);
                
                const bounds = layer.getBounds();
                setFitBounds(bounds); // Set map bounds to fit clicked province.

                const map = layer._map;
                
                // Handle last removed layer if exists.
                if (lastRemovedLayer.current) {
                    map.addLayer(lastRemovedLayer.current);
                }

                // Add 'nonActive' class to all layers, except the clicked one.
                map.eachLayer((lyr) => {
                    if (lyr._path) {
                        lyr._path.classList.add('nonActive');
                    }
                });

                if (layer._path) {
                    layer._path.classList.remove('nonActive');
                }

                map.removeLayer(layer); // Remove clicked layer.
                lastRemovedLayer.current = layer; // Update last removed layer reference.
                resetHighlight(e); // Reset the highlight.
            },
        });
    };

    return (
        <GeoJSON data={data} style={provStyle} onEachFeature={onEachProvinceFeature} />
    );
}
