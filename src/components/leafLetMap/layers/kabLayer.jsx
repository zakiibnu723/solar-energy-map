import React, { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { fetchGHIData, getColorForGHI } from "./mapUtils";

// KabLayer component displays district layers on the map with GHI-based coloring.
export default function KabLayer({ data, setDisplayKab }) {
    const [kabGHI, setKabGHI] = useState({}); // State to hold GHI values for each district.

    // Style function for districts based on GHI values.
    const kabStyle = (feature) => {
        const ghiValue = kabGHI[feature.properties.name];
        const fillColor = ghiValue ? getColorForGHI(ghiValue) : 'darkgrey';
        return {
            weight: 1,
            opacity: 1,
            color: 'lightgrey',
            fillColor,
            fillOpacity: 1,
        };
    };

    // Fetch GHI data for each district when the component mounts or data updates.
    useEffect(() => {
        const loadGHIData = async () => {
            const ghiData = {};
            for (const feature of data.features) {
                const provName = feature.properties.prov_name;
                const kabName = feature.properties.name;
                const path = `/dataset/Provinsi/${provName}/${kabName}/${kabName}_Yearly.json`;
                await fetchGHIData(path, kabName, ghiData);
            }
            setKabGHI(ghiData); // Update state with GHI data.
        };

        loadGHIData();
    }, [data]);

    // Highlights a district on mouse hover.
    const kabHighlightFeature = (e) => {
        const layer = e.target;
        layer.setStyle({
            weight: 3,
            color: 'white',
        });
        layer.bringToFront();
    };

    // Resets district highlight style on mouse out.
    const kabResetHighlight = (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          color: 'lightgrey',
        });
    };

    // Handles interactions for each district feature on the map.
    const onEachKabFeature = (feature, layer) => {
        layer.bindTooltip(
            `${feature.properties.name}`,
            {
                permanent: false,
                direction: 'center',
                className: 'label-tooltip',
            }
        );
        
        feature.clicked = false;

        layer.on({
            mouseover: (e) => {
                if (!feature.clicked) {
                    kabHighlightFeature(e);
                }
            },
            mouseout: (e) => {
                if (!feature.clicked) {
                    kabResetHighlight(e);
                }
            },
            click: (e) => {
                layer._map.eachLayer((lyr) => {
                    if (lyr.feature && lyr.feature.clicked !== undefined) {
                        lyr.feature.clicked = false;
                        kabResetHighlight({ target: lyr });
                        layer.unbindTooltip();
                        layer.bindTooltip(
                            `${feature.properties.name}`,
                            {
                                permanent: false,
                                direction: 'center',
                                className: 'label-tooltip',
                            }
                        );
                    }
                });

                const prov_name = feature.properties.prov_name;
                const kab_name = feature.properties.name;
                setDisplayKab(prov_name, kab_name); // Set selected district.

                kabHighlightFeature(e);
                feature.clicked = true;

                layer.unbindTooltip();
                layer.bindTooltip(
                    `${feature.properties.name}`,
                    {
                        permanent: true,
                        className: 'label-tooltip',
                    }
                );
            },
        });
    };

    return (
        <GeoJSON key={data?.id} data={data} style={kabStyle} onEachFeature={onEachKabFeature} />
    );
}
