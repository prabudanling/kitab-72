import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthUser, requireAuth, logAudit, getClientIp } from '@/lib/auth';

const updatePilarSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  nameEng: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  domainId: z.number().int().positive().optional(),
  domainColor: z.string().optional().nullable(),
  badge: z.enum(['foundation', 'strategic', 'operational']).optional().nullable(),
  vision: z.string().optional().nullable(),
  status: z.enum(['draft', 'review', 'published']).optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/admin/pilars/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const pilar = await db.pilar.findUnique({
      where: { id },
      include: {
        domain: true,
        dimensions: { orderBy: { sortOrder: 'asc' } },
        principles: { orderBy: { sortOrder: 'asc' } },
        xrefs: true,
      },
    });

    if (!pilar) {
      return NextResponse.json({ error: 'Pilar tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ pilar });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// PATCH /api/admin/pilars/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const existing = await db.pilar.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Pilar tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const data = updatePilarSchema.parse(body);

    const pilar = await db.pilar.update({
      where: { id },
      data,
    });

    await logAudit(user!.id, 'update', 'pilar', pilar.id, JSON.stringify(data), getClientIp(request));

    return NextResponse.json({ pilar });
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

// DELETE /api/admin/pilars/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const existing = await db.pilar.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Pilar tidak ditemukan' }, { status: 404 });
    }

    await db.pilar.delete({ where: { id } });
    await logAudit(user!.id, 'delete', 'pilar', id, null, getClientIp(request));

    return NextResponse.json({ message: 'Pilar berhasil dihapus' });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
