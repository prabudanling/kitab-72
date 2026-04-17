import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthUser, requireAuth, logAudit, getClientIp } from '@/lib/auth';

const createPageSchema = z.object({
  pageNumber: z.number().int().positive(),
  pageType: z.enum(['cover', 'kata_pengantar', 'mukadimah', 'daftar_isi', 'pga', 'filsafat', 'pakta_integritas', 'back_cover']),
  title: z.string().min(1, 'Judul wajib diisi'),
  subtitle: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  rawContent: z.string().optional().nullable(),
  status: z.enum(['draft', 'review', 'published']).default('draft'),
});

// GET /api/admin/pages
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const pageType = searchParams.get('pageType');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (pageType) where.pageType = pageType;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subtitle: { contains: search } },
      ];
    }

    const [pages, total] = await Promise.all([
      db.page.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          sections: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { media: true } },
        },
        orderBy: { pageNumber: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.page.count({ where }),
    ]);

    return NextResponse.json({
      pages,
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

// POST /api/admin/pages
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const body = await request.json();
    const data = createPageSchema.parse(body);

    const existing = await db.page.findUnique({ where: { pageNumber: data.pageNumber } });
    if (existing) {
      return NextResponse.json(
        { error: 'Nomor halaman sudah ada' },
        { status: 409 },
      );
    }

    const page = await db.page.create({
      data: {
        ...data,
        publishedAt: data.status === 'published' ? new Date() : null,
        authorId: user!.id,
      },
    });

    await logAudit(user!.id, 'create', 'page', page.id, JSON.stringify(data), getClientIp(request));

    return NextResponse.json({ page }, { status: 201 });
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
