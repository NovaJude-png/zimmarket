import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, createSession, setSessionCookie, generateVerifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password, displayName, locationCity, locationProvince } = body;

    // Validation
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
    }

    if (!displayName || displayName.trim().length < 2) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    // Check for existing user
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
    }

    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json({ error: 'An account with this phone number already exists' }, { status: 409 });
      }
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const emailVerifyToken = email ? generateVerifyToken() : null;

    const user = await prisma.user.create({
      data: {
        email: email?.toLowerCase(),
        phone,
        passwordHash,
        emailVerifyToken,
        accountType: 'BUYER',
        profile: {
          create: {
            displayName: displayName.trim(),
            username: displayName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 999),
            locationCity: locationCity || null,
            locationProvince: locationProvince || null,
            locationCountry: 'Zimbabwe',
          },
        },
      },
      include: { profile: true },
    });

    // Create session
    const token = await createSession(user.id, user.email || '', user.accountType);
    await setSessionCookie(token);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        targetType: 'USER',
        targetId: user.id,
        details: JSON.stringify({ method: email ? 'email' : 'phone' }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}