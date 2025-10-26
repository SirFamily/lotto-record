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
    const closeNumbers = await prisma.closeNumber.findMany({
      where: { userId },
    });
    return NextResponse.json(closeNumbers, { status: 200 });
  } catch (error) {
    console.error('Error fetching closed numbers:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, number, text } = await request.json();

    if (!type || number === undefined || number === null || !text) {
      return NextResponse.json({ message: 'Type, number, and text are required' }, { status: 400 });
    }

    const closeNumber = await prisma.closeNumber.create({
      data: {
        userId,
        type,
        number: parseInt(number),
        text,
        dateEnd: new Date(), // Assuming dateEnd is current date for closing
      },
    });

    return NextResponse.json(closeNumber, { status: 201 });
  } catch (error) {
    console.error('Error closing number:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json(); // Assuming ID of the CloseNumber entry to delete

    if (!id) {
      return NextResponse.json({ message: 'Close number ID is required' }, { status: 400 });
    }

    await prisma.closeNumber.delete({
      where: { id: parseInt(id), userId },
    });

    return NextResponse.json({ message: 'Number unclosed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error unclosing number:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
