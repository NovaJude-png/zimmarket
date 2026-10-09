import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { userAId: session.userId },
          { userBId: session.userId },
        ],
      },
      include: {
        userA: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
        userB: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
        listing: { select: { id: true, title: true, images: { take: 1, select: { url: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMsgAt: 'desc' },
    });

    const formatted = conversations.map(conv => {
      const otherUser = conv.userAId === session.userId ? conv.userB : conv.userA;
      const unreadCount = 0; // Would need separate query for accuracy
      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          profile: otherUser.profile,
        },
        listing: conv.listing,
        lastMessage: conv.lastMessage,
        lastMsgAt: conv.lastMsgAt,
        unreadCount,
      };
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { recipientId, listingId, message } = await request.json();

    if (!recipientId || !message) {
      return NextResponse.json({ error: 'Recipient and message are required' }, { status: 400 });
    }

    if (recipientId === session.userId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    // Check if blocked
    const blocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: session.userId, blockedId: recipientId },
          { blockerId: recipientId, blockedId: session.userId },
        ],
      },
    });

    if (blocked) {
      return NextResponse.json({ error: 'Unable to send message' }, { status: 403 });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { userAId: session.userId, userBId: recipientId, listingId: listingId || null },
          { userAId: recipientId, userBId: session.userId, listingId: listingId || null },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userAId: session.userId,
          userBId: recipientId,
          listingId: listingId || null,
        },
      });
    }

    // Create message
    const msg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.userId,
        content: message.trim(),
        messageType: 'TEXT',
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: message.trim().substring(0, 100),
        lastMsgAt: new Date(),
      },
    });

    // Create notification for recipient
    const sender = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: { select: { displayName: true } } },
    });

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: 'New Message',
        body: `${sender?.profile?.displayName || 'Someone'} sent you a message`,
        link: `/messages/${conversation.id}`,
      },
    });

    return NextResponse.json({ success: true, message: msg, conversationId: conversation.id });
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}