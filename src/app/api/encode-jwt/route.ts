import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    if (!SECRET_KEY) {
      console.error('❌ Missing JWT Secret Key');
      return NextResponse.json(
        { error: 'Missing server secret key' },
        { status: 500 }
      );
    }

    // ✅ รับค่า `filters` และเช็คว่ามีอยู่จริง
    const { filters } = await request.json();
    if (!filters) {
      return NextResponse.json({ error: 'Filters missing' }, { status: 400 });
    }

    console.log('📡 Encoding JWT for filters:', filters);

    const token = jwt.sign(
      { filters }, // ✅ ไม่ตัด `null` ออกไป
      SECRET_KEY,
      { expiresIn: '5m' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('❌ Error encoding JWT:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
