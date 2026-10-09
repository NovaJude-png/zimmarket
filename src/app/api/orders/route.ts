import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const asSeller = searchParams.get('asSeller') === 'true';
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (asSeller) {
      where.sellerId = session.userId;
    } else {
      where.buyerId = session.userId;
    }
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, price: true } },
        buyer: { include: { profile: { select: { displayName: true } } } },
        seller: { include: { profile: { select: { displayName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const { listingId, quantity = 1, message } = await request.json();
    if (!listingId) return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.sellerId === session.userId) return NextResponse.json({ error: 'Cannot buy your own listing' }, { status: 400 });

    // Create or get conversation
    const userAId = session.userId < listing.sellerId ? session.userId : listing.sellerId;
    const userBId = session.userId < listing.sellerId ? listing.sellerId : session.userId;

    let conversation = await prisma.conversation.findUnique({
      where: { userAId_userBId_listingId: { userAId, userBId, listingId } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userAId, userBId, listingId },
      });
    }

    // Create order
    const total = Number(listing.price) * quantity;
    const order = await prisma.order.create({
      data: {
        listingId,
        buyerId: session.userId,
        sellerId: listing.sellerId,
        quantity,
        unitPrice: listing.price,
        total,
        currency: listing.currency,
        status: 'PENDING',
      },
    });

    // Send initial message if provided
    if (message) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.userId,
          content: message,
        },
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMsgAt: new Date() },
      });
    }

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: listing.sellerId, type: 'ORDER', title: 'New Order!',
        body: `Someone wants to buy "${listing.title}"`,
        link: '/seller/dashboard',
      },
    });

    return NextResponse.json({ order, conversationId: conversation.id });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}