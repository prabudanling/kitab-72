import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { domains } from '../src/lib/pillar-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Create default admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@knbmp.id' },
    update: {},
    create: {
      email: 'admin@knbmp.id',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'super_admin',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Seed all 9 Domains
  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { id: domain.id },
      update: {},
      create: {
        id: domain.id,
        code: domain.code,
        emoji: domain.emoji,
        name: domain.name,
        nameId: domain.nameId,
        nameSubtitle: domain.nameSubtitle,
        pageRange: domain.range,
        color: domain.color,
        bgColor: domain.bgColor,
        borderColor: domain.borderColor,
        description: domain.description,
        sortOrder: domain.id,
      },
    });
  }
  console.log(`✅ ${domains.length} domains seeded`);

  // 3. Seed all 72 Pilars with dimensions, principles, xrefs
  let pilarCount = 0;
  for (const domain of domains) {
    for (const pillar of domain.pillars) {
      const created = await prisma.pilar.upsert({
        where: { pillarId: pillar.id },
        update: {},
        create: {
          pillarId: pillar.id,
          code: pillar.code,
          name: pillar.name,
          nameEng: pillar.eng,
          description: pillar.desc,
          domainId: pillar.domain,
          domainColor: pillar.domainColor,
          badge: pillar.badge,
          vision: pillar.vision,
          status: 'draft',
          sortOrder: pillar.id,
        },
      });

      // Delete existing dimensions, principles, xrefs for idempotent seeding
      await prisma.pilarDimension.deleteMany({ where: { pilarId: created.id } });
      await prisma.pilarPrinciple.deleteMany({ where: { pilarId: created.id } });
      await prisma.pilarXref.deleteMany({ where: { pilarId: created.id } });

      // Seed dimensions
      for (let i = 0; i < pillar.dimensions.length; i++) {
        const dim = pillar.dimensions[i];
        await prisma.pilarDimension.create({
          data: {
            pilarId: created.id,
            label: dim.label,
            value: dim.value,
            sortOrder: i,
          },
        });
      }

      // Seed principles
      for (let i = 0; i < pillar.principles.length; i++) {
        const princ = pillar.principles[i];
        await prisma.pilarPrinciple.create({
          data: {
            pilarId: created.id,
            content: princ,
            sortOrder: i,
          },
        });
      }

      // Seed cross-references
      for (const xrefId of pillar.xref) {
        await prisma.pilarXref.create({
          data: {
            pilarId: created.id,
            targetPilarId: xrefId,
          },
        });
      }

      pilarCount++;
    }
  }
  console.log(`✅ ${pilarCount} pilars seeded with dimensions, principles, and xrefs`);

  // 4. Seed 93 pages
  const pageDefinitions = [
    { pageNumber: 1, pageType: 'cover', title: 'Cover' },
    { pageNumber: 2, pageType: 'kata_pengantar', title: 'Kata Pengantar',
      content: 'Bismillahirrahmanirrahim.\n\nAda momen dalam sejarah sebuah bangsa — yang jarang terjadi, hanya sekali atau dua kali dalam satu abad — ketika sesuatu yang fundamental bergeser. Bukan karena bencana, bukan karena perang, tetapi karena sekelompok kecil manusia memutuskan bahwa cara lama tidak lagi cukup. Bahwa rakyat layak mendapatkan lebih dari yang telah mereka terima selama ini. Bahwa kemakmuran bukan hadiah dari atas, melainkan hak yang dilahirkan bersama setiap jiwa yang menghirup udara di muka bumi ini.\n\nKNBMP lahir dari keputusan itu.' },
    { pageNumber: 3, pageType: 'mukadimah', title: 'Mukadimah' },
    { pageNumber: 4, pageType: 'daftar_isi', title: 'Daftar Isi' },
  ];

  // 72 PGA pages (PGA-01 to PGA-72)
  let pilarIndex = 0;
  for (const domain of domains) {
    for (const pillar of domain.pillars) {
      pageDefinitions.push({
        pageNumber: 5 + pilarIndex,
        pageType: 'pga',
        title: `${pillar.code}: ${pillar.name}`,
        subtitle: pillar.eng,
        content: pillar.desc,
      });
      pilarIndex++;
    }
  }

  // Final pages
  pageDefinitions.push(
    { pageNumber: 77, pageType: 'filsafat', title: 'Filsafat & Esai' },
    { pageNumber: 78, pageType: 'pakta_integritas', title: 'Pakta Integritas' },
    { pageNumber: 79, pageType: 'back_cover', title: 'Back Cover' },
  );

  let pageCount = 0;
  for (const pageDef of pageDefinitions) {
    await prisma.page.upsert({
      where: { pageNumber: pageDef.pageNumber },
      update: {},
      create: {
        pageNumber: pageDef.pageNumber,
        pageType: pageDef.pageType,
        title: pageDef.title,
        subtitle: pageDef.subtitle ?? null,
        content: pageDef.content ?? null,
        status: pageDef.pageType === 'pga' ? 'draft' : 'published',
        publishedAt: pageDef.pageType === 'pga' ? null : new Date(),
        authorId: admin.id,
      },
    });
    pageCount++;
  }
  console.log(`✅ ${pageCount} pages seeded`);

  // 5. Seed site settings
  const settings = [
    { key: 'site_name', value: 'KNBMP PGA-72 Flipbook', type: 'string', group: 'general', label: 'Site Name', description: 'The name of the flipbook application' },
    { key: 'site_description', value: 'Koperasi Nasional Multipihak — 72 Pilar Fondasional Kedaulatan Ekonomi Rakyat', type: 'string', group: 'general', label: 'Site Description', description: 'Brief description of the project' },
    { key: 'organization_name', value: 'KNBMP', type: 'string', group: 'general', label: 'Organization Name', description: 'Full organization name' },
    { key: 'organization_name_full', value: 'Kopi Korporasi Multipihak Nusa Berdikari Merah Putih', type: 'string', group: 'general', label: 'Nama Resmi Lengkap', description: 'Nama legal lengkap organisasi' },
    { key: 'document_series', value: 'PGA-72 — Polymath Grand Architecture', type: 'string', group: 'general', label: 'Seri Dokumen', description: 'Nama seri dokumen' },
    { key: 'document_tier', value: 'Sovereign-72 — Standar Emas Kelas Dunia', type: 'string', group: 'general', label: 'Tier Standar', description: 'Tingkat standar dokumen' },
    { key: 'document_status', value: 'Foundational Truth — Tidak Berubah 100 Tahun', type: 'string', group: 'general', label: 'Status Dokumen', description: 'Status permanensi dokumen' },
    { key: 'member_registration_url', value: 'www.kopnusa.id/kpa', type: 'string', group: 'general', label: 'URL Pendaftaran Member', description: 'Link pendaftaran anggota' },
    { key: 'document_disclaimer', value: 'Seluruh isi dokumen ini dilindungi untuk kemaslahatan umat manusia. Penggandaan diizinkan untuk tujuan pendidikan dan pemberdayaan rakyat dengan mencantumkan sumber.', type: 'string', group: 'general', label: 'Disclaimer Dokumen', description: 'Pernyataan hak cipta dan penggunaan dokumen' },
    { key: 'primary_color', value: '#C4952A', type: 'color', group: 'theme', label: 'Primary Color', description: 'Main brand color' },
    { key: 'secondary_color', value: '#1a1a2e', type: 'color', group: 'theme', label: 'Secondary Color', description: 'Secondary brand color' },
    { key: 'accent_color', value: '#D4AF37', type: 'color', group: 'theme', label: 'Accent Color', description: 'Gold accent color' },
    { key: 'bg_color', value: '#FFFFFF', type: 'color', group: 'theme', label: 'Background Color', description: 'Main background color' },
    { key: 'text_color', value: '#1a1a2e', type: 'color', group: 'theme', label: 'Text Color', description: 'Main text color' },
    { key: 'font_heading', value: 'DM Serif Display', type: 'string', group: 'theme', label: 'Heading Font', description: 'Font family for headings' },
    { key: 'font_body', value: 'Inter', type: 'string', group: 'theme', label: 'Body Font', description: 'Font family for body text' },
    { key: 'total_pilars', value: '72', type: 'number', group: 'general', label: 'Total Pilars', description: 'Number of PGA pilars' },
    { key: 'total_domains', value: '9', type: 'number', group: 'general', label: 'Total Domains', description: 'Number of domains' },
    { key: 'total_villages', value: '83763', type: 'number', group: 'general', label: 'Total Villages', description: 'Number of target villages' },
    { key: 'seo_title', value: 'KNBMP PGA-72 — 72 Pilar Kedaulatan Ekonomi Rakyat', type: 'string', group: 'seo', label: 'SEO Title', description: 'Page title for search engines' },
    { key: 'seo_description', value: 'Dokumentasi lengkap 72 Pilar Fondasional Koperasi Nasional Multipihak untuk kedaulatan ekonomi rakyat Indonesia.', type: 'string', group: 'seo', label: 'SEO Description', description: 'Meta description for search engines' },
    { key: 'version', value: '1.0.0', type: 'string', group: 'general', label: 'Version', description: 'Current flipbook version' },
    { key: 'max_upload_size', value: '10485760', type: 'number', group: 'general', label: 'Max Upload Size', description: 'Maximum file upload size in bytes (10MB)' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ ${settings.length} site settings seeded`);

  console.log('\n🎉 Seeding complete!');
  console.log('   Admin: admin@knbmp.id / Admin123!');
  console.log(`   Domains: ${domains.length}`);
  console.log(`   Pilars: ${pilarCount}`);
  console.log(`   Pages: ${pageCount}`);
  console.log(`   Settings: ${settings.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
