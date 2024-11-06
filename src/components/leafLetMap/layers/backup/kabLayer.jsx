import React, { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

export default function KabLayer({ data, setDisplayKab }) {
    const [kabGHI, setKabGHI] = useState({}); // State to hold GHI values for each district

    const kabStyle = (feature) => {
        const ghiValue = kabGHI[feature.properties.name];
        const fillColor = ghiValue ? getColorForGHI(ghiValue) : 'darkgrey'; // Default color if GHI is not available
        return {
            weight: 1,
            opacity: 1,
            color: 'lightgrey',
            fillColor,
            fillOpacity: 1,
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
                const provName = feature.properties.prov_name;
                const kabName = feature.properties.name;
                try {
                    const response = await fetch(`/dataset/Provinsi/${provName}/${kabName}/${kabName}_Yearly.json`);
                    const json = await response.json();

                    // Calculate average GHI from shortwave_radiation
                    const shortwaveRadiation = json.data.shortwave_radiation;
                    const avgGHI = shortwaveRadiation.reduce((sum, val) => sum + val, 0) / shortwaveRadiation.length;
                    ghiData[kabName] = avgGHI;
                } catch (error) {
                    console.error(`Error fetching data for ${kabName}:`, error);
                }
            }
            setKabGHI(ghiData); // Set GHI values state for districts
        };

        fetchGHIData();
    }, [data]); // Fetch GHI data when the GeoJSON data changes

    const kabHighlightFeature = (e) => {
        const layer = e.target;
        layer.setStyle({
            weight: 3,
            color: 'white',
        });
        layer.bringToFront();
    };

    const kabResetHighlight = (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          color: 'lightgrey',
        });
    };

    const onEachKabFeature = (feature, layer) => {
        const featureLatLng = {
            lat: feature.properties.lat,
            lng: feature.properties.lng,
        };

        // Bind tooltip with kab_name (district name)
        layer.bindTooltip(
            `${feature.properties.name}`,
            {
                permanent: false,
                direction: 'center',
                className: 'label-tooltip',
            }
        );
        feature.clicked = false; // Add a flag to track if clicked

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
                setDisplayKab(prov_name, kab_name);

                kabHighlightFeature(e);
                feature.clicked = true;
                console.log('kab clicked: ' + JSON.stringify(feature.properties, null, 2));

                layer.unbindTooltip(); // Unbind the existing tooltip
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
