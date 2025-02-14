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
    let whereClause = `WHERE F IS NOT NULL AND Z != 'สำรวจแล้ว'`;

    if (search !== '') {
      whereClause += ` AND (
        F LIKE '%${search}%'
        OR G LIKE '%${search}%'
        OR H LIKE '%${search}%'
        OR S LIKE '%${search}%'
      )`;
    }

    const rawData: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        F AS RD,
        G AS customerName,
        H AS phoneNumber,
        S AS mainChannel,
        T AS secondaryChannel,
        BV AS workValue
      FROM ver03
      ${whereClause}
      ORDER BY id ASC
      LIMIT ${pageSize} OFFSET ${offset};
    `);

    const data: SaleRes[] = rawData.map((row) => ({
      RD: row.RD,
      customerName: row.customerName ?? undefined,
      phoneNumber: row.phoneNumber ?? undefined,
      mainChannel: row.mainChannel ?? undefined,
      secondaryChannel: row.secondaryChannel ?? undefined,
      workValue: row.workValue ? Number(row.workValue) : undefined
    }));

    // ✅ นับจำนวนรายการทั้งหมด
    const totalCountResult = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as totalCount FROM ver03 ${whereClause};
    `);

    const totalCount =
      totalCountResult.length > 0 ? Number(totalCountResult[0].totalCount) : 0;

    return NextResponse.json({
      data,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize)
    });
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
