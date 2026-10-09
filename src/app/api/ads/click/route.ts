import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Track ad clicks
export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json();
    if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 });

    await prisma.adCampaign.update({
      where: { id: campaignId },
      data: { clicks: { increment: 1 } },
    });

    const campaign = await prisma.adCampaign.findUnique({
      where: { id: campaignId },
      select: { creativeLink: true },
    });

    return NextResponse.json({ success: true, redirect: campaign?.creativeLink || '/' });
  } catch (error) {
    console.error('Ad click error:', error);
    return NextResponse.json({ error: 'Click tracking failed' }, { status: 500 });
  }
}