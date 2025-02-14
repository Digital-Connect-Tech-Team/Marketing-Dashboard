import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaleRes } from '@/interfaces/sale';

function convertToExcelSerial(isoDate: string): number {
  if (isoDate != '') {
    const date = new Date(isoDate);
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // 1899-12-30
    const diffTime = date.getTime() - excelEpoch.getTime();
    const excelSerial = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return excelSerial;
  }
  return 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'all';
    const mainChannel = searchParams.get('mainChannel')?.trim() || '';
    const subChannel = searchParams.get('subChannel')?.trim() || '';
    const salePerson = searchParams.get('salePerson')?.trim() || '';
    const fromDate = convertToExcelSerial(
      searchParams.get('from')?.trim() || ''
    );
    const toDate = convertToExcelSerial(searchParams.get('to')?.trim() || '');

    // คำนวณ Offset สำหรับ Pagination
    const offset = (page - 1) * pageSize;

    // 🔍 เงื่อนไขการค้นหา (SQL WHERE)
    let whereClause = `WHERE F IS NOT NULL`;

    if (fromDate && toDate) {
      whereClause += ` AND Q BETWEEN '${fromDate}' AND '${toDate}'`;
    }

    if (mainChannel !== '') {
      whereClause += ` AND S = '${mainChannel}'`;
    }

    if (subChannel !== '') {
      whereClause += ` AND T = '${subChannel}'`;
    }

    if (salePerson !== '') {
      whereClause += ` AND W = '${salePerson}'`;
    }

    // ✅ กำหนดเงื่อนไขจาก `status`
    switch (status) {
      case 'surveyed':
        whereClause += ` AND Z = 'สำรวจแล้ว'`;
        break;
      case 'not_surveyed':
        whereClause += ` AND Z != 'สำรวจแล้ว'`;
        break;
      case 'quotation':
        whereClause += ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != ''`;
        break;
      case 'not_quotation':
        whereClause += ` AND Z = 'สำรวจแล้ว' AND (AI IS NULL OR AI = '')`;
        break;
      case 'nurturingHigh':
        whereClause += ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'High'`;
        break;
      case 'nurturingMedium':
        whereClause += ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Medium'`;
        break;
      case 'nurturingLow':
        whereClause += ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Low'`;
        break;
      case 'nurturingWin':
        whereClause += ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Win'`;
        break;
      case 'nurturingLoss':
        whereClause += ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Loss'`;
        break;
      case 'nurturingOthers':
        whereClause += ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU NOT IN ('High', 'Medium', 'Low', 'Win', 'Loss')`;
        break;
      default:
        break;
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
