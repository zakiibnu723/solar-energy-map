import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute paths to avoid relative path issues
const provGeoDataPath = path.join(__dirname, '../geojson/prov-37-simplified.geojson');
const kabGeoDataPath = path.join(__dirname, '../geojson/kab-37.geojson');

// Read the geojson data
const provGeoData = JSON.parse(fs.readFileSync(provGeoDataPath, 'utf8'));
const kabGeoData = JSON.parse(fs.readFileSync(kabGeoDataPath, 'utf8'));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDataSet(lat, lng) {
  const API_URL = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2018-01-02&end_date=2024-11-05&hourly=shortwave_radiation,diffuse_radiation,direct_normal_irradiance`;
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.hourly) {
      console.error('Error: "hourly" data not found in response:', data);
      return null;
    }

    const hourlyData = data.hourly;

    function calculateAverages(groupedData) {
      const averageData = {};
      for (const param in hourlyData) {
        if (param === 'time') continue;
        averageData[param] = Object.values(groupedData).map((group) => {
          return group[param].reduce((acc, val) => acc + val, 0) / group[param].length;
        });
      }
      return averageData;
    }

    const dailyGroups = groupBy(hourlyData.time, hourlyData, 'day');
    const monthlyGroups = groupBy(hourlyData.time, hourlyData, 'month');
    const yearlyGroups = groupBy(hourlyData.time, hourlyData, 'year');

    const dailyAverages = calculateAverages(dailyGroups);
    const monthlyAverages = calculateAverages(monthlyGroups);
    const yearlyAverages = calculateAverages(yearlyGroups);

    return {
      dailyData: { time: Object.keys(dailyGroups), ...dailyAverages },
      monthlyData: { time: Object.keys(monthlyGroups), ...monthlyAverages },
      yearlyData: { time: Object.keys(yearlyGroups), ...yearlyAverages },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function dataWriter() {
  if (!fs.existsSync('./Provinsi')) {
    fs.mkdirSync('./Provinsi');
  }

  for (const feature of provGeoData.features) {
    const prov_name = feature.properties.name;

    if (!fs.existsSync('./Provinsi/' + prov_name)) {
      console.log('Creating folder for:', prov_name);
      fs.mkdirSync('./Provinsi/' + prov_name, { recursive: true });

      const filteredKabGeoData = kabGeoData
        ? {
            type: 'FeatureCollection',
            features: kabGeoData.features.filter(
              (feature) => feature.properties.prov_name === prov_name
            ),
          }
        : null;

      for (const feature of filteredKabGeoData.features) {
        const kab_name = feature.properties.name;
        const kab_lat = feature.properties.lat;
        const kab_lng = feature.properties.lng;

        let kabDataSet = null;

        // Retry mechanism
        while (!kabDataSet) {
          kabDataSet = await getDataSet(kab_lat, kab_lng);
          if (!kabDataSet) {
            console.log(`Retrying data fetch for ${kab_name} in ${prov_name}...`);
            await delay(5000);  // Wait 5 seconds before retrying
          }
        }

        const kab_Path = `./Provinsi/${prov_name}/${kab_name}`;
        fs.mkdirSync(kab_Path, { recursive: true });

        const metadata = {
          kab_name,
          prov_name,
          latitude: kab_lat,
          longitude: kab_lng,
        };

        const dailyFileContent = {
          ...metadata,
          data: kabDataSet.dailyData,
        };
        const monthlyFileContent = {
          ...metadata,
          data: kabDataSet.monthlyData,
        };
        const yearlyFileContent = {
          ...metadata,
          data: kabDataSet.yearlyData,
        };

        fs.writeFileSync(kab_Path + `/${kab_name}_Daily.json`, JSON.stringify(dailyFileContent, null, 2));
        fs.writeFileSync(kab_Path + `/${kab_name}_Monthly.json`, JSON.stringify(monthlyFileContent, null, 2));
        fs.writeFileSync(kab_Path + `/${kab_name}_Yearly.json`, JSON.stringify(yearlyFileContent, null, 2));

        console.log(`Data saved for ${kab_name} in ${prov_name}`);
      }
    }
  }
}

// Run the function
dataWriter();

function groupBy(timeArray, hourlyData, period) {
  const groupedData = {};

  for (let i = 0; i < timeArray.length; i++) {
    const date = new Date(timeArray[i]);
    let key;

    if (period === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'month') {
      key = date.toISOString().split('T')[0].slice(0, 7);
    } else if (period === 'year') {
      key = date.getFullYear();
    }

    if (!groupedData[key]) {
      groupedData[key] = { time: [] };
      for (const param in hourlyData) {
        if (param !== 'time') {
          groupedData[key][param] = [];
        }
      }
    }

    groupedData[key].time.push(timeArray[i]);
    for (const param in hourlyData) {
      if (param === 'time') continue;
      groupedData[key][param].push(hourlyData[param][i]);
    }
  }

  return groupedData;
}
