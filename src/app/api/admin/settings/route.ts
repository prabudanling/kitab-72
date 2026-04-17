import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getAuthUser, requireAuth, logAudit, getClientIp } from '@/lib/auth';

const updateSettingsSchema = z.record(
  z.object({
    value: z.string().nullable(),
    type: z.string().optional(),
    group: z.string().optional(),
    label: z.string().optional(),
    description: z.string().optional(),
  }),
);

// GET /api/admin/settings
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');

    const where: Record<string, unknown> = {};
    if (group) where.group = group;

    const settings = await db.siteSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });

    // Convert to key-value map
    const settingsMap: Record<string, { value: string | null; type: string; group: string | null; label: string | null; description: string | null }> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = {
        value: setting.value,
        type: setting.type,
        group: setting.group,
        label: setting.label,
        description: setting.description,
      };
    }

    return NextResponse.json({ settings: settingsMap, raw: settings });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('Insufficient'))) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Insufficient') ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// PATCH /api/admin/settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);

    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    const updatedKeys: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      await db.siteSetting.upsert({
        where: { key },
        update: {
          value: value.value,
          ...(value.type && { type: value.type }),
          ...(value.group && { group: value.group }),
          ...(value.label && { label: value.label }),
          ...(value.description && { description: value.description }),
        },
        create: {
          key,
          value: value.value,
          type: value.type || 'string',
          group: value.group || 'general',
          label: value.label || key,
          description: value.description || null,
        },
      });
      updatedKeys.push(key);
    }

    await logAudit(user!.id, 'update', 'setting', null, JSON.stringify({ keys: updatedKeys }), getClientIp(request));

    return NextResponse.json({
      message: `${updatedKeys.length} pengaturan berhasil diperbarui`,
      updatedKeys,
    });
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
