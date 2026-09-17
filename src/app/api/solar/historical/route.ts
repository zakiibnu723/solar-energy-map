import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location'); // prov_name or kab_name
    const type = searchParams.get('type') || 'PROVINCE'; // "PROVINCE" or "DISTRICT"
    const frequency = searchParams.get('frequency') || 'Monthly'; // "Daily", "Monthly", "Yearly"
    const startDateStr = searchParams.get('start');
    const endDateStr = searchParams.get('end');

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location name is required' },
        { status: 400 }
      );
    }

    const record = await prisma.solarData.findUnique({
      where: {
        locationType_locationName_frequency: {
          locationType: type.toUpperCase(),
          locationName: location,
          frequency,
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: `No solar data found for ${location} (${frequency})` },
        { status: 404 }
      );
    }

    const parsedData = JSON.parse(record.dataJson);

    // If start or end filters are provided, filter the arrays
    if (startDateStr || endDateStr) {
      const times: string[] = parsedData.time || [];
      const shortwave: number[] = parsedData.shortwave_radiation || [];
      const diffuse: number[] = parsedData.diffuse_radiation || [];
      const direct: number[] = parsedData.direct_normal_irradiance || [];

      const start = startDateStr ? new Date(startDateStr) : null;
      const end = endDateStr ? new Date(endDateStr) : null;

      const filteredIndices: number[] = [];
      times.forEach((t, i) => {
        const d = new Date(t);
        let include = true;
        if (start && d < start) include = false;
        if (end && d > end) include = false;
        if (include) filteredIndices.push(i);
      });

      const filteredTime = filteredIndices.map((i) => times[i]);
      const filteredShortwave = filteredIndices.map((i) => shortwave[i]);
      const filteredDiffuse = filteredIndices.map((i) => diffuse[i]);
      const filteredDirect = filteredIndices.map((i) => direct[i]);

      return NextResponse.json({
        success: true,
        data: {
          time: filteredTime,
          shortwave_radiation: filteredShortwave,
          diffuse_radiation: filteredDiffuse,
          direct_normal_irradiance: filteredDirect,
        },
        metadata: {
          location,
          type,
          frequency,
          totalRecords: filteredTime.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      metadata: {
        location,
        type,
        frequency,
        totalRecords: parsedData.time?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching historical solar data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
