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

export async function GET(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bills = await prisma.bill.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true, // Include all items for each bill
      },
      orderBy: {
        createAt: 'desc', // Show the most recent bills first
      },
    });
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { remark, items, dateEnd } = await request.json();

    if (!items || !dateEnd) {
      return NextResponse.json({ message: 'Bill must contain items and a dateEnd' }, { status: 400 });
    }

    // Calculate total amount based only on receivable items.
    const totalBillAmount = items
      .filter(item => item.state === 'รับได้')
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    const bill = await prisma.bill.create({
      data: {
        userId,
        amount: totalBillAmount,
        state: true, // Assuming true means active/pending
        remark: remark || null,
        createAt: new Date(),
        dateEnd: new Date(dateEnd),
        items: {
          // Create all items, including closed/limited ones which will have amount = 0
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
        items: true,
      },
    });

    // Update limit numbers only for items that were successfully purchased.
    const limitUpdates = items
      .filter(item => item.state === 'รับได้')
      .map(item => {
        return prisma.limitNumber.updateMany({
          where: {
            number: item.number,
            type: item.type,
          },
          data: {
            used: {
              increment: parseFloat(item.amount),
            },
          },
        });
      });

    await Promise.all(limitUpdates);

    return NextResponse.json({ message: 'Bill saved successfully', bill }, { status: 201 });
  } catch (error) {
    console.error('Error saving bill:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}