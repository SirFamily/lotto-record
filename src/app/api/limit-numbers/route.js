import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Helper function to get user from token
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
    const limitNumbers = await prisma.limitNumber.findMany({
      where: { userId },
    });
    return NextResponse.json(limitNumbers, { status: 200 });
  } catch (error) {
    console.error('Error fetching limit numbers:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, number, amountlimit, text, dateEnd } = await request.json();

    if (!type || number === undefined || number === null || amountlimit === undefined || amountlimit === null || !text || !dateEnd) {
      return NextResponse.json({ message: 'Type, number, amount limit, text, and dateEnd are required' }, { status: 400 });
    }

    // Check if the number is already closed
    const isClosed = await prisma.closeNumber.findFirst({
      where: { userId, type, number },
    });
    if (isClosed) {
      return NextResponse.json({ message: 'Cannot limit a number that is already closed' }, { status: 409 });
    }

    const limitNumber = await prisma.limitNumber.create({
      data: {
        userId,
        type,
        number,
        amountlimit: parseFloat(amountlimit),
        used: 0, // Initialize used amount to 0
        text,
        dateEnd: new Date(dateEnd), // Use the provided dateEnd
      },
    });

    return NextResponse.json(limitNumber, { status: 201 });
  } catch (error) {
    console.error('Error limiting number:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, amountlimit } = await request.json();

    if (!id || amountlimit === undefined || amountlimit === null) {
      return NextResponse.json({ message: 'Limit number ID and amount limit are required' }, { status: 400 });
    }

    const updatedLimitNumber = await prisma.limitNumber.update({
      where: { id: parseInt(id), userId },
      data: { amountlimit: parseFloat(amountlimit) },
    });

    return NextResponse.json(updatedLimitNumber, { status: 200 });
  } catch (error) {
    console.error('Error updating limit number:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json(); // Assuming ID of the LimitNumber entry to delete

    if (!id) {
      return NextResponse.json({ message: 'Limit number ID is required' }, { status: 400 });
    }

    await prisma.limitNumber.delete({
      where: { id: parseInt(id), userId },
    });

    return NextResponse.json({ message: 'Number un-limited successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error un-limiting number:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
