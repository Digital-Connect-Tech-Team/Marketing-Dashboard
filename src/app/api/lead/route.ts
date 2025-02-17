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

function saveSearchParamsToLocalStorage(params: Record<string, string>) {
  try {
    localStorage.setItem('searchParams', JSON.stringify(params));
    console.log('✅ searchParams saved:', params);
  } catch (error) {
    console.error('❌ Failed to save searchParams to localStorage:', error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '10',
      search: searchParams.get('search')?.trim() || '',
      status: searchParams.get('status') || 'all',
      mainChannel: searchParams.get('mainChannel')?.trim() || '',
      subChannel: searchParams.get('subChannel')?.trim() || '',
      salePerson: searchParams.get('salePerson')?.trim() || '',
      from: searchParams.get('from')?.trim() || '',
      to: searchParams.get('to')?.trim() || ''
    };

    const fromDate = convertToExcelSerial(params.from);
    const toDate = convertToExcelSerial(params.to);

    const offset =
      (parseInt(params.page, 10) - 1) * parseInt(params.pageSize, 10);
    let whereClause = `WHERE F IS NOT NULL AND S = 'ร้านค้าออนไลน์ (Online Store)'`;

    if (fromDate && toDate) {
      whereClause += ` AND Q BETWEEN '${fromDate}' AND '${toDate}'`;
    }
    if (params.mainChannel) whereClause += ` AND S = '${params.mainChannel}'`;
    if (params.subChannel) whereClause += ` AND T = '${params.subChannel}'`;
    if (params.salePerson) whereClause += ` AND W = '${params.salePerson}'`;

    const statusConditions: Record<string, string> = {
      surveyed: ` AND Z = 'สำรวจแล้ว'`,
      not_surveyed: ` AND Z != 'สำรวจแล้ว'`,
      quotation: ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != ''`,
      not_quotation: ` AND Z = 'สำรวจแล้ว' AND (AI IS NULL OR AI = '')`,
      nurturingHigh: ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'High'`,
      nurturingMedium: ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Medium'`,
      nurturingLow: ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Low'`,
      nurturingWin: ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Win'`,
      nurturingLoss: ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Loss'`,
      nurturingOthers: ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU NOT IN ('High', 'Medium', 'Low', 'Win', 'Loss')`,
      nurturingHML: ` AND Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU IN ('High', 'Medium', 'Low')`
    };

    if (params.status in statusConditions) {
      whereClause += statusConditions[params.status];
    }

    if (params.search) {
      whereClause += ` AND (
                    F LIKE '%${params.search}%'
                    OR G LIKE '%${params.search}%'
                    OR H LIKE '%${params.search}%'
                    OR S LIKE '%${params.search}%'
                )`;
    }

    const rawData: any[] = await prisma.$queryRawUnsafe(`
                SELECT 
                    F AS RD,
                    G AS customerName,
                    H AS phoneNumber,
                    S AS mainChannel,
                    T AS secondaryChannel,
                    BV AS workValue,
                    BU AS nurturingType
                FROM ver03
                ${whereClause}
                ORDER BY id ASC
                LIMIT ${params.pageSize} OFFSET ${offset};
            `);

    const data: SaleRes[] = rawData.map((row) => ({
      RD: row.RD,
      customerName: row.customerName ?? undefined,
      phoneNumber: row.phoneNumber ?? undefined,
      mainChannel: row.mainChannel ?? undefined,
      secondaryChannel: row.secondaryChannel ?? undefined,
      workValue: row.workValue ? Number(row.workValue) : undefined,
      nurturingType: row.nurturingType ?? undefined
    }));

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
      currentPage: parseInt(params.page, 10),
      totalPages: Math.ceil(totalCount / parseInt(params.pageSize, 10))
    });
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
