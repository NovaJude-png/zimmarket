import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        videos: true,
        seller: {
          include: {
            profile: true,
            _count: {
              select: {
                listings: { where: { status: 'ACTIVE' } },
                followers: true,
                reviewsReceived: true,
              },
            },
          },
        },
        category: true,
        reviews: {
          where: { isHidden: false },
          include: {
            author: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, favourites: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Increment view count (not for the seller themselves)
    if (!session || session.userId !== listing.sellerId) {
      await prisma.listing.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    // Check if user has favourited this listing
    let isFavourited = false;
    if (session) {
      const fav = await prisma.favourite.findUnique({
        where: { userId_listingId: { userId: session.userId, listingId: id } },
      });
      isFavourited = !!fav;
    }

    // Calculate seller average rating
    const avgRating = listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
      : 0;

    // Get verification level
    const verification = await prisma.verificationRequest.findUnique({
      where: { userId: listing.sellerId },
    });

    // Get similar listings
    const similarListings = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        categoryId: listing.categoryId,
        id: { not: id },
      },
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        seller: { include: { profile: { select: { displayName: true } } } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      listing: {
        ...listing,
        seller: {
          ...listing.seller,
          verificationLevel: verification?.currentLevel || 0,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: listing._count.reviews,
        },
      },
      isFavourited,
      similarListings,
    });
  } catch (error) {
    console.error('Listing fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId !== session.userId && session.accountType !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      'title', 'description', 'price', 'currency', 'isNegotiable',
      'condition', 'brand', 'model', 'year', 'quantity',
      'locationCity', 'locationProvince', 'locationArea',
      'contactPreference', 'deliveryAvailable', 'deliveryNote', 'status',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.title) {
      (updateData as Record<string, string>).slug = (updateData.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 100) + '-' + Date.now().toString(36);
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: { images: true, category: true },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Listing update error:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId !== session.userId && session.accountType !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.listing.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Listing delete error:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}