import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Create default rates for the new user
    await prisma.rate.createMany({
      data: [
        { userId: user.id, type: 'twoNumberTop', text: '2 ตัวบน', price: 100 },
        { userId: user.id, type: 'twoNumberButton', text: '2 ตัวล่าง', price: 100 },
        { userId: user.id, type: 'threeNumberTop', text: '3 ตัวบน', price: 800 },
        { userId: user.id, type: 'threeNumberTode', text: '3 ตัวโต๊ด', price: 125 },
      ],
    });

    return NextResponse.json({ message: 'User registered successfully', user: { id: user.id, username: user.username } }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
