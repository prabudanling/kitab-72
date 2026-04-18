import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthUser, requireAuth, logAudit, getClientIp } from '@/lib/auth';

const createDimensionSchema = z.object({
  label: z.string().min(1, 'Label wajib diisi'),
  value: z.string().min(1, 'Value wajib diisi'),
  sortOrder: z.number().int().default(0),
});

const updateDimensionSchema = z.object({
  label: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/admin/pilars/[id]/dimensions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id } = await params;
    const dimensions = await db.pilarDimension.findMany({
      where: { pilarId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ dimensions });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST /api/admin/pilars/[id]/dimensions
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
    const data = createDimensionSchema.parse(body);

    const dimension = await db.pilarDimension.create({
      data: {
        pilarId: id,
        label: data.label,
        value: data.value,
        sortOrder: data.sortOrder,
      },
    });

    await logAudit(user!.id, 'create', 'pilar_dimension', dimension.id, JSON.stringify(data), getClientIp(request));

    return NextResponse.json({ dimension }, { status: 201 });
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

// PATCH /api/admin/pilars/[id]/dimensions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id: pilarId } = await params;
    const body = await request.json();
    const { dimensionId, ...data } = updateDimensionSchema.parse(body);

    if (!dimensionId) {
      return NextResponse.json({ error: 'dimensionId wajib diisi' }, { status: 400 });
    }

    const existing = await db.pilarDimension.findFirst({
      where: { id: dimensionId, pilarId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Dimension tidak ditemukan' }, { status: 404 });
    }

    const dimension = await db.pilarDimension.update({
      where: { id: dimensionId },
      data,
    });

    await logAudit(user!.id, 'update', 'pilar_dimension', dimensionId, JSON.stringify(data), getClientIp(request));

    return NextResponse.json({ dimension });
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

// DELETE /api/admin/pilars/[id]/dimensions
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { id: pilarId } = await params;
    const { searchParams } = new URL(request.url);
    const dimensionId = searchParams.get('dimensionId');

    if (!dimensionId) {
      return NextResponse.json({ error: 'dimensionId wajib diisi' }, { status: 400 });
    }

    const existing = await db.pilarDimension.findFirst({
      where: { id: dimensionId, pilarId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Dimension tidak ditemukan' }, { status: 404 });
    }

    await db.pilarDimension.delete({ where: { id: dimensionId } });
    await logAudit(user!.id, 'delete', 'pilar_dimension', dimensionId, null, getClientIp(request));

    return NextResponse.json({ message: 'Dimension berhasil dihapus' });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
