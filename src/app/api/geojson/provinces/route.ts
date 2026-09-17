import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let cachedProvincesGeoJSON: any = null;

export async function GET() {
  try {
    if (!cachedProvincesGeoJSON) {
      const filePath = path.join(process.cwd(), 'public', 'geojson', 'prov-37-simplified.geojson');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      cachedProvincesGeoJSON = JSON.parse(fileContent);
    }

    return NextResponse.json(cachedProvincesGeoJSON, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error('Error serving province geojson:', error);
    return NextResponse.json(
      { error: 'Failed to load province boundary data' },
      { status: 500 }
    );
  }
}
