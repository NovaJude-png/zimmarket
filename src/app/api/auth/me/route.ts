import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';
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
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const body = await request.json();

    // Password change
    if (body.currentPassword && body.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user || !user.passwordHash) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const valid = await verifyPassword(body.currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

      if (body.newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });

      const newHash = await hashPassword(body.newPassword);
      await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: newHash } });
      return NextResponse.json({ success: true, message: 'Password changed' });
    }

    // Profile update
    const { displayName, bio, phone, locationCity } = body;
    if (displayName || bio !== undefined || locationCity) {
      await prisma.profile.upsert({
        where: { userId: session.userId },
        update: {
          ...(displayName && { displayName: displayName.trim() }),
          ...(bio !== undefined && { bio }),
          ...(locationCity && { locationCity }),
        },
        create: {
          userId: session.userId,
          displayName: displayName?.trim() || 'User',
          username: (displayName || 'user').trim().toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 999),
          bio: bio || null,
          locationCity: locationCity || null,
          locationCountry: 'Zimbabwe',
        },
      });
    }

    if (phone !== undefined) {
      await prisma.user.update({ where: { id: session.userId }, data: { phone: phone || null } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}