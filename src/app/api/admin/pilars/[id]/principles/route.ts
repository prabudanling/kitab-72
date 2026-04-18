import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthUser, requireAuth, logAudit, getClientIp } from '@/lib/auth';

const createPrincipleSchema = z.object({
  content: z.string().min(1, 'Prinsip wajib diisi'),
  sortOrder: z.number().int().default(0),
});

const updatePrincipleSchema = z.object({
  content: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/admin/pilars/[id]/principles
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const principles = await db.pilarPrinciple.findMany({
      where: { pilarId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ principles });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST /api/admin/pilars/[id]/principles
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const pilar = await db.pilar.findUnique({ where: { id } });
    if (!pilar) {
      return NextResponse.json({ error: 'Pilar tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const data = createPrincipleSchema.parse(body);

    const principle = await db.pilarPrinciple.create({
      data: {
        pilarId: id,
        content: data.content,
        sortOrder: data.sortOrder,
      },
    });

    await logAudit(user!.id, 'create', 'pilar_principle', principle.id, JSON.stringify(data), getClientIp(request));

    return NextResponse.json({ principle }, { status: 201 });
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

// PATCH /api/admin/pilars/[id]/principles
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id: pilarId } = await params;
    const body = await request.json();
    const { principleId, ...data } = updatePrincipleSchema.parse(body);

    if (!principleId) {
      return NextResponse.json({ error: 'principleId wajib diisi' }, { status: 400 });
    }

    const existing = await db.pilarPrinciple.findFirst({
      where: { id: principleId, pilarId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Prinsip tidak ditemukan' }, { status: 404 });
    }

    const principle = await db.pilarPrinciple.update({
      where: { id: principleId },
      data,
    });

    await logAudit(user!.id, 'update', 'pilar_principle', principleId, JSON.stringify(data), getClientIp(request));

    return NextResponse.json({ principle });
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

// DELETE /api/admin/pilars/[id]/principles
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id: pilarId } = await params;
    const { searchParams } = new URL(request.url);
    const principleId = searchParams.get('principleId');

    if (!principleId) {
      return NextResponse.json({ error: 'principleId wajib diisi' }, { status: 400 });
    }

    const existing = await db.pilarPrinciple.findFirst({
      where: { id: principleId, pilarId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Prinsip tidak ditemukan' }, { status: 404 });
    }

    await db.pilarPrinciple.delete({ where: { id: principleId } });
    await logAudit(user!.id, 'delete', 'pilar_principle', principleId, null, getClientIp(request));

    return NextResponse.json({ message: 'Prinsip berhasil dihapus' });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
