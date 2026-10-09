import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.accountType !== 'ADMIN') return NextResponse.json({ error: 'Admin required' }, { status: 403 });

  const { id } = await params;
  const { action } = await request.json();

  const statusMap: Record<string, string> = {
    approve: 'ACTIVE',
    reject: 'REJECTED',
    pause: 'PAUSED',
    resume: 'ACTIVE',
    complete: 'COMPLETED',
  };

  if (!statusMap[action]) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  await prisma.adCampaign.update({
    where: { id },
    data: { status: statusMap[action] },
  });

  // Notify advertiser
  const campaign = await prisma.adCampaign.findUnique({ where: { id }, select: { userId: true, name: true } });
  if (campaign) {
    await prisma.notification.create({
      data: {
        userId: campaign.userId,
        type: 'AD_STATUS',
        title: `Campaign ${action === 'approve' ? 'Approved' : 'Updated'}`,
        body: `"${campaign.name}" has been ${statusMap[action].toLowerCase()}`,
        link: '/ads/dashboard',
      },
    });
  }

  return NextResponse.json({ success: true });
}