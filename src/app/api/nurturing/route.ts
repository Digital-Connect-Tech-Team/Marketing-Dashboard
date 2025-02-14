import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaleRes } from '@/interfaces/sale';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'all'; // 🔹 ใช้ status ควบคุมเงื่อนไข

    // คำนวณ Offset สำหรับ Pagination
    const offset = (page - 1) * pageSize;

    // 🔍 เงื่อนไขการค้นหา (SQL WHERE)
    let whereClause = `WHERE F IS NOT NULL AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL`;

    // ✅ กำหนดเงื่อนไขจาก `status`
    switch (status) {
      case 'high':
        whereClause += ` AND BU = 'High'`;
        break;
      case 'medium':
        whereClause += ` AND BU = 'Medium'`;
        break;
      case 'low':
        whereClause += ` AND BU = 'Low'`;
        break;
      case 'win':
        whereClause += ` AND BU = 'Win'`;
        break;
      case 'loss':
        whereClause += ` AND BU = 'Loss'`;
        break;
      case 'others':
        whereClause += ` AND BU NOT IN ('High', 'Medium', 'Low', 'Win', 'Loss')`;
        break;
      default:
        break; // ถ้า `status=all` ไม่ต้องเพิ่มเงื่อนไขอะไร
    }

    if (search !== '') {
      whereClause += ` AND (
                F LIKE '%${search}%'
                OR G LIKE '%${search}%'
                OR H LIKE '%${search}%'
                OR S LIKE '%${search}%'
            )`;
    }

    console.log('🔍 SQL WHERE Clause:', whereClause);

    // ✅ ดึงข้อมูลตาม Pagination
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

    // ✅ แปลงข้อมูลให้ตรงกับ `SaleRes[]`
    const data: SaleRes[] = rawData.map((row) => ({
      RD: row.RD,
      customerName: row.customerName ?? undefined,
      phoneNumber: row.phoneNumber ?? undefined,
      mainChannel: row.mainChannel ?? undefined,
      secondaryChannel: row.secondaryChannel ?? undefined,
      workValue: row.workValue ? Number(row.workValue) : undefined
    }));

    // ✅ นับจำนวนรายการทั้งหมด
    const totalCountResult = await prisma.$queryRawUnsafe<
      { totalCount: bigint }[]
    >(`
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
