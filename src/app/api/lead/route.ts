import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaleRes, SaleTable } from '@/interfaces/sale';
import { auth } from '@/lib/auth';
import { convertToExcelSerial } from '@/lib/utils';
import { buildWhereClause } from '@/lib/build-where-clause';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const mainChannelSession = session?.user?.domain?.main_channel;
    const { filters } = await request.json();

    let whereClause = buildWhereClause(
      filters,
      session,
      mainChannelSession ?? ''
    );

    if (filters.typeCategory) {
      const baseCondition = " AND Z = 'สำรวจแล้ว'";
      switch (filters.typeCategory) {
        case 'Survey':
          whereClause +=
            filters.typeBadge === 'Success'
              ? baseCondition
              : " AND Z != 'สำรวจแล้ว'";
          break;
        case 'Quotation':
          if (filters.typeBadge === 'Success') {
            whereClause += `${baseCondition} AND AI IS NOT NULL AND AI != ''`;
          } else if (filters.typeBadge === 'Pending') {
            whereClause += `${baseCondition} AND (AI IS NULL OR AI = '')`;
          } else {
            whereClause += baseCondition;
          }
          break;
        case 'Nurturing':
          if (['High', 'Medium', 'Low'].includes(filters.typeBadge)) {
            whereClause += `${baseCondition} AND AI IS NOT NULL AND AI != '' AND BU = '${filters.typeBadge}'`;
          } else if (filters.typeBadge === 'Others') {
            whereClause += `${baseCondition} AND AI IS NOT NULL AND AI != '' AND BU NOT IN ('High', 'Medium', 'Low', 'Win', 'Loss')`;
          } else {
            whereClause += `${baseCondition} AND AI IS NOT NULL AND AI != '' AND BU NOT IN ('Win', 'Loss')`;
          }
          break;
        case 'Win/Loss':
          if (['Win', 'Loss'].includes(filters.typeBadge)) {
            whereClause += `${baseCondition} AND AI IS NOT NULL AND AI != '' AND BU = '${filters.typeBadge}'`;
          } else {
            whereClause += `${baseCondition} AND AI IS NOT NULL AND AI != '' AND BU = 'Win'`;
          }
          break;
      }
    }

    const rawData: SaleTable[] = await prisma.$queryRawUnsafe(`
        SELECT   
          TRIM(F) AS rd,
          TRIM(G) AS name,
          TRIM(H) AS phone,
          TRIM(S) AS main,
          TRIM(T) AS sub,
          TRIM(W) AS sale,
          TRIM(BV) AS total
        FROM salesvision_db.ver03
        ${whereClause}
        ORDER BY id ASC
        LIMIT ${filters.pageSize} OFFSET ${filters.offset};
    `);

    const totalRecords: { count: number }[] = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM salesvision_db.ver03 ${whereClause};
    `);

    const totalCount = Number(totalRecords[0]?.count ?? 0);

    return NextResponse.json({
      data: rawData,
      totalData: totalCount,
      currentPage: Math.floor(filters.offset / filters.pageSize) + 1,
      totalPages: Math.ceil((totalCount || 1) / filters.pageSize)
    });
  } catch (error) {
    console.error('❌ Error in API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const mainChannel = session?.user?.domain?.main_channel;

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
    let whereClause = `WHERE F IS NOT NULL AND S = '${mainChannel}'`;

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
