import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthUser, requireAuth, logAudit, getClientIp } from '@/lib/auth';

const updatePageSchema = z.object({
  pageType: z.enum(['cover', 'kata_pengantar', 'mukadimah', 'daftar_isi', 'pga', 'filsafat', 'pakta_integritas', 'back_cover']).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  rawContent: z.string().optional().nullable(),
  status: z.enum(['draft', 'review', 'published']).optional(),
});

// GET /api/admin/pages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const page = await db.page.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        sections: { orderBy: { sortOrder: 'asc' } },
        media: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// PATCH /api/admin/pages/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const data = updatePageSchema.parse(body);

    const wasPublished = existing.status === 'published';
    const willBePublished = data.status === 'published';

    const page = await db.page.update({
      where: { id },
      data: {
        ...data,
        publishedAt: willBePublished && !wasPublished ? new Date() :
          !willBePublished && wasPublished ? null : existing.publishedAt,
      },
    });

    let action = 'update';
    if (!wasPublished && willBePublished) action = 'publish';
    if (wasPublished && !willBePublished) action = 'unpublish';

    await logAudit(user!.id, action, 'page', page.id, JSON.stringify(data), getClientIp(request));

    return NextResponse.json({ page });
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

// DELETE /api/admin/pages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const existing = await db.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Halaman tidak ditemukan' }, { status: 404 });
    }

    await db.page.delete({ where: { id } });
    await logAudit(user!.id, 'delete', 'page', id, null, getClientIp(request));

    return NextResponse.json({ message: 'Halaman berhasil dihapus' });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
