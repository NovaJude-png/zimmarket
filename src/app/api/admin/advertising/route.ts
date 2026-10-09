import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (status && status !== 'ALL') where.status = status;

  // Admin sees all, regular users see only their own
  if (session.accountType !== 'ADMIN') where.userId = session.userId;

  const campaigns = await prisma.adCampaign.findMany({
    where,
    include: {
      user: { include: { profile: { select: { displayName: true } } } },
      ads: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ campaigns });
}