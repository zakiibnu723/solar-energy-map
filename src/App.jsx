// src/App.js
import React, { useEffect, useRef, useState } from 'react';

import LeafletMap from './components/leafLetMap/leafletMap';
import DataVisual from './components/dataVisual/dataVisual';
import Loading from './components/Loading';


function App() {
  const [displayData, setDisplayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dataFrequency = useRef('Monthly')


  const setDisplayProv = (prov_name, frequency = dataFrequency.current) => {
    fetchData(`Provinsi/${prov_name}/${prov_name}`, frequency);
  };

  const setDisplayKab = (prov_name, kab_name, frequency = dataFrequency.current) => {
    fetchData(`Provinsi/${prov_name}/${kab_name}/${kab_name}`, frequency);
  };

  const fetchData = (path, frequency) => {
    console.log(`Fetching ${frequency} data from ${path}`);
    setIsLoading(true);
    fetch(`/dataset/${path}_${frequency}.json`)
      .then((response) => response.json())
      .then((data) => {
        setDisplayData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading GeoJSON data:', error);
        setIsLoading(false);
      });
  };

  return (
    <div className="App">
      {isLoading && <Loading />}
      {displayData &&
          <DataVisual 
            displayData={displayData} 
            setDisplayProv={setDisplayProv} 
            setDisplayKab={setDisplayKab}  
            dataFrequency={dataFrequency}
            // setDataFrequency={setDataFrequency}
          /> 
      }
      <LeafletMap displayData={displayData} setDisplayData={setDisplayData} setDisplayProv={setDisplayProv} setDisplayKab={setDisplayKab} />
      {/* <div className="vignette2"></div> */}
    </div>
  );
}

export default App;
