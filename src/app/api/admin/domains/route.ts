import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser, requireAuth } from '@/lib/auth';

// GET /api/admin/domains
export async function GET() {
  try {
    const domains = await db.domain.findMany({
      include: {
        _count: {
          select: { pilars: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Also get pilar count per status for each domain
    const domainStats = await Promise.all(
      domains.map(async (domain) => {
        const stats = await db.pilar.groupBy({
          by: ['status'],
          where: { domainId: domain.id },
          _count: { status: true },
        });

        const statusCounts: Record<string, number> = {};
        for (const stat of stats) {
          statusCounts[stat.status] = stat._count.status;
        }

        return {
          ...domain,
          pilarStats: {
            total: domain._count.pilars,
            draft: statusCounts['draft'] || 0,
            review: statusCounts['review'] || 0,
            published: statusCounts['published'] || 0,
          },
        };
      }),
    );

    return NextResponse.json({ domains: domainStats });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
