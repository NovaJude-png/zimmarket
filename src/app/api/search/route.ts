import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;

    // Build where clause
    const conditions: Record<string, unknown>[] = [{ status: 'ACTIVE' }];

    // Text search
    if (query) {
      conditions.push({
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { brand: { contains: query } },
          { model: { contains: query } },
        ],
      });
    }

    // Category filter
    const categoryId = searchParams.get('categoryId');
    if (categoryId) conditions.push({ categoryId });

    // Location filters
    const city = searchParams.get('city');
    if (city) conditions.push({ locationCity: city });

    const province = searchParams.get('province');
    if (province) conditions.push({ locationProvince: province });

    // Price filters
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      conditions.push({ price: priceFilter });
    }

    // Condition filter
    const condition = searchParams.get('condition');
    if (condition) conditions.push({ condition });

    // Negotiable filter
    const negotiable = searchParams.get('negotiable');
    if (negotiable === 'true') conditions.push({ isNegotiable: true });

    // Delivery filter
    const delivery = searchParams.get('delivery');
    if (delivery === 'true') conditions.push({ deliveryAvailable: true });

    // Verified sellers only
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      conditions.push({
        seller: {
          verificationReq: { currentLevel: { gte: 2 } },
        },
      });
    }

    const where = { AND: conditions };

    // Sort
    const sortBy = searchParams.get('sortBy') || 'relevance';
    let orderBy: Record<string, string> | Record<string, string>[] = {};
    switch (sortBy) {
      case 'newest': orderBy = { publishedAt: 'desc' }; break;
      case 'oldest': orderBy = { publishedAt: 'asc' }; break;
      case 'price_low': orderBy = { price: 'asc' }; break;
      case 'price_high': orderBy = { price: 'desc' }; break;
      case 'views': orderBy = { viewCount: 'desc' }; break;
      default:
        // Relevance: boosted listings first, then by date
        orderBy = [
          { isPromoted: 'desc' },
          { isFeatured: 'desc' },
          { publishedAt: 'desc' },
        ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          seller: {
            include: {
              profile: { select: { displayName: true, avatarUrl: true, locationCity: true } },
            },
          },
          category: { select: { id: true, name: true, slug: true, icon: true } },
          _count: { select: { reviews: true, favourites: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    // Get category aggregations for filters
    const categoryAgg = await prisma.listing.groupBy({
      by: ['categoryId'],
      where: { AND: conditions },
      _count: true,
    });

    const categoryIds = categoryAgg.map(c => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, icon: true },
    });

    const categoryCounts = categoryAgg.map(c => ({
      ...categories.find(cat => cat.id === c.categoryId),
      count: c._count,
    }));

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
      filters: {
        categories: categoryCounts,
      },
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}