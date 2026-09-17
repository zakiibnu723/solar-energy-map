import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      select: {
        name: true,
        slug: true,
        numKab: true,
        avgGhi: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Map into convenient lookup object: { [name]: avgGhi } + list
    const ghiMap: Record<string, number> = {};
    for (const p of provinces) {
      ghiMap[p.name] = p.avgGhi;
    }

    return NextResponse.json({
      success: true,
      data: provinces,
      ghiMap,
    });
  } catch (error: any) {
    console.error('Error fetching provinces summary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
