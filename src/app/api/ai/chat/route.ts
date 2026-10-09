import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

// AI-powered search and assistant
// This uses keyword extraction and database search rather than external AI APIs
// Can be upgraded to use OpenAI/Claude API when credentials are configured

interface SearchIntent {
  query: string;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  city?: string;
  condition?: string;
  brand?: string;
}

function parseNaturalLanguage(input: string): SearchIntent {
  const lower = input.toLowerCase();
  const intent: SearchIntent = { query: '' };

  // Extract price constraints
  const priceMatch = lower.match(/(?:under|below|less than|max|up to|for)\s*\$?\s*(\d[\d,]*)/);
  if (priceMatch) {
    intent.maxPrice = parseInt(priceMatch[1].replace(/,/g, ''));
  }

  const minPriceMatch = lower.match(/(?:over|above|more than|min|at least)\s*\$?\s*(\d[\d,]*)/);
  if (minPriceMatch) {
    intent.minPrice = parseInt(minPriceMatch[1].replace(/,/g, ''));
  }

  // Extract city
  const cities = ['harare', 'bulawayo', 'mutare', 'gweru', 'kwekwe', 'masvingo', 'kadoma', 'chitungwiza', 'marondera', 'victoria falls', 'chinhoyi', 'bindura'];
  for (const city of cities) {
    if (lower.includes(city)) {
      intent.city = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Extract category hints
  const categoryMap: Record<string, string[]> = {
    'Vehicles': ['car', 'cars', 'vehicle', 'vehicles', 'toyota', 'honda', 'nissan', 'mercedes', 'bmw', 'truck', 'suv', 'sedan', 'motor'],
    'Phones & Electronics': ['phone', 'phones', 'smartphone', 'iphone', 'samsung', 'huawei', 'tecno', 'itel', 'infinix', 'tablet'],
    'Computers': ['laptop', 'computer', 'pc', 'desktop', 'macbook', 'chromebook', 'notebook'],
    'Property': ['house', 'property', 'apartment', 'stand', 'plot', 'rent', 'room', 'flat', 'townhouse'],
    'Furniture': ['furniture', 'sofa', 'bed', 'table', 'chair', 'desk', 'wardrobe', 'cabinet', 'cupboard', 'mattress'],
    'Home Appliances': ['fridge', 'washer', 'stove', 'microwave', 'tv', 'television', 'aircon', 'fan', 'freezer'],
    'Fashion': ['clothes', 'shoes', 'dress', 'fashion', 'sneakers', 'shirt', 'jacket'],
    'Jobs': ['job', 'jobs', 'work', 'vacancy', 'employment', 'hiring', 'position'],
    'Services': ['service', 'plumber', 'electrician', 'tutor', 'cleaning', 'repair'],
  };

  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => lower.includes(kw))) {
      intent.category = cat;
      break;
    }
  }

  // Extract condition
  if (lower.includes('new')) intent.condition = 'NEW';
  else if (lower.includes('used')) intent.condition = 'USED_GOOD';

  // Extract brand
  const brands = ['toyota', 'honda', 'nissan', 'samsung', 'apple', 'iphone', 'huawei', 'tecno', 'dell', 'hp', 'lenovo', 'mercedes', 'bmw'];
  for (const brand of brands) {
    if (lower.includes(brand)) {
      intent.brand = brand;
      break;
    }
  }

  // Clean up the search query - remove extracted parts
  let query = lower;
  if (intent.maxPrice) query = query.replace(/(?:under|below|less than|max|up to|for)\s*\$?\s*\d[\d,]*/g, '');
  if (intent.minPrice) query = query.replace(/(?:over|above|more than|min|at least)\s*\$?\s*\d[\d,]*/g, '');
  if (intent.city) query = query.replace(new RegExp(intent.city, 'gi'), '');
  for (const brand of brands) {
    query = query.replace(new RegExp(brand, 'gi'), '');
  }
  query = query.replace(/\s+/g, ' ').trim();

  intent.query = query;
  return intent;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const { message, mode } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Log AI request
    const aiRequest = await prisma.aIRequest.create({
      data: {
        userId: session?.userId || null,
        type: mode === 'buyer' ? 'BUYER_ASSISTANT' : 'NATURAL_SEARCH',
        input: JSON.stringify({ message, mode }),
        status: 'PENDING',
      },
    });

    const startTime = Date.now();
    const intent = parseNaturalLanguage(message);

    // Build search query
    const conditions: Record<string, unknown>[] = [{ status: 'ACTIVE' }];

    // Build OR conditions for text search - only use brand/title search
    // Skip raw leftover text when category is already identified
    const orConditions: Record<string, unknown>[] = [];
    if (intent.brand) {
      orConditions.push(
        { brand: { contains: intent.brand } },
        { title: { contains: intent.brand } },
      );
    }
    // If no category was identified, use the text query for search
    if (!intent.category && intent.query && intent.query.length > 2) {
      orConditions.push(
        { title: { contains: intent.query } },
        { description: { contains: intent.query } },
      );
    }
    if (orConditions.length > 0) {
      conditions.push({ OR: orConditions });
    }

    if (intent.category) {
      // Try exact match first, then partial with startsWith
      const category = await prisma.category.findFirst({
        where: { name: intent.category },
      }) || await prisma.category.findFirst({
        where: { name: { startsWith: intent.category } },
      }) || await prisma.category.findFirst({
        where: { slug: { contains: intent.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') } },
      });
      if (category) conditions.push({ categoryId: category.id });
    }

    if (intent.maxPrice) conditions.push({ price: { lte: intent.maxPrice } });
    if (intent.minPrice) conditions.push({ price: { gte: intent.minPrice } });
    if (intent.city) conditions.push({ locationCity: { contains: intent.city } });
    if (intent.condition) conditions.push({ condition: intent.condition });

    const listings = await prisma.listing.findMany({
      where: { AND: conditions },
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        seller: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
        category: { select: { name: true, icon: true } },
      },
      orderBy: [{ isPromoted: 'desc' }, { publishedAt: 'desc' }],
      take: 20,
    });

    // Generate response message
    let responseText = '';
    if (listings.length === 0) {
      responseText = `I couldn't find any listings matching "${message}". Try adjusting your search - maybe a different price range, location, or category?`;
    } else {
      const parts = [`I found ${listings.length} listing${listings.length > 1 ? 's' : ''} for you`];
      if (intent.category) parts.push(`in ${intent.category}`);
      if (intent.maxPrice) parts.push(`under $${intent.maxPrice.toLocaleString()}`);
      if (intent.city) parts.push(`in ${intent.city}`);
      responseText = parts.join(' ') + '. Here are the best matches:';
    }

    // Update AI request
    await prisma.aIRequest.update({
      where: { id: aiRequest.id },
      data: {
        output: JSON.stringify({ responseText, listingsCount: listings.length }),
        latency: Date.now() - startTime,
        status: 'COMPLETED',
      },
    });

    return NextResponse.json({
      response: responseText,
      listings,
      parsedIntent: intent,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'AI assistant is temporarily unavailable' }, { status: 500 });
  }
}