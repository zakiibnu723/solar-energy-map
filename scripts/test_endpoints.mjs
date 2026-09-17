async function test() {
  const endpoints = [
    'http://localhost:3000/',
    'http://localhost:3000/api/solar/provinces-summary',
    'http://localhost:3000/api/solar/districts-summary?prov=JAWA%20BARAT',
    'http://localhost:3000/api/solar/historical?location=JAWA%20BARAT&type=PROVINCE&frequency=Monthly',
    'http://localhost:3000/api/geojson/provinces',
    'http://localhost:3000/api/geojson/districts?prov=JAWA%20BARAT',
  ];

  console.log('Testing Next.js full-stack endpoints...\n');

  for (const url of endpoints) {
    try {
      const start = Date.now();
      const res = await fetch(url);
      const elapsed = Date.now() - start;
      console.log(`[${res.status}] ${elapsed}ms -> ${url}`);
      if (url.includes('/api/solar/provinces-summary')) {
        const json = await res.json();
        console.log(`   Provinces Count: ${json.data?.length}, Sample GHI for ACEH: ${json.ghiMap?.ACEH}`);
      }
      if (url.includes('/api/solar/districts-summary')) {
        const json = await res.json();
        console.log(`   Districts in JABAR: ${json.data?.length}, Sample GHI for BANDUNG: ${json.ghiMap?.['BANDUNG'] || json.data?.[0]?.name}`);
      }
      if (url.includes('/api/solar/historical')) {
        const json = await res.json();
        console.log(`   Historical Records: ${json.data?.time?.length} points`);
      }
      if (url.includes('/api/geojson/districts')) {
        const json = await res.json();
        console.log(`   Features Count: ${json.features?.length} district boundaries`);
      }
    } catch (err) {
      console.error(`FAILED: ${url}`, err.message);
    }
  }
}

test();
