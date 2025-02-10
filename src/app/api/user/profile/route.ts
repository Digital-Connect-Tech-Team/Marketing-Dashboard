import { NextResponse } from 'next/server';
import getServerSession from 'next-auth';
import authConfig from '@/lib/auth.config';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.ver03.findMany({
      where: {
        C1: 'เฟิร์มวันแล้วรอสำรวจ'
      }
    });

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No data found' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
