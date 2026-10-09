import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        roles: { include: { role: true } },
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
            followers: true,
            following: true,
            reviewsReceived: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null });
    }

    // Get verification level
    const verification = await prisma.verificationRequest.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        verificationLevel: verification?.currentLevel || 0,
        profile: user.profile,
        roles: user.roles.map(ur => ur.role.name),
        stats: {
          activeListings: user._count.listings,
          followers: user._count.followers,
          following: user._count.following,
          reviews: user._count.reviewsReceived,
        },
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ user: null });
  }
}