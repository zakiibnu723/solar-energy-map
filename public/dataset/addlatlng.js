import fs from 'fs';


const kabGeoJson = JSON.parse(fs.readFileSync('test.geojson'))

async function getLatLng(location) {
  
  const API_URL = `https://us1.locationiq.com/v1/search?key=pk.3e2d20d7e2fac7f940d17ae2143971ad&q=${location}&format=json&`
  const res = await fetch(API_URL)
  const data = await res.json()
  // console.log(data)

  return {
    lat: data[0].lat,
    lng: data[0].lon
  }
  // return (data)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addLatLngToKab() {
  for (const feature of kabGeoJson.features) {
    const kabupatenName = feature.properties.name;

    try {
        const { lat, lng } = await getLatLng(kabupatenName);
        // Add lat/lng to the properties
        feature.properties.lat = lat;
        feature.properties.lng = lng;

        await delay(1000)
        console.log(kabupatenName + `>> (lat: ${lat}, lng: ${lng})`)
    } catch (error) {
        console.error(`Error fetching lat/lng for ${kabupatenName}:`, error.message);
    }
  }

  // Save the updated GeoJSON
  fs.writeFileSync('../geojson/kab-37.geojson', JSON.stringify(kabGeoJson));
}

addLatLngToKab()

