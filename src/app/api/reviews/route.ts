import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get('targetId');
    if (!targetId) return NextResponse.json({ reviews: [] });

    const reviews = await prisma.review.findMany({
      where: { targetId },
      include: {
        author: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { targetId, listingId, rating, comment } = await request.json();

    if (!targetId || !rating) {
      return NextResponse.json({ error: 'Target user and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (targetId === session.userId) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
    }

    // Check for duplicate review
    const existing = await prisma.review.findUnique({
      where: {
        authorId_targetId_listingId: {
          authorId: session.userId,
          targetId,
          listingId: listingId || null,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this seller for this listing' }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        authorId: session.userId,
        targetId,
        listingId: listingId || null,
        rating: Math.round(rating),
        comment: comment?.trim() || null,
        isVerified: !!listingId,
      },
      include: {
        author: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: targetId,
        type: 'NEW_REVIEW',
        title: 'New Review',
        body: `You received a ${rating}-star review`,
        link: `/profile`,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}