import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaleRes } from '@/interfaces/sale';
import { auth } from '@/lib/auth';
import { convertToExcelSerial } from '@/lib/utils';
import { FilterDate } from '@/interfaces/global';
import jwt from 'jsonwebtoken';
import { buildWhereClause } from '@/lib/build-where-clause';

const SECRET_KEY = process.env.JWT_SECRET as string;

async function getDataSalePerformance(filter: FilterDate) {}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = session?.user?.role.name;
    const mainChannelSession = session?.user?.domain?.main_channel;

    const { searchParams } = new URL(request.url);

    const body = await request.json();
    const filters = body?.filters || {};

    const whereClause = buildWhereClause(
      filters,
      session,
      mainChannelSession ?? ''
    );

    const rawData: any[] = await prisma.$queryRawUnsafe(`
            SELECT DISTINCT W AS sale
            FROM ver03
            ${whereClause}
            ORDER BY id ASC
        `);

    const result = rawData.map((item) => item.sale);

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

    let whereClause = `WHERE F IS NOT NULL`;
    whereClause += ` AND S = '${mainChannelSession}'`;

    const rawData: any[] = await prisma.$queryRawUnsafe(`
            SELECT DISTINCT W AS sale
            FROM ver03
            ${whereClause}
            ORDER BY id ASC
        `);

    const result = rawData.map((item) => item.sale);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
