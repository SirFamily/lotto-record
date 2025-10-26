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
    const rates = await prisma.rate.findMany({
      where: { userId },
    });
    return NextResponse.json(rates, { status: 200 });
  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, price } = await request.json();

    if (!id || price === undefined) {
      return NextResponse.json({ message: 'Rate ID and price are required' }, { status: 400 });
    }

    const updatedRate = await prisma.rate.update({
      where: { id: parseInt(id), userId },
      data: { price: parseFloat(price) },
    });

    return NextResponse.json(updatedRate, { status: 200 });
  } catch (error) {
    console.error('Error updating rate:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
