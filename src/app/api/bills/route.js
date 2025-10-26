import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function getUserIdFromToken(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { remark, items, dateEnd } = await request.json();

    if (!items || items.length === 0 || !dateEnd) {
      return NextResponse.json({ message: 'Bill must contain items and a dateEnd' }, { status: 400 });
    }

    // For now, we trust the client's calculation and state.
    // The check for closed/limited numbers will be added later.
    const totalBillAmount = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    const bill = await prisma.bill.create({
      data: {
        userId,
        amount: totalBillAmount,
        state: true, // Assuming true means active/pending
        remark: remark || null,
        createAt: new Date(),
        dateEnd: new Date(dateEnd),
        items: {
          create: items.map(item => ({
            type: item.type,
            number: item.number,
            text: item.text,
            amount: parseFloat(item.amount),
            state: item.state,
            iswon: false,
          })),
        },
      },
      include: {
        items: true, // Include the created items in the response
      },
    });

    return NextResponse.json({ message: 'Bill saved successfully', bill }, { status: 201 });
  } catch (error) {
    console.error('Error saving bill:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
