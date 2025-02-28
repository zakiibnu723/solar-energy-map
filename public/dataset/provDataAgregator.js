import fs from 'fs';
import path from 'path';

const provFolderPath = './Provinsi';

// Function to read data from kabupaten files and aggregate it
function aggregateProvinceData(provName) {
  const provPath = path.join(provFolderPath, provName);
  const kabFolders = fs.readdirSync(provPath).filter(file => fs.lstatSync(path.join(provPath, file)).isDirectory());

  const dailyDataList = [];
  const monthlyDataList = [];
  const yearlyDataList = [];

  kabFolders.forEach(kabFolder => {
    const kabDailyPath = path.join(provPath, kabFolder, `${kabFolder}_Daily.json`);
    const kabMonthlyPath = path.join(provPath, kabFolder, `${kabFolder}_Monthly.json`);
    const kabYearlyPath = path.join(provPath, kabFolder, `${kabFolder}_Yearly.json`);

    // Read and parse the data from each kabupaten's daily, monthly, and yearly files
    const kabDailyData = JSON.parse(fs.readFileSync(kabDailyPath, 'utf8')).data;
    const kabMonthlyData = JSON.parse(fs.readFileSync(kabMonthlyPath, 'utf8')).data;
    const kabYearlyData = JSON.parse(fs.readFileSync(kabYearlyPath, 'utf8')).data;

    dailyDataList.push(kabDailyData);
    monthlyDataList.push(kabMonthlyData);
    yearlyDataList.push(kabYearlyData);
  });

  // Aggregate the kabupaten data into province-level data
  const aggregatedDailyData = aggregateData(dailyDataList, 'daily');
  const aggregatedMonthlyData = aggregateData(monthlyDataList, 'monthly');
  const aggregatedYearlyData = aggregateData(yearlyDataList, 'yearly');

  // Save aggregated data into separate files
  saveAggregatedData(provPath, provName, aggregatedDailyData, aggregatedMonthlyData, aggregatedYearlyData, kabFolders.length);
}

// Function to aggregate data from multiple kabupaten
// Function to aggregate data from multiple kabupaten
// Function to aggregate data from multiple kabupaten
function aggregateData(dataList, aggregationType) {
  const aggregatedData = {};
  let timeData = [];

  // Assume that all data sets have the same length
  const dataLength = Object.keys(dataList[0])[0].length;

  // Initialize each param in the aggregated data
  for (const param in dataList[0]) {
    aggregatedData[param] = [];
  }

  // Sum up data for all kabupaten
  dataList.forEach((data, index) => {
    if (index === 0) {
      // Set time data based on aggregation type
      timeData = data.time;
    }

    for (const param in data) {
      if (param !== 'time') { // Skip the time field during numeric aggregation
        const values = data[param];

        // Use valid values only for aggregation
        values.forEach((value, idx) => {
          if (value !== null) {
            if (!aggregatedData[param][idx]) {
              aggregatedData[param][idx] = 0; // Initialize to 0 if not already set
            }
            aggregatedData[param][idx] += value; // Aggregate only valid values
          } else {
            // Handle null values: you can choose to either ignore or add zero
            if (!aggregatedData[param][idx]) {
              aggregatedData[param][idx] = 0; // Initialize to 0 if not already set
            }
          }
        });
      }
    }
  });

  // Calculate the average for each parameter if aggregationType is monthly or yearly
  const numKab = dataList.length;
  for (const param in aggregatedData) {
    // If the length of aggregatedData[param] is greater than 0, calculate the average
    if (aggregatedData[param].length > 0) {
      aggregatedData[param] = aggregatedData[param].map(value => value / numKab);
    }
  }

  // Return the aggregated data with the original time field integrated into the data
  return { data: { ...aggregatedData, time: timeData } }; // Include time inside data
}




// Function to save the aggregated province data to files, including time
function saveAggregatedData(provPath, provName, dailyData, monthlyData, yearlyData, numKab) {
  const provMetadata = {
    prov_name: provName,
    num_kab: numKab,
    aggregated: true,
  };

  // Save the data with metadata
  fs.writeFileSync(`${provPath}/${provName}_Daily.json`, JSON.stringify({ ...provMetadata, data: dailyData.data }, null, 2));
  fs.writeFileSync(`${provPath}/${provName}_Monthly.json`, JSON.stringify({ ...provMetadata, data: monthlyData.data }, null, 2));
  fs.writeFileSync(`${provPath}/${provName}_Yearly.json`, JSON.stringify({ ...provMetadata, data: yearlyData.data }, null, 2));

  console.log(`Aggregated data saved for province: ${provName}`);
}

// Function to loop through all provinces and aggregate their data
function processProvinces() {
  const provinces = fs.readdirSync(provFolderPath).filter(file => fs.lstatSync(path.join(provFolderPath, file)).isDirectory());

  provinces.forEach(provName => {
    aggregateProvinceData(provName);
  });
}

// Run the aggregation process for all provinces
processProvinces();
