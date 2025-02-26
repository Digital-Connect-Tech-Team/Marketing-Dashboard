import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaleRes } from '@/interfaces/sale';
import { auth } from '@/lib/auth';
import { convertToExcelSerial } from '@/lib/utils';
import { buildWhereClause } from '@/lib/build-where-clause';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const mainChannelSession = session?.user?.domain?.main_channel;
    const { searchParams } = new URL(request.url);

    const { filters } = await request.json();

    const whereClause = buildWhereClause(
      filters,
      session,
      mainChannelSession ?? ''
    );

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
    const mainChannelSession = session?.user?.domain?.main_channel;
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
