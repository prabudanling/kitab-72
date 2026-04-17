import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthUser, requireAuth, logAudit, getClientIp } from '@/lib/auth';

const createPilarSchema = z.object({
  pillarId: z.number().int().positive(),
  code: z.string().min(1, 'Kode wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  nameEng: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  domainId: z.number().int().positive(),
  domainColor: z.string().optional().nullable(),
  badge: z.enum(['foundation', 'strategic', 'operational']).optional().nullable(),
  vision: z.string().optional().nullable(),
  status: z.enum(['draft', 'review', 'published']).default('draft'),
});

// GET /api/admin/pilars
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const domainId = searchParams.get('domainId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const badge = searchParams.get('badge');
    const includeRelations = searchParams.get('include') === 'all';

    const where: Record<string, unknown> = {};
    if (domainId) where.domainId = parseInt(domainId);
    if (status) where.status = status;
    if (badge) where.badge = badge;
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { nameEng: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [pilars, total] = await Promise.all([
      db.pilar.findMany({
        where,
        include: {
          domain: includeRelations,
          dimensions: includeRelations ? { orderBy: { sortOrder: 'asc' } } : false,
          principles: includeRelations ? { orderBy: { sortOrder: 'asc' } } : false,
          xrefs: includeRelations ? true : false,
          _count: {
            select: {
              dimensions: true,
              principles: true,
              xrefs: true,
            },
          },
        },
        orderBy: { pillarId: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.pilar.count({ where }),
    ]);

    return NextResponse.json({
      pilars,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST /api/admin/pilars
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const body = await request.json();
    const data = createPilarSchema.parse(body);

    const existing = await db.pilar.findUnique({ where: { pillarId: data.pillarId } });
    if (existing) {
      return NextResponse.json({ error: 'Pilar ID sudah ada' }, { status: 409 });
    }

    const pilar = await db.pilar.create({ data });

    await logAudit(user!.id, 'create', 'pilar', pilar.id, JSON.stringify(data), getClientIp(request));

    return NextResponse.json({ pilar }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validasi gagal', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
