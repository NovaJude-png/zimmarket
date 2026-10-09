import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        userA: { include: { profile: { select: { id: true, displayName: true, avatarUrl: true } } } },
        userB: { include: { profile: { select: { id: true, displayName: true, avatarUrl: true } } } },
        listing: {
          select: {
            id: true, title: true, price: true, currency: true,
            status: true, images: { take: 1, select: { url: true } },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.userAId !== session.userId && conversation.userBId !== session.userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.userId },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    const otherUser = conversation.userAId === session.userId ? conversation.userB : conversation.userA;

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        otherUser: { id: otherUser.id, profile: otherUser.profile },
        listing: conversation.listing,
      },
      messages,
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}