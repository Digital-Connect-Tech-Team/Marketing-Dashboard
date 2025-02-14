import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'main';

    let rawData: any[];

    if (status === 'main') {
      rawData = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT W AS name
        FROM ver03
        WHERE W IS NOT NULL AND W != ''
        ORDER BY W ASC
      `);
    } else if (status === 'sub') {
      rawData = await prisma.$queryRawUnsafe(`
        SELECT DISTINCT T AS name
        FROM ver03
        WHERE T IS NOT NULL AND T != ''
        ORDER BY T ASC
      `);
    } else {
      return NextResponse.json(
        { error: 'Invalid status parameter' },
        { status: 400 }
      );
    }

    return NextResponse.json(rawData);
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
