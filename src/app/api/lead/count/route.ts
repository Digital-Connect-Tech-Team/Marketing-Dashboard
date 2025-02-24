import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaleRes } from '@/interfaces/sale';
import { auth } from '@/lib/auth';
import { convertToExcelSerial } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const mainChannelSession = session?.user?.domain?.main_chanel;
    const { searchParams } = new URL(request.url);
    // ดึงข้อมูล filter จาก request body
    const { filters } = await request.json();

    // สร้างเงื่อนไข WHERE clause เริ่มต้น
    let whereClause = `WHERE F IS NOT NULL`;

    if (filters.type === 'date' && filters.from && !filters.to) {
      console.log(filters.from);

      const fromDate = convertToExcelSerial(filters.from);
      whereClause += ` AND Q = '${fromDate}'`;
    }

    if (filters.type === 'date' && filters.from && filters.to) {
      const fromDate = convertToExcelSerial(filters.from);
      const toDate = convertToExcelSerial(filters.to);
      whereClause += ` AND Q BETWEEN '${fromDate}' AND '${toDate}'`;
    }

    if (filters.type === 'month' && filters.months && filters.year) {
      const monthMapping: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11
      };

      const conditions = filters.months.map((month: string) => {
        const monthIndex = monthMapping[month];
        const year = Number(filters.year);
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0);
        const startSerial = convertToExcelSerial(
          startDate.toISOString().split('T')[0]
        );
        const endSerial = convertToExcelSerial(
          endDate.toISOString().split('T')[0]
        );
        return `(Q BETWEEN '${startSerial}' AND '${endSerial}')`;
      });

      if (conditions.length > 0) {
        whereClause += ` AND (${conditions.join(' OR ')})`;
      }
    }

    console.log(filters);

    if (filters.type === 'quarter' && filters.quarter && filters.year) {
      const quarterMapping: Record<
        string,
        { startMonth: number; endMonth: number }
      > = {
        Q1: { startMonth: 0, endMonth: 2 }, // Jan - Mar
        Q2: { startMonth: 3, endMonth: 5 }, // Apr - Jun
        Q3: { startMonth: 6, endMonth: 8 }, // Jul - Sep
        Q4: { startMonth: 9, endMonth: 11 } // Oct - Dec
      };

      // วนลูปหาช่วงวันสำหรับแต่ละไตรมาส
      const conditions = filters.quarters.map((quarter: string) => {
        const { startMonth, endMonth } = quarterMapping[quarter];
        const year = Number(filters.year);
        // วันที่เริ่มต้นของไตรมาส (วันแรกของเดือนเริ่มต้น)
        const startDate = new Date(year, startMonth, 1);
        // วันที่สิ้นสุดของไตรมาส (วันที่สุดท้ายของเดือนสิ้นสุด)
        const endDate = new Date(year, endMonth + 1, 0);
        // แปลงวันที่เป็น Excel serial โดยรับค่าในรูปแบบ 'yyyy-mm-dd'
        const startSerial = convertToExcelSerial(
          startDate.toISOString().split('T')[0]
        );
        const endSerial = convertToExcelSerial(
          endDate.toISOString().split('T')[0]
        );
        return `(Q BETWEEN '${startSerial}' AND '${endSerial}')`;
      });

      if (conditions.length > 0) {
        whereClause += ` AND (${conditions.join(' OR ')})`;
      }
    }

    if (filters.type === 'year' && filters.years) {
      const conditions = filters.years.map((yearStr: string) => {
        const year = Number(yearStr);
        // วันที่เริ่มต้นของปี (1 มกราคม)
        const startDate = new Date(year, 0, 1);
        // วันที่สิ้นสุดของปี (31 ธันวาคม)
        const endDate = new Date(year, 11, 31);
        // แปลงวันที่เป็น Excel serial (โดยใช้ฟังก์ชัน convertToExcelSerial)
        const startSerial = convertToExcelSerial(
          startDate.toISOString().split('T')[0]
        );
        const endSerial = convertToExcelSerial(
          endDate.toISOString().split('T')[0]
        );
        return `(Q BETWEEN '${startSerial}' AND '${endSerial}')`;
      });

      if (conditions.length > 0) {
        whereClause += ` AND (${conditions.join(' OR ')})`;
      }
    }

    // สามารถเพิ่มเงื่อนไขอื่นๆ จาก filters ได้ เช่น mainChannel, months, quarters, years เป็นต้น
    if (mainChannelSession) {
      whereClause += ` AND S = '${mainChannelSession}'`;
    }

    console.log(whereClause);

    const rawData: any[] = await prisma.$queryRawUnsafe(`
      WITH base AS (
        SELECT *
        FROM salesvision_db.ver03
        ${whereClause}
      )
      SELECT
        COUNT(*) AS lead_sale,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' THEN 1 ELSE 0 END) AS surveyed,
        SUM(CASE WHEN Z != 'สำรวจแล้ว' THEN 1 ELSE 0 END) AS not_surveyed,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' THEN 1 ELSE 0 END) AS quotation,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND (AI IS NULL OR AI = '') THEN 1 ELSE 0 END) AS not_quotation,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'High' THEN 1 ELSE 0 END) AS nurturingHigh,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Medium' THEN 1 ELSE 0 END) AS nurturingMedium,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Low' THEN 1 ELSE 0 END) AS nurturingLow,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Win' THEN 1 ELSE 0 END) AS nurturingWin,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Loss' THEN 1 ELSE 0 END) AS nurturingLoss,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU NOT IN ('High', 'Medium', 'Low', 'Win', 'Loss') THEN 1 ELSE 0 END) AS nurturingOthers,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU IN ('High', 'Medium', 'Low') THEN 1 ELSE 0 END) AS nurturingHML
      FROM base;
    `);

    // แปลงค่าที่เป็น BigInt ให้เป็น Number ก่อนส่ง response
    const result = [
      {
        title: 'Lead Sales',
        success: Number(rawData[0].lead_sale),
        pending: 0
      },
      {
        title: 'Survey',
        success: Number(rawData[0].surveyed),
        pending: Number(rawData[0].not_surveyed)
      },
      {
        title: 'Quotation',
        success: Number(rawData[0].quotation),
        pending: Number(rawData[0].not_quotation)
      },
      {
        title: 'Nurturing',
        success: Number(rawData[0].nurturingHML),
        pending: Number(rawData[0].nurturingOthers),
        high: Number(rawData[0].nurturingHigh),
        medium: Number(rawData[0].nurturingMedium),
        low: Number(rawData[0].nurturingLow)
      },
      {
        title: 'Win/Loss',
        success: Number(rawData[0].nurturingWin),
        pending: Number(rawData[0].nurturingLoss),
        loss: Number(rawData[0].nurturingLoss)
      }
    ];

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const mainChannelSession = session?.user?.domain?.main_chanel;
    const { searchParams } = new URL(request.url);
    const params = {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
      search: searchParams.get('search')?.trim() || '',
      status: searchParams.get('status') || 'all',
      mainChannel: searchParams.get('mainChannel')?.trim() || '',
      subChannel: searchParams.get('subChannel')?.trim() || '',
      salePerson: searchParams.get('salePerson')?.trim() || '',
      from: searchParams.get('from')?.trim() || '',
      to: searchParams.get('to')?.trim() || ''
    };

    const rawData: any[] = await prisma.$queryRawUnsafe(`
     WITH base AS (
        SELECT *
        FROM salesvision_db.ver03
        WHERE F IS NOT NULL  ${mainChannelSession ? `AND S = '${mainChannelSession}'` : ''}
      )
      SELECT
        COUNT(*) AS lead_sale,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' THEN 1 ELSE 0 END) AS surveyed,
        SUM(CASE WHEN Z != 'สำรวจแล้ว' THEN 1 ELSE 0 END) AS not_surveyed,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' THEN 1 ELSE 0 END) AS quotation,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND (AI IS NULL OR AI = '') THEN 1 ELSE 0 END) AS not_quotation,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'High' THEN 1 ELSE 0 END) AS nurturingHigh,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Medium' THEN 1 ELSE 0 END) AS nurturingMedium,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Low' THEN 1 ELSE 0 END) AS nurturingLow,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Win' THEN 1 ELSE 0 END) AS nurturingWin,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU = 'Loss' THEN 1 ELSE 0 END) AS nurturingLoss,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU NOT IN ('High', 'Medium', 'Low', 'Win', 'Loss') THEN 1 ELSE 0 END) AS nurturingOthers,
        SUM(CASE WHEN Z = 'สำรวจแล้ว' AND AI IS NOT NULL AND AI != '' AND BU IN ('High', 'Medium', 'Low') THEN 1 ELSE 0 END) AS nurturingHML
      FROM base;
    `);

    const result = [
      {
        title: 'Lead Sales',
        success: Number(rawData[0].lead_sale),
        pending: 0
      },
      {
        title: 'Survey',
        success: Number(rawData[0].surveyed),
        pending: Number(rawData[0].not_surveyed)
      },
      {
        title: 'Quotation',
        success: Number(rawData[0].quotation),
        pending: Number(rawData[0].not_quotation)
      },
      {
        title: 'Nurturing',
        success: Number(rawData[0].nurturingHML),
        pending: Number(rawData[0].nurturingOthers),
        high: Number(rawData[0].nurturingHigh),
        medium: Number(rawData[0].nurturingMedium),
        low: Number(rawData[0].nurturingLow)
      },
      {
        title: 'Win/Loss',
        success: Number(rawData[0].nurturingWin),
        pending: Number(rawData[0].nurturingLoss),
        loss: Number(rawData[0].nurturingLoss)
      }
    ];

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
