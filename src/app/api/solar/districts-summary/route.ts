import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prov = searchParams.get('prov');

    if (!prov) {
      return NextResponse.json(
        { success: false, error: 'Province name (prov) is required' },
        { status: 400 }
      );
    }

    const districts = await prisma.district.findMany({
      where: {
        provName: prov,
      },
      select: {
        name: true,
        slug: true,
        provName: true,
        avgGhi: true,
        latitude: true,
        longitude: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const ghiMap: Record<string, number> = {};
    for (const d of districts) {
      ghiMap[d.name] = d.avgGhi;
    }

    return NextResponse.json({
      success: true,
      data: districts,
      ghiMap,
    });
  } catch (error: any) {
    console.error('Error fetching districts summary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
