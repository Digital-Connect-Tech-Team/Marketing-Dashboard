import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { buildWhereClause } from '@/lib/build-where-clause';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filters } = await request.json();

    const mainChannelSession = session?.user?.domain?.main_channel;

    let whereClause = buildWhereClause(
      filters,
      session,
      mainChannelSession ?? ''
    );

    const categoriesMap: Record<string, number> = {
      เลือกคู่แข่งเนื่องจากราคาถูกกว่า: 0,
      เลื่อนการตัดสินใจไม่มีกำหนด: 0,
      'ราคาสูง/คืนทุนช้า': 0,
      สอบถามข้อมูล: 0,
      พื้นที่หน้างานไม่เหมาะกับการติดตั้ง: 0,
      ใช้ไฟกลางวันน้อย: 0,
      'เสนอราคาไปแล้ว 3 เดือนยังไม่ตัดสินใจ': 0,
      ลูกค้านำงบประมาณไปใช้อย่างอื่นก่อน: 0,
      'ติดต่อไม่ได้เกิน 3 ครั้ง': 0,
      ไม่ระบุ: 0
    };

    const rawData: any[] = await prisma.$queryRawUnsafe(`
            SELECT TRIM(BW) AS name, COUNT(*) AS count
            FROM ver03
            ${whereClause} AND AI IS NOT NULL AND AI != '' AND BU = 'Loss'
            GROUP BY TRIM(BW);
        `);

    rawData.forEach((row) => {
      let categoryName = row.name?.trim();
      if (!categoryName) {
        categoryName = 'ไม่ระบุ';
      }

      if (categoryName in categoriesMap) {
        categoriesMap[categoryName] += Number(row.count);
      } else {
        categoriesMap['ไม่ระบุ'] += Number(row.count);
      }
    });

    const formattedData = Object.entries(categoriesMap).map(
      ([name, count]) => ({
        name,
        count
      })
    );

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('❌ Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
