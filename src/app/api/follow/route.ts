import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { followingId } = await request.json();
    if (!followingId || followingId === session.userId) {
      return NextResponse.json({ error: 'Invalid user to follow' }, { status: 400 });
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.userId, followingId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, following: false });
    }

    await prisma.follow.create({
      data: { followerId: session.userId, followingId },
    });

    await prisma.notification.create({
      data: {
        userId: followingId, type: 'NEW_FOLLOWER', title: 'New Follower',
        body: 'Someone started following you',
        link: '/profile',
      },
    });

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'following';
    const userId = searchParams.get('userId') || session.userId;

    if (type === 'followers') {
      const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: { include: { profile: { select: { displayName: true, avatarUrl: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ users: followers.map(f => f.follower) });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { include: { profile: { select: { displayName: true, avatarUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ users: following.map(f => f.following) });
  } catch {
    return NextResponse.json({ users: [] });
  }
}