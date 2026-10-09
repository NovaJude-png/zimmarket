import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

// Polling endpoint for real-time messaging
// Client calls this every 3-5 seconds to check for new messages
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const since = searchParams.get('since'); // ISO timestamp of last received message

    if (!conversationId) {
      // Return unread message count
      const unreadCount = await prisma.message.count({
        where: {
          conversation: {
            OR: [
              { userAId: session.userId },
              { userBId: session.userId },
            ],
          },
          senderId: { not: session.userId },
          isRead: false,
        },
      });

      return NextResponse.json({ unreadCount });
    }

    // Verify user belongs to conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || (conversation.userAId !== session.userId && conversation.userBId !== session.userId)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get messages since last poll
    const where: Record<string, unknown> = {
      conversationId,
      senderId: { not: session.userId },
    };

    if (since) {
      where.createdAt = { gt: new Date(since) };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    // Mark messages as read
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: session.userId },
          isRead: false,
        },
        data: { isRead: true, readAt: new Date() },
      });
    }

    return NextResponse.json({
      messages,
      hasNew: messages.length > 0,
    });
  } catch (error) {
    console.error('Message poll error:', error);
    return NextResponse.json({ error: 'Poll failed' }, { status: 500 });
  }
}