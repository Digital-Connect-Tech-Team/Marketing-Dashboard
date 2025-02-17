import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaleRes } from '@/interfaces/sale';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'main'; //

    const column = status === 'main' ? 'S' : 'T';

    // let whereClause = `WHERE ${column} IS NOT NULL AND ${column} != ''`;
    let whereClause = `WHERE S IS NOT NULL AND S = 'ร้านค้าออนไลน์ (Online Store)'`;

    const rawData: any[] = await prisma.$queryRawUnsafe(`
            SELECT DISTINCT ${column} AS name
            FROM ver03
            ${whereClause}
            ORDER BY ${column} ASC
          `);

    return NextResponse.json(rawData);
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
