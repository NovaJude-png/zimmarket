import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.accountType !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin required' }, { status: 403 });
  }

  try {
    const [users, listings, orders, reports, ads] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.report.count(),
      prisma.adCampaign.count(),
    ]);

    return NextResponse.json({ users, listings, orders, reports, ads });
  } catch {
    return NextResponse.json({ users: 0, listings: 0, orders: 0, reports: 0, ads: 0 });
  }
}