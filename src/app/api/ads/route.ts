import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/ads — Fetch active ads for display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') || 'HOMEPAGE'; // HOMEPAGE, SEARCH, CATEGORY, LISTING_PAGE
    const categoryId = searchParams.get('categoryId');
    const city = searchParams.get('city');
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 10);

    const now = new Date();

    // Build targeting filters
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (categoryId) where.targetCategory = categoryId;
    if (city) where.targetLocation = { contains: city };

    const campaigns = await prisma.adCampaign.findMany({
      where,
      include: {
        user: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
        ads: { where: { placement, isActive: true } },
      },
      orderBy: { dailyBudget: 'desc' }, // Higher budget = higher priority
      take: limit,
    });

    // Track impressions
    const adIds = campaigns.flatMap(c => c.ads.map(a => a.id));
    if (adIds.length > 0) {
      await prisma.ad.updateMany({
        where: { id: { in: adIds } },
        data: { impressions: { increment: 1 } },
      });
      await prisma.adCampaign.updateMany({
        where: { id: { in: campaigns.map(c => c.id) } },
        data: { impressions: { increment: 1 } },
      });
    }

    const ads = campaigns.map(c => ({
      id: c.id,
      title: c.creativeTitle,
      text: c.creativeText,
      image: c.creativeImage,
      link: c.creativeLink,
      type: c.campaignType,
      advertiser: c.user?.profile?.displayName || 'Advertiser',
    }));

    return NextResponse.json({ ads, count: ads.length });
  } catch (error) {
    console.error('Ads fetch error:', error);
    return NextResponse.json({ ads: [], count: 0 });
  }
}

// POST /api/ads — Create ad campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, campaignType, budget, dailyBudget, startDate, endDate,
      targetLocation, targetCategory, targetAudience,
      creativeTitle, creativeText, creativeImage, creativeLink,
    } = body;

    // Validation
    if (!name || !campaignType || !budget || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields: name, campaignType, budget, startDate, endDate' }, { status: 400 });
    }

    if (!creativeTitle || !creativeLink) {
      return NextResponse.json({ error: 'creativeTitle and creativeLink are required' }, { status: 400 });
    }

    // Content moderation — check for prohibited content
    const prohibited = ['scam', 'fake', 'counterfeit', 'stolen', 'illegal'];
    const textToCheck = `${creativeTitle} ${creativeText || ''}`.toLowerCase();
    const hasProhibited = prohibited.some(word => textToCheck.includes(word));

    if (hasProhibited) {
      return NextResponse.json({
        error: 'Your ad contains prohibited content. Please review our advertising policy.',
      }, { status: 400 });
    }

    const campaign = await prisma.adCampaign.create({
      data: {
        userId: session.userId,
        name,
        campaignType,
        budget: parseFloat(budget),
        dailyBudget: dailyBudget ? parseFloat(dailyBudget) : null,
        spent: 0,
        currency: 'USD',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetLocation: targetLocation || null,
        targetCategory: targetCategory || null,
        targetAudience: targetAudience ? JSON.stringify(targetAudience) : null,
        creativeTitle,
        creativeText: creativeText || null,
        creativeImage: creativeImage || null,
        creativeLink,
        status: 'PENDING_REVIEW',
        ads: {
          create: getPlacements(campaignType).map(placement => ({
            placement,
            isActive: true,
          })),
        },
      },
      include: { ads: true },
    });

    // Create notification for admin
    const admins = await prisma.user.findMany({
      where: { accountType: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'AD_REVIEW',
          title: 'New Ad Campaign Pending Review',
          body: `"${name}" by ${session.userId} needs review`,
          link: `/admin/advertising`,
        },
      });
    }

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error) {
    console.error('Ad creation error:', error);
    return NextResponse.json({ error: 'Failed to create ad campaign' }, { status: 500 });
  }
}

// Map campaign types to ad placements
function getPlacements(campaignType: string): string[] {
  const map: Record<string, string[]> = {
    SPONSORED_LISTING: ['SEARCH', 'CATEGORY'],
    SPONSORED_SEARCH: ['SEARCH'],
    HOMEPAGE_BANNER: ['HOMEPAGE'],
    CATEGORY_BANNER: ['CATEGORY'],
    BUSINESS_PROMO: ['HOMEPAGE', 'SEARCH'],
    FEATURED_STORE: ['HOMEPAGE', 'CATEGORY'],
    LOCATION_BASED: ['SEARCH', 'CATEGORY', 'LISTING_PAGE'],
  };
  return map[campaignType] || ['HOMEPAGE'];
}