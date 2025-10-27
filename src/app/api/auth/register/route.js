import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    console.log('Register API: Received username:', username, 'password length:', password ? password.length : 0);

    if (!username || !password) {
      console.log('Register API: Validation failed - missing username or password');
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    console.log('Register API: Existing user check for', username, ':', existingUser ? 'found' : 'not found');
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    console.log('Register API: Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Register API: Password hashed.');

    console.log('Register API: Creating user in Prisma...');
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    console.log('Register API: User created successfully:', user.id);

    console.log('Register API: Creating default rates for user', user.id);
    // Create default rates for the new user
    await prisma.rate.createMany({
      data: [
        { userId: user.id, type: 'twoNumberTop', text: '2 ตัวบน', price: 100 },
        { userId: user.id, type: 'twoNumberButton', text: '2 ตัวล่าง', price: 100 },
        { userId: user.id, type: 'threeNumberTop', text: '3 ตัวบน', price: 800 },
        { userId: user.id, type: 'threeNumberTode', text: '3 ตัวโต๊ด', price: 125 },
      ],
    });
    console.log('Register API: Default rates created.');

    return NextResponse.json({ message: 'User registered successfully', user: { id: user.id, username: user.username } }, { status: 201 });
  } catch (error) {
    console.error('Register API: Registration error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
