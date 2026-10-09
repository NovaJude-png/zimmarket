import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.accountType !== 'ADMIN') {
    return null;
  }
  return session;
}

// GET /api/admin/[path]
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { path } = await params;
  const resource = path[0];
  const { searchParams } = new URL(request.url);

  try {
    switch (resource) {
      case 'stats': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
          totalUsers, activeUsers, newUsersToday, totalListings,
          activeListings, newListingsToday, soldListings, pendingReports,
          totalRevenue, activeSubscriptions, totalMessages,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
          prisma.user.count({ where: { createdAt: { gte: today } } }),
          prisma.listing.count(),
          prisma.listing.count({ where: { status: 'ACTIVE' } }),
          prisma.listing.count({ where: { createdAt: { gte: today } } }),
          prisma.listing.count({ where: { status: 'SOLD' } }),
          prisma.report.count({ where: { status: 'SUBMITTED' } }),
          prisma.payment.aggregate({ where: { status: 'SUCCESSFUL' }, _sum: { amount: true } }),
          prisma.subscription.count({ where: { status: 'ACTIVE' } }),
          prisma.message.count(),
        ]);

        return NextResponse.json({
          stats: {
            totalUsers, activeUsers, newUsersToday, totalListings,
            activeListings, newListingsToday, soldListings, pendingReports,
            totalRevenue: totalRevenue._sum.amount || 0,
            activeSubscriptions, totalMessages,
          },
        });
      }

      case 'users': {
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type');

        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { email: { contains: search } },
            { phone: { contains: search } },
            { profile: { displayName: { contains: search } } },
          ];
        }
        if (type) where.accountType = type;

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            include: { profile: true },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.user.count({ where }),
        ]);

        return NextResponse.json({
          users: users.map(u => ({
            ...u,
            passwordHash: undefined, // Never expose
          })),
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }

      case 'listings': {
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const search = searchParams.get('search') || '';

        const where: Record<string, unknown> = {};
        if (status && status !== 'ALL') where.status = status;
        if (search) where.title = { contains: search };

        const [listings, total] = await Promise.all([
          prisma.listing.findMany({
            where,
            include: {
              images: { take: 1 },
              seller: { include: { profile: { select: { displayName: true } } } },
              category: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.listing.count({ where }),
        ]);

        return NextResponse.json({
          listings,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }

      case 'categories': {
        const categories = await prisma.category.findMany({
          include: { _count: { select: { listings: true } } },
          orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json({ categories });
      }

      case 'reports': {
        const status = searchParams.get('status');
        const where: Record<string, unknown> = {};
        if (status && status !== 'ALL') where.status = status;

        const reports = await prisma.report.findMany({
          where,
          include: {
            author: { include: { profile: { select: { displayName: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
        return NextResponse.json({ reports });
      }

      case 'subscriptions': {
        const plans = await prisma.subscriptionPlan.findMany({
          include: { _count: { select: { subscriptions: true } } },
          orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json({ plans });
      }

      case 'payments': {
        const payments = await prisma.payment.findMany({
          include: { user: { include: { profile: { select: { displayName: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
        return NextResponse.json({ payments });
      }

      case 'verifications': {
        const requests = await prisma.verificationRequest.findMany({
          where: { status: searchParams.get('status') || undefined },
          include: { user: { include: { profile: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
        return NextResponse.json({ requests });
      }

      case 'audit-log': {
        const logs = await prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        return NextResponse.json({ logs });
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Admin GET ${resource} error:`, error);
    return NextResponse.json({ error: 'Admin request failed' }, { status: 500 });
  }
}

// PUT /api/admin/[path]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { path } = await params;
  const resource = path[0];
  const id = path[1];
  const body = await request.json();

  try {
    switch (resource) {
      case 'users': {
        if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (body.action === 'ban') {
          await prisma.user.update({
            where: { id },
            data: { isBanned: true, banReason: body.reason || 'Violation of terms' },
          });
          await prisma.auditLog.create({
            data: {
              userId: session.userId, action: 'USER_BAN', targetType: 'USER',
              targetId: id, details: JSON.stringify({ reason: body.reason }),
            },
          });
          return NextResponse.json({ success: true });
        }

        if (body.action === 'unban') {
          await prisma.user.update({ where: { id }, data: { isBanned: false, banReason: null } });
          return NextResponse.json({ success: true });
        }

        if (body.action === 'setAccountType') {
          await prisma.user.update({ where: { id }, data: { accountType: body.accountType } });
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
      }

      case 'listings': {
        if (!id) return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });

        if (body.action === 'approve') {
          await prisma.listing.update({
            where: { id },
            data: { status: 'ACTIVE', publishedAt: new Date() },
          });
          return NextResponse.json({ success: true });
        }

        if (body.action === 'reject') {
          await prisma.listing.update({
            where: { id },
            data: { status: 'REJECTED', rejectionReason: body.reason },
          });
          return NextResponse.json({ success: true });
        }

        if (body.action === 'feature') {
          await prisma.listing.update({
            where: { id },
            data: { isFeatured: !body.currentFeatured },
          });
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
      }

      case 'categories': {
        if (body.action === 'create') {
          const cat = await prisma.category.create({
            data: {
              name: body.name,
              slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: body.description,
              icon: body.icon,
              parentId: body.parentId || null,
              sortOrder: body.sortOrder || 0,
            },
          });
          return NextResponse.json({ success: true, category: cat });
        }

        if (id) {
          if (body.action === 'update') {
            await prisma.category.update({
              where: { id },
              data: {
                name: body.name,
                description: body.description,
                icon: body.icon,
                sortOrder: body.sortOrder,
                isActive: body.isActive,
              },
            });
            return NextResponse.json({ success: true });
          }
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
      }

      case 'reports': {
        if (!id) return NextResponse.json({ error: 'Report ID required' }, { status: 400 });

        await prisma.report.update({
          where: { id },
          data: {
            status: body.status,
            adminNotes: body.notes,
            resolvedBy: session.userId,
            resolvedAt: new Date(),
          },
        });
        return NextResponse.json({ success: true });
      }

      case 'verifications': {
        if (!id) return NextResponse.json({ error: 'Request ID required' }, { status: 400 });

        if (body.action === 'approve') {
          await prisma.verificationRequest.update({
            where: { id },
            data: {
              status: 'APPROVED',
              currentLevel: body.level,
              reviewedBy: session.userId,
              reviewedAt: new Date(),
            },
          });
          return NextResponse.json({ success: true });
        }

        if (body.action === 'reject') {
          await prisma.verificationRequest.update({
            where: { id },
            data: {
              status: 'REJECTED',
              rejectionReason: body.reason,
              reviewedBy: session.userId,
              reviewedAt: new Date(),
            },
          });
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
      }

      case 'subscriptions': {
        if (body.action === 'createPlan') {
          const plan = await prisma.subscriptionPlan.create({
            data: {
              name: body.name,
              slug: body.slug,
              description: body.description,
              price: parseFloat(body.price),
              currency: body.currency || 'USD',
              duration: parseInt(body.duration),
              maxListings: parseInt(body.maxListings),
              maxImages: parseInt(body.maxImages || '5'),
              boostCredits: parseInt(body.boostCredits || '0'),
              features: JSON.stringify(body.features || []),
              sortOrder: body.sortOrder || 0,
            },
          });
          return NextResponse.json({ success: true, plan });
        }

        if (id && body.action === 'updatePlan') {
          await prisma.subscriptionPlan.update({
            where: { id },
            data: {
              name: body.name,
              description: body.description,
              price: body.price ? parseFloat(body.price) : undefined,
              duration: body.duration ? parseInt(body.duration) : undefined,
              maxListings: body.maxListings ? parseInt(body.maxListings) : undefined,
              maxImages: body.maxImages ? parseInt(body.maxImages) : undefined,
              boostCredits: body.boostCredits ? parseInt(body.boostCredits) : undefined,
              features: body.features ? JSON.stringify(body.features) : undefined,
              isActive: body.isActive,
              sortOrder: body.sortOrder,
            },
          });
          return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Admin PUT ${resource} error:`, error);
    return NextResponse.json({ error: 'Admin action failed' }, { status: 500 });
  }
}