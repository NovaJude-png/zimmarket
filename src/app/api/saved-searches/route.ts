import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const searches = await prisma.savedSearch.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ searches });
  } catch {
    return NextResponse.json({ searches: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { name, query, categoryId, city, minPrice, maxPrice, condition, sortBy } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const search = await prisma.savedSearch.create({
      data: {
        userId: session.userId,
        name,
        query: query || null,
        filters: JSON.stringify({ categoryId, city, minPrice, maxPrice, condition, sortBy }),
      },
    });

    return NextResponse.json({ search });
  } catch (error) {
    console.error('Saved search error:', error);
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { id } = await request.json();
    await prisma.savedSearch.deleteMany({ where: { id, userId: session.userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}