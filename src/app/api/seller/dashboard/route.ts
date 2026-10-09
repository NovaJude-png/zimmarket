import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.userId;

    const [
      activeListings,
      draftListings,
      pendingListings,
      soldListings,
      expiredListings,
      totalViews,
      totalEnquiries,
      totalFavourites,
      followers,
      reviews,
      conversations,
    ] = await Promise.all([
      prisma.listing.count({ where: { sellerId: userId, status: 'ACTIVE' } }),
      prisma.listing.count({ where: { sellerId: userId, status: 'DRAFT' } }),
      prisma.listing.count({ where: { sellerId: userId, status: 'PENDING' } }),
      prisma.listing.count({ where: { sellerId: userId, status: 'SOLD' } }),
      prisma.listing.count({ where: { sellerId: userId, status: 'EXPIRED' } }),
      prisma.listing.aggregate({ where: { sellerId: userId }, _sum: { viewCount: true } }),
      prisma.listing.aggregate({ where: { sellerId: userId }, _sum: { enquiryCount: true } }),
      prisma.listing.aggregate({ where: { sellerId: userId }, _sum: { favouriteCount: true } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.review.findMany({
        where: { targetId: userId, isHidden: false },
        include: { author: { include: { profile: { select: { displayName: true, avatarUrl: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.conversation.count({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
      }),
    ]);

    // Calculate average rating
    const allReviews = await prisma.review.findMany({
      where: { targetId: userId, isHidden: false },
      select: { rating: true },
    });

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    // Recent listings
    const recentListings = await prisma.listing.findMany({
      where: { sellerId: userId },
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true, icon: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Views over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentListingsWithViews = await prisma.listing.findMany({
      where: { sellerId: userId, createdAt: { gte: thirtyDaysAgo } },
      select: { viewCount: true, createdAt: true, title: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      stats: {
        activeListings,
        draftListings,
        pendingListings,
        soldListings,
        expiredListings,
        totalViews: totalViews._sum.viewCount || 0,
        totalEnquiries: totalEnquiries._sum.enquiryCount || 0,
        totalFavourites: totalFavourites._sum.favouriteCount || 0,
        followers,
        totalReviews: allReviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        conversations,
      },
      reviews,
      recentListings,
      viewsTimeline: recentListingsWithViews,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}