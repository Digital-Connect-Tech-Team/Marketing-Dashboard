import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getQueryParamAsNumber(
  value: string | string[] | undefined,
  defaultValue: number
): number {
  const parsed = Array.isArray(value)
    ? parseInt(value[0] || '', 10)
    : parseInt(value || '', 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = getQueryParamAsNumber(searchParams.get('page') as string, 1);
    const pageSize = getQueryParamAsNumber(
      searchParams.get('pageSize') as string,
      10
    );

    const data = await prisma.ver03.findMany({
      where: {
        C6: { not: null },
        C26: 'สำรวจแล้ว',
        C35: { not: null },
        C73: 'Loss'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const totalCount = await prisma.ver03.count({
      where: {
        C6: { not: null },
        C26: 'สำรวจแล้ว',
        C35: { not: null },
        C73: 'Loss'
      }
    });

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No data found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        data,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize)
      },
      {
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
