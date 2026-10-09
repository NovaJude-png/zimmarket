import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const favourites = await prisma.favourite.findMany({
      where: { userId: session.userId },
      include: {
        listing: {
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
            seller: { include: { profile: { select: { displayName: true } } } },
            category: { select: { name: true, icon: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favourites: favourites.map(f => f.listing) });
  } catch (error) {
    console.error('Favourites fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch favourites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { listingId } = await request.json();
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    const existing = await prisma.favourite.findUnique({
      where: { userId_listingId: { userId: session.userId, listingId } },
    });

    if (existing) {
      // Remove favourite
      await prisma.favourite.delete({ where: { id: existing.id } });
      await prisma.listing.update({
        where: { id: listingId },
        data: { favouriteCount: { decrement: 1 } },
      });
      return NextResponse.json({ success: true, favourited: false });
    }

    // Add favourite
    await prisma.favourite.create({
      data: { userId: session.userId, listingId },
    });
    await prisma.listing.update({
      where: { id: listingId },
      data: { favouriteCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, favourited: true });
  } catch (error) {
    console.error('Favourite toggle error:', error);
    return NextResponse.json({ error: 'Failed to update favourite' }, { status: 500 });
  }
}