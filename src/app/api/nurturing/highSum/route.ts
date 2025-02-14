import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaleRes } from '@/interfaces/sale';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search')?.trim() || '';

    // คำนวณ Offset สำหรับ Pagination
    const offset = (page - 1) * pageSize;

    // 🔍 เงื่อนไขการค้นหา (SQL WHERE)
    let whereClause = `WHERE F IS NOT NULL AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND BU = 'High'`;

    if (search !== '') {
      whereClause += ` AND (
                F LIKE '%${search}%'
                OR G LIKE '%${search}%'
                OR H LIKE '%${search}%'
                OR S LIKE '%${search}%'
            )`;
    }

    const totalWorkValueResult = await prisma.$queryRawUnsafe<
      { totalWorkValue: string | null }[]
    >(`
            SELECT SUM(BV) as totalWorkValue FROM ver03 ${whereClause};
          `);

    const totalWorkValue =
      totalWorkValueResult.length > 0 &&
      totalWorkValueResult[0].totalWorkValue !== null
        ? { totalWorkValue: totalWorkValueResult[0].totalWorkValue }
        : { totalWorkValue: '0.0000' }; // ป้องกันกรณีไม่มีข้อมูล

    return NextResponse.json(totalWorkValue);
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
