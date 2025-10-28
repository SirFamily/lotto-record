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
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause = {
      userId: userId,
    };

    if (startDate && endDate) {
      whereClause.createAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bills = await prisma.bill.findMany({
      where: whereClause,
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
    console.log('POST /api/bills: Unauthorized - No userId');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { remark, items, dateEnd } = await request.json();
    console.log('POST /api/bills: Received data - remark:', remark, 'items count:', items.length, 'dateEnd:', dateEnd);

    if (!items || !dateEnd) {
      console.log('POST /api/bills: Validation failed - missing items or dateEnd');
      return NextResponse.json({ message: 'Bill must contain items and a dateEnd' }, { status: 400 });
    }

    // --- Server-side re-validation of items against current limits and closed numbers ---
    const allClosedNumbers = await prisma.closeNumber.findMany();
    const allLimitNumbers = await prisma.limitNumber.findMany();

    const serverValidatedItems = [];
    const limitUsage = {}; // Track usage within this bill submission on the server

    for (const item of items) {
      let currentAmount = parseFloat(item.amount);
      let currentState = item.state;

      const isClosed = allClosedNumbers.some(
        (cn) => cn.number === item.number && cn.type === item.type
      );
      const limitedEntry = allLimitNumbers.find(
        (ln) => ln.number === item.number && ln.type === item.type
      );

      if (isClosed) {
        currentState = 'ปิดรับเลขแล้ว';
        currentAmount = 0;
      } else if (limitedEntry) {
        const limitKey = `${item.type}-${item.number}`;
        // Get current used amount from DB, or 0 if not tracked yet for this session
        const dbUsed = parseFloat(limitedEntry.used);
        const sessionUsed = limitUsage[limitKey] || 0;
        const totalUsed = dbUsed + sessionUsed;

        const available = parseFloat(limitedEntry.amountlimit) - totalUsed;

        if (available <= 0) {
          currentState = 'เกินวงเงินที่กำหนด';
          currentAmount = 0;
        } else if (currentAmount > available) {
          currentState = 'เกินวงเงินที่กำหนด';
          currentAmount = parseFloat(available.toFixed(2)); // Partial purchase
          limitUsage[limitKey] = sessionUsed + currentAmount; // Update session usage
        } else {
          // currentAmount is within available limit
          limitUsage[limitKey] = sessionUsed + currentAmount; // Update session usage
        }
      }

      serverValidatedItems.push({
        ...item,
        amount: currentAmount,
        state: currentState,
      });
    }
    console.log('POST /api/bills: Server-side validated items:', serverValidatedItems);

    const receivableItems = serverValidatedItems.filter(
      (item) => item.state === 'ผ่านการตรวจสอบ' && item.amount > 0
    );

    if (receivableItems.length === 0) {
      console.log('POST /api/bills: No receivable items after server-side validation.');
      return NextResponse.json({ message: 'No receivable items to save after validation.' }, { status: 400 });
    }

    const totalBillAmount = receivableItems.reduce((sum, item) => sum + item.amount, 0);
    console.log('POST /api/bills: Final totalBillAmount for bill:', totalBillAmount);

    const bill = await prisma.bill.create({
      data: {
        userId,
        amount: totalBillAmount,
        state: true, // Assuming true means active/pending
        remark: remark || null,
        createAt: new Date(),
        dateEnd: new Date(dateEnd),
        items: {
          create: serverValidatedItems.map((item) => ({
            type: item.type,
            number: item.number,
            text: item.text,
            amount: item.amount,
            state: item.state,
            iswon: false,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    console.log('POST /api/bills: Bill created successfully with ID:', bill.id);

    // Update limit numbers only for items that were successfully purchased and passed server validation.
    const limitUpdates = receivableItems
      .filter(item => item.type.includes('Number')) // Ensure it's a number type that could have limits
      .map(item => {
        console.log('POST /api/bills: Incrementing used amount for limitNumber:', item.number, item.type, 'by:', item.amount);
        return prisma.limitNumber.updateMany({
          where: {
            number: item.number,
            type: item.type,
          },
          data: {
            used: {
              increment: item.amount,
            },
          },
        });
      });

    await Promise.all(limitUpdates);
    console.log('POST /api/bills: Limit numbers updated.');

    return NextResponse.json({ message: 'Bill saved successfully', bill }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bills: Error saving bill:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
