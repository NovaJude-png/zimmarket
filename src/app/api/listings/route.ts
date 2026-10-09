import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: 'ACTIVE' };

    if (searchParams.get('categoryId')) where.categoryId = searchParams.get('categoryId');
    if (searchParams.get('city')) where.locationCity = searchParams.get('city');
    if (searchParams.get('province')) where.locationProvince = searchParams.get('province');
    if (searchParams.get('condition')) where.condition = searchParams.get('condition');
    if (searchParams.get('minPrice') || searchParams.get('maxPrice')) {
      where.price = {};
      if (searchParams.get('minPrice')) (where.price as Record<string, number>).gte = parseFloat(searchParams.get('minPrice')!);
      if (searchParams.get('maxPrice')) (where.price as Record<string, number>).lte = parseFloat(searchParams.get('maxPrice')!);
    }

    const sortBy = searchParams.get('sortBy') || 'newest';
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'price_low': orderBy = { price: 'asc' }; break;
      case 'price_high': orderBy = { price: 'desc' }; break;
      case 'views': orderBy = { viewCount: 'desc' }; break;
      default: orderBy = { createdAt: 'desc' };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          seller: {
            include: {
              profile: { select: { displayName: true, username: true, avatarUrl: true, locationCity: true } },
            },
          },
          category: { select: { id: true, name: true, slug: true, icon: true } },
          _count: { select: { reviews: true, favourites: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Listings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title, description, categoryId, price, currency, isNegotiable,
      condition, brand, model, year, quantity, locationCity, locationProvince,
      locationArea, contactPreference, deliveryAvailable, deliveryNote,
      images, status,
    } = body;

    // Validation
    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (price === undefined || price === null || price < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }
    if (!condition) {
      return NextResponse.json({ error: 'Condition is required' }, { status: 400 });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const slug = slugify(title) + '-' + Date.now().toString(36);
    const finalStatus = status === 'DRAFT' ? 'DRAFT' : 'PENDING';

    const listing = await prisma.listing.create({
      data: {
        sellerId: session.userId,
        categoryId,
        title: title.trim(),
        slug,
        description: description.trim(),
        price: parseFloat(price),
        currency: currency || 'USD',
        isNegotiable: isNegotiable !== false,
        condition,
        brand: brand || null,
        model: model || null,
        year: year ? parseInt(year) : null,
        quantity: quantity ? parseInt(quantity) : 1,
        locationCountry: 'Zimbabwe',
        locationProvince: locationProvince || null,
        locationCity: locationCity || null,
        locationArea: locationArea || null,
        contactPreference: contactPreference || 'MESSAGE',
        deliveryAvailable: deliveryAvailable || false,
        deliveryNote: deliveryNote || null,
        status: finalStatus,
        publishedAt: finalStatus === 'PENDING' ? new Date() : null,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        images: images && images.length > 0 ? {
          create: images.map((img: { url: string; altText?: string }, i: number) => ({
            url: img.url,
            altText: img.altText || title,
            sortOrder: i,
            isPrimary: i === 0,
          })),
        } : undefined,
      },
      include: {
        images: true,
        category: true,
      },
    });

    // Auto-approve for now (can be changed to require moderation)
    if (finalStatus === 'PENDING') {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { status: 'ACTIVE' },
      });
    }

    // Update user account type if they're a buyer
    await prisma.user.updateMany({
      where: { id: session.userId, accountType: 'BUYER' },
      data: { accountType: 'INDIVIDUAL_SELLER' },
    });

    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    console.error('Listing create error:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}