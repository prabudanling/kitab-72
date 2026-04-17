import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/flipbook — Public read-only endpoint for all published content
export async function GET() {
  try {
    // Fetch all published pages
    const pages = await db.page.findMany({
      where: { status: 'published' },
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
        media: true,
        author: { select: { name: true } },
      },
      orderBy: { pageNumber: 'asc' },
    });

    // Fetch all domains with their pilars
    const domains = await db.domain.findMany({
      include: {
        pilars: {
          include: {
            dimensions: { orderBy: { sortOrder: 'asc' } },
            principles: { orderBy: { sortOrder: 'asc' } },
            xrefs: true,
          },
          orderBy: { pillarId: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Fetch site settings (public ones)
    const settings = await db.siteSetting.findMany({
      select: { key: true, value: true },
    });

    const settingsMap: Record<string, string | null> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      pages,
      domains,
      settings: settingsMap,
      meta: {
        totalPages: pages.length,
        totalDomains: domains.length,
        totalPilars: domains.reduce((sum, d) => sum + d.pilars.length, 0),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Flipbook API error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data flipbook' },
      { status: 500 },
    );
  }
}
