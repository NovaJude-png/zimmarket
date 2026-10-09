import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.accountType !== 'ADMIN') return NextResponse.json({ error: 'Admin required' }, { status: 403 });

  const { id } = await params;
  const { action } = await request.json();

  const statusMap: Record<string, string> = {
    complete: 'COMPLETED',
    dispute: 'DISPUTED',
    resolve: 'COMPLETED',
    cancel: 'CANCELLED',
  };

  if (!statusMap[action]) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  await prisma.order.update({ where: { id }, data: { status: statusMap[action] } });
  return NextResponse.json({ success: true });
}