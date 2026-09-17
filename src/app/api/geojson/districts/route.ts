import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let cachedAllDistricts: any = null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prov = searchParams.get('prov');

    if (!cachedAllDistricts) {
      const filePath = path.join(process.cwd(), 'public', 'geojson', 'kab-37.geojson');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      cachedAllDistricts = JSON.parse(fileContent);
    }

    if (!prov) {
      // If no province specified, return full data
      return NextResponse.json(cachedAllDistricts);
    }

    const filteredFeatures = (cachedAllDistricts.features || []).filter(
      (feature: any) => feature.properties.prov_name === prov
    );

    const filteredGeoJSON = {
      type: 'FeatureCollection',
      province: prov,
      features: filteredFeatures,
    };

    return NextResponse.json(filteredGeoJSON, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error('Error serving district geojson:', error);
    return NextResponse.json(
      { error: 'Failed to load district boundary data' },
      { status: 500 }
    );
  }
}
