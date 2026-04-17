// ═══════════════════════════════════════════
// KNBMP · PGA-72 · MASTER DATA
// 72 Pilar Fondasional — 9 Domain
// ═══════════════════════════════════════════

export interface Pillar {
  id: number;
  code: string;
  name: string;
  eng: string;
  desc: string;
  domain: number;
  domainColor: string;
  badge: 'foundation' | 'strategic' | 'operational';
  vision: string;
  dimensions: { label: string; value: string }[];
  principles: string[];
  xref: number[];
}

export interface Domain {
  id: number;
  code: string;
  emoji: string;
  name: string;
  nameId: string;
  range: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  pillars: Pillar[];
}

export const domains: Domain[] = [
  {
    id: 1,
    code: 'D1',
    emoji: '🏛️',
    name: 'Identity & Civilization',
    nameId: 'Identitas & Peradaban',
    range: 'PGA-01 — PGA-08',
    color: '#C4952A',
    bgColor: 'rgba(196,149,42,0.08)',
    borderColor: 'border-l-[#C4952A]',
    description: 'Fondasi pertama: mengenal diri sebelum membangun masa depan',
    pillars: [
      {
        id: 1, code: 'PGA-01', name: 'Bintang Utara Peradaban', eng: 'Vision Statement',
        desc: 'Visi peradaban yang menerangi jalan kedaulatan', domain: 1, domainColor: '#C4952A', badge: 'foundation',
        vision: '"Menjadi bintang utama yang tidak pernah tenggelam — menerangi jalan bagi 83.763 desa menuju kedaulatan ekonomi yang sesungguhnya, bukan untuk satu generasi, melainkan untuk seratus tahun ke depan."',
        dimensions: [
          { label: 'Horizon Waktu', value: '100 Tahun (2025–2125)' },
          { label: 'Cakupan Geografis', value: '83.763 Desa, 34 Provinsi' },
          { label: 'Populasi Dampak', value: '275 Juta Jiwa Indonesia' },
          { label: 'Entitas Pemilik', value: 'Koperasi Korporasi Multipihak' },
        ],
        principles: [
          'Kedaulatan ekonomi rakyat sebagai tujuan tertinggi yang tidak bisa ditawar',
          'Keberlanjutan lintas generasi: keputusan hari ini harus relevan 100 tahun ke depan',
          'Inklusi total: tidak ada satu pun desa yang tertinggal dalam arsitektur ini',
          'Kemandirian sebagai fondasi, kerja sama sebagai perluasan — bukan ketergantungan',
          'Peradaban baru yang memanusiakan manusia, bukan mengobjektifikasi',
        ],
        xref: [7, 8, 9, 71],
      },
      {
        id: 2, code: 'PGA-02', name: 'Mandat Transformasi Nyata', eng: 'Mission Statement',
        desc: 'Misi transformasi sistemik ekonomi rakyat', domain: 1, domainColor: '#C4952A', badge: 'foundation',
        vision: '"Mentransformasi ekosistem ekonomi rakyat dari objek pembangunan menjadi subjek kedaulatan — melalui koperasi multipihak yang menghubungkan setiap desa, setiap potensi, dan setiap mimpi menjadi kekuatan nyata yang tak terbantahkan."',
        dimensions: [
          { label: 'Misi Inti', value: 'Transformasi sistemik ekonomi rakyat' },
          { label: 'Mekanisme', value: 'Koperasi Korporasi Multipihak' },
          { label: 'Target Awal', value: '1.000 Desa Pioneer (Tahun 1-3)' },
          { label: 'Target Puncak', value: '83.763 Desa Terkoneksi' },
        ],
        principles: [
          'Transformasi nyata, bukan retorika: setiap kata harus memiliki padanan dalam tindakan terukur',
          'Pemberdayaan sebagai proses, bukan proyek: membangun kapasitas, bukan menciptakan ketergantungan',
          'Bottom-up revolution: perubahan dimulai dari desa, bukan diinstruksikan dari atas',
          'Akuntabilitas total: setiap janji harus dapat diverifikasi oleh setiap anggota',
        ],
        xref: [1, 9, 25, 33],
      },
      {
        id: 3, code: 'PGA-03', name: 'Akar Hikmah Para Pendiri', eng: "Founders' Philosophy",
        desc: 'Filsafat dasar dari gotong royong dan kedaulatan', domain: 1, domainColor: '#C4952A', badge: 'foundation',
        vision: '"Kami tidak memulai dari nol — kami memulai dari akar yang telah tertanam selama berabad-abad. Akar gotong royong, akar musyawarah, akar kedaulatan yang telah lama terkubur oleh kolonialisme."',
        dimensions: [
          { label: 'Sumber Filosofi', value: 'Gotong Royong, Musyawarah, Kedaulatan' },
          { label: 'Akar Historis', value: 'Tradisi Koperasi Indonesia (1847–kini)' },
          { label: 'Inspirasi Global', value: 'Mondragón, Emilia-Romagna, Kumaran' },
          { label: 'Keunikan KNBMP', value: 'Korporasi Multipihak berbasis Desa' },
        ],
        principles: [
          'Gotong royong bukan sekadar slogan — ia adalah sistem ekonomi yang terbukti efektif selama berabad-abad',
          'Kedaulatan lokal sebagai fondasi kedaulatan nasional: desa yang kuat membangun negara yang kuat',
          'Filsafat Nusantara: keberagaman sebagai kekuatan, bukan kelemahan',
          'Pendiri sebagai pelayan, bukan penguasa: kepemimpinan dalam semangat merdeka',
        ],
        xref: [4, 5, 50, 54],
      },
      {
        id: 4, code: 'PGA-04', name: 'Sejarah & Luka yang Menyembuhkan', eng: 'Story of Origin',
        desc: 'Narasi asal-usul dan transformasi kebangkitan', domain: 1, domainColor: '#C4952A', badge: 'foundation',
        vision: '"Dari luka kolonialisme yang berlangsung 400 tahun, dari kemerdekaan yang belum sepenuhnya merdeka secara ekonomi, lahirlah tekad yang tidak bisa dipatahkan."',
        dimensions: [
          { label: 'Periode Kolonial', value: '1602–1945 (VOC & Hindia Belanda)' },
          { label: 'Era Kemerdekaan', value: '1945–1998 (Orde Lama & Orde Baru)' },
          { label: 'Era Reformasi', value: '1998–2025 (Transisi & Disrupsi)' },
          { label: 'Era KNBMP', value: '2025–2125 (Kedaulatan Ekonomi)' },
        ],
        principles: [
          'Mengakui luka adalah langkah pertama penyembuhan',
          'Sejarah bukan beban, melainkan guru: setiap kegagalan masa lalu adalah pelajaran berharga',
          'Transformasi membutuhkan narasi yang membebaskan, bukan narasi yang mengikat',
          'KNBMP lahir dari rahim penderitaan, tetapi dibesarkan oleh harapan yang tak padam',
        ],
        xref: [3, 6, 7, 71],
      },
      {
        id: 5, code: 'PGA-05', name: 'Tujuh Pilar Etika Absolut', eng: 'Core Values Charter',
        desc: 'Tujuh nilai moral yang tidak bisa ditawar', domain: 1, domainColor: '#C4952A', badge: 'foundation',
        vision: '"Ada nilai-nilai yang tidak bisa ditawar, tidak bisa dikompromikan, dan tidak bisa dilupakan — mereka adalah DNA moral KNBMP."',
        dimensions: [
          { label: 'Kedaulatan', value: 'Hak mutlak menentukan nasib sendiri' },
          { label: 'Keberlimpahan', value: 'Cukup untuk semua, bukan lebih untuk segelintir' },
          { label: 'Integritas', value: 'Kata dan perbuatan adalah satu kesatuan' },
          { label: 'Inklusi', value: 'Setiap manusia bermartabat setara' },
        ],
        principles: [
          'Tujuh nilai ini bersifat absolut — tidak ada keadaan yang membenarkan pelanggaran',
          'Setiap keputusan strategis harus melewati uji ketujuh nilai ini',
          'Pelanggaran etika oleh siapa pun, termasuk pendiri, tetap pelanggaran',
          'Budaya etika dibangun dari atas, dijalankan dari bawah',
        ],
        xref: [3, 22, 54, 55],
      },
      {
        id: 6, code: 'PGA-06', name: 'Antitesis Sistem Global', eng: 'Identity & Positioning Paper',
        desc: 'Posisi KNBMP sebagai antitesis kolonialisme ekonomi modern', domain: 1, domainColor: '#C4952A', badge: 'foundation',
        vision: '"KNBMP bukan sekadar alternatif — ia adalah antitesis. Antitesis terhadap sistem yang telah gagal mensejahterakan mayoritas."',
        dimensions: [
          { label: 'Posisi', value: 'Antitesis kolonialisme ekonomi modern' },
          { label: 'Pendekatan', value: 'Konstruktif, bukan destruktif' },
          { label: 'Strategi', value: 'Membangun yang baru, bukan menghancurkan yang lama' },
          { label: 'Diferensiasi', value: 'Kedaulatan desa vs. ekstraksi pusat' },
        ],
        principles: [
          'KNBMP tidak anti-kapitalisme — KNBMP anti-ketidakadilan',
          'Posisi yang jelas membutuhkan keberanian untuk tidak menyenangkan semua pihak',
          'Identitas dibangun dari apa yang kita lawan dan apa yang kita bangun',
          'Kritik tanpa alternatif adalah keluhan; alternatif tanpa aksi adalah ilusi',
        ],
        xref: [4, 7, 15, 57],
      },
      {
        id: 7, code: 'PGA-07', name: 'Deklarasi Pembebasan Ekonomi', eng: 'Manifesto / Declaration',
        desc: 'Manifesto kemerdekaan ekonomi rakyat Indonesia', domain: 1, domainColor: '#C4952A', badge: 'foundation',
        vision: '"Kami menyatakan bahwa kemerdekaan ekonomi adalah hak asasi setiap manusia — bukan pemberian negara, bukan hadiah lembaga internasional, melainkan hak yang melekat pada martabat manusia itu sendiri."',
        dimensions: [
          { label: 'Natur Dokumen', value: 'Manifesto / Deklarasi Kemerdekaan Ekonomi' },
          { label: 'Status Hukum', value: 'Berlaku sebagai bagian dari Konstitusi KNBMP' },
          { label: 'Penerima', value: 'Seluruh rakyat ekonomi Indonesia' },
          { label: 'Kekuatan', value: 'Mengikat secara moral dan organisasional' },
        ],
        principles: [
          'Deklarasi ini bersifat permanen dan tidak dapat dicabut oleh entitas apa pun',
          'Pembebasan ekonomi dimulai dari kesadaran, diwujudkan melalui aksi kolektif',
          'Setiap anggota KNBMP adalah penjaga deklarasi ini',
          'Kemerdekaan ekonomi bukan tujuan akhir — ia adalah prasyarat untuk martabat manusia',
        ],
        xref: [1, 6, 22, 71],
      },
      {
        id: 8, code: 'PGA-08', name: 'Arsitektur Konseptual Makro', eng: 'Whitepaper',
        desc: 'Whitepaper arsitektur PGA-72 secara keseluruhan', domain: 1, domainColor: '#C4952A', badge: 'foundation',
        vision: '"Arsitektur PGA-72 bukan kumpulan dokumen yang berdiri sendiri — ia adalah organisme hidup yang saling terhubung, di mana setiap pilar menguatkan yang lain."',
        dimensions: [
          { label: 'Skema Arsitektur', value: '9 Domain, 72 Pilar, 100 Tahun' },
          { label: 'Prinsip Desain', value: 'Interkoneksi, Modularitas, Adaptabilitas' },
          { label: 'Mekanisme Perubahan', value: 'Dijaga oleh PGA-32 & PGA-72' },
          { label: 'Garansi Kualitas', value: 'PGA-30, PGA-46, PGA-67' },
        ],
        principles: [
          'Arsitektur ini dirancang untuk bertahan 100 tahun — setiap komponen harus melewati uji waktu',
          'Modularitas memungkinkan perbaikan tanpa menghancurkan keseluruhan',
          'Interkoneksi antar-pilar menciptakan resiliensi alami',
          'Whitepaper ini adalah peta, bukan wilayah — realitas selalu lebih kaya dari rencana',
        ],
        xref: [1, 9, 32, 72],
      },
    ],
  },
  {
    id: 2,
    code: 'D2',
    emoji: '♟️',
    name: 'Strategy & Direction',
    nameId: 'Strategi & Arah',
    range: 'PGA-09 — PGA-16',
    color: '#1565C0',
    bgColor: 'rgba(21,101,192,0.08)',
    borderColor: 'border-l-[#1565C0]',
    description: 'Dari visi ke aksi: peta jalan menuju kedaulatan ekonomi yang terukur dan terarah',
    pillars: [
      { id: 9, code: 'PGA-09', name: 'Navigasi Dekade', eng: 'Decade Roadmap & Masterplan', desc: 'Peta jalan strategis 10 tahun ke depan', domain: 2, domainColor: '#1565C0', badge: 'strategic', vision: '"Peta jalan yang tidak hanya menunjukkan arah, tetapi juga mempersiapkan kita untuk badai yang pasti akan datang."', dimensions: [{ label: 'Cakupan', value: '10 Tahun Masterplan' }, { label: 'Fase', value: '3 Fase Utama' }, { label: 'Milestone', value: '24 Titik Keberhasilan Kunci' }], principles: ['Setiap dekade harus memiliki tujuan terukur', 'Masterplan hidup, bukan dokumen mati', 'Ketahanan lebih penting dari kecepatan'], xref: [1, 8, 11, 25] },
      { id: 10, code: 'PGA-10', name: 'Arsitektur Nilai', eng: 'Value Proposition Design', desc: 'Rancangan nilai yang diberikan kepada seluruh pemangku', domain: 2, domainColor: '#1565C0', badge: 'strategic', vision: '"Nilai bukan apa yang kita klaim — nilai adalah apa yang dirasakan oleh setiap desa, setiap anggota, setiap mitra."', dimensions: [{ label: 'Sasaran', value: 'Anggota, Mitra, Pemerintah' }, { label: ' diferensiasi', value: 'Kedaulatan vs. Eksploitasi' }], principles: ['Nilai harus terukur dan terverifikasi oleh penerima', 'Proposisi nilai berbeda untuk setiap segmen'], xref: [1, 2, 25, 29] },
      { id: 11, code: 'PGA-11', name: 'Peta Pertempuran', eng: 'Competitive Strategy', desc: 'Strategi bersaing dan memenangkan pasar', domain: 2, domainColor: '#1565C0', badge: 'strategic', vision: '"Pertempuran ekonomi dimenangkan bukan oleh yang terbesar, tetapi oleh yang paling relevan bagi rakyat."', dimensions: [{ label: 'Arena', value: 'Ekonomi Rakyat & Desa' }, { label: 'Keunggulan', value: 'Jaringan Desa Terluas' }], principles: ['Fokus pada keunggulan unik yang tidak bisa disalin pesaing'], xref: [9, 12, 15, 61] },
      { id: 12, code: 'PGA-12', name: 'Penetrasi Urat Nadi', eng: 'Go-to-Market Strategy', desc: 'Strategi masuk dan penetrasi pasar', domain: 2, domainColor: '#1565C0', badge: 'strategic', vision: '"Menembus urat nadi ekonomi rakyat bukan dengan kekerasan pasar, tetapi dengan relevansi yang tak bisa ditolak."', dimensions: [{ label: 'Pendekatan', value: 'Desa by Desa' }, { label: 'Target', value: '1.000 Desa Pioneer' }], principles: ['Penetrasi dimulai dari desa yang paling membutuhkan'], xref: [11, 13, 40, 61] },
      { id: 13, code: 'PGA-13', name: 'Orkestrasi Ekosistem', eng: 'Ecosystem Strategy', desc: 'Strategi membangun dan mengelola ekosistem', domain: 2, domainColor: '#1565C0', badge: 'strategic', vision: '"Ekosistem yang kuat bukan yang terbesar, tetapi yang paling saling menguatkan."', dimensions: [{ label: 'Komponen', value: 'Anggota, Mitra, Pemerintah' }, { label: 'Synergy', value: '1+1+1 > 3' }], principles: ['Setiap pemangku kepentingan harus mendapat nilai yang nyata'], xref: [11, 14, 37, 60] },
      { id: 14, code: 'PGA-14', name: 'Gerbang Global', eng: 'Global Partnership Strategy', desc: 'Strategi kemitraan dan ekspansi internasional', domain: 2, domainColor: '#1565C0', badge: 'strategic', vision: '"Kedaulatan tidak berarti isolasi — ia berarti berhubungan dengan dunia dari posisi yang kuat."', dimensions: [{ label: 'Model', value: 'South-South Cooperation' }, { label: 'Target', value: '5 Benua, 20 Negara' }], principles: ['Kemitraan harus setara, bukan simbiosis parasitisme'], xref: [13, 15, 37, 62] },
      { id: 15, code: 'PGA-15', name: 'Benteng Kedaulatan', eng: 'Sovereignty Protection', desc: 'Strategi melindungi kedaulatan dari ancaman', domain: 2, domainColor: '#1565C0', badge: 'strategic', vision: '"Kedaulatan yang tidak dilindungi adalah ilusi. Benteng ini memastikan setiap pilar tetap berdiri."', dimensions: [{ label: 'Ancaman', value: 'Ekonomi, Politik, Digital' }, { label: 'Perlindungan', value: 'Multi-layer Defense' }], principles: ['Kedaulatan harus dilindungi secara proaktif, bukan reaktif'], xref: [6, 11, 45, 66] },
      { id: 16, code: 'PGA-16', name: 'Skenario Krisis', eng: 'Scenario Planning & Contingency', desc: 'Perencanaan skenario dan kesiapan menghadapi krisis', domain: 2, domainColor: '#1565C0', badge: 'strategic', vision: '"Organisasi yang hanya merencanakan keberhasilan tidak siap menghadapi kenyataan."', dimensions: [{ label: 'Skenario', value: 'Best, Base, Worst Case' }, { label: 'Trigger', value: 'Early Warning System' }], principles: ['Setiap skenario krisis harus memiliki rencana respons yang jelas'], xref: [9, 39, 45, 64] },
    ],
  },
  {
    id: 3,
    code: 'D3',
    emoji: '⚖️',
    name: 'Governance & Compliance',
    nameId: 'Tata Kelola',
    range: 'PGA-17 — PGA-24',
    color: '#6A1B9A',
    bgColor: 'rgba(106,27,154,0.08)',
    borderColor: 'border-l-[#6A1B9A]',
    description: 'Tata kelola yang kuat: fondasi kepercayaan dan keberlanjutan organisasi',
    pillars: [
      { id: 17, code: 'PGA-17', name: 'Keseimbangan Kekuasaan', eng: 'Power Balance Framework', desc: 'Kerangka distribusi kekuasaan yang seimbang', domain: 3, domainColor: '#6A1B9A', badge: 'strategic', vision: '"Kekuasaan tanpa keseimbangan adalah tirani. Keseimbangan tanpa kekuasaan adalah kekacauan."', dimensions: [{ label: 'Prinsip', value: 'Checks & Balances' }, { label: 'Struktur', value: 'Multi-tier Governance' }], principles: ['Tidak ada satu pihak yang memiliki kekuasaan absolut'], xref: [18, 19, 22, 50] },
      { id: 18, code: 'PGA-18', name: 'Anatomi Kelembagaan', eng: 'Organizational Design', desc: 'Rancangan struktur organisasi yang optimal', domain: 3, domainColor: '#6A1B9A', badge: 'strategic', vision: '"Organisasi yang dirancang dengan baik memungkinkan orang biasa melakukan hal luar biasa."', dimensions: [{ label: 'Model', value: 'Lean & Adaptive' }, { label: 'Skalabilitas', value: 'Dari 100 ke 83.763 desa' }], principles: ['Struktur organisasi mengikuti strategi, bukan sebaliknya'], xref: [17, 19, 33, 51] },
      { id: 19, code: 'PGA-19', name: 'Matriks Kewenangan Mutlak', eng: 'Role & Authority Matrix', desc: 'Pembagian wewenang yang tegas dan jelas', domain: 3, domainColor: '#6A1B9A', badge: 'strategic', vision: '"Kewenangan yang tidak jelas adalah resep kekacauan. Matriks ini memastikan setiap orang tahu apa yang boleh dan tidak boleh dilakukan."', dimensions: [{ label: 'Format', value: 'RACI Matrix' }, { label: 'Cakupan', value: 'Seluruh Fungsi & Level' }], principles: ['Setiap keputusan harus memiliki pemilik yang jelas'], xref: [17, 20, 22, 24] },
      { id: 20, code: 'PGA-20', name: 'Protokol Pengambilan Keputusan', eng: 'Decision-Making Protocol', desc: 'Mekanisme keputusan yang terukur dan akuntabel', domain: 3, domainColor: '#6A1B9A', badge: 'operational', vision: '"Keputusan terbaik bukan yang tercepat, tetapi yang paling terinformasi dan akuntabel."', dimensions: [{ label: 'Tingkatan', value: 'Tactical, Operational, Strategic' }, { label: 'SLA', value: 'Time-bound Decision' }], principles: ['Keputusan harus terdokumentasi dan dapat ditelusuri'], xref: [19, 22, 24, 67] },
      { id: 21, code: 'PGA-21', name: 'Perisai Hukum & Kepatuhan', eng: 'Legal Compliance Pack', desc: 'Perlindungan hukum dan kepatuhan regulasi', domain: 3, domainColor: '#6A1B9A', badge: 'operational', vision: '"Organisasi yang beroperasi tanpa perisai hukum adalah organisasi yang berjudi dengan masa depannya."', dimensions: [{ label: 'Cakupan', value: 'Peraturan Nasional & Daerah' }, { label: 'Update', value: 'Quarterly Review' }], principles: ['Kepatuhan hukum bukan pilihan, melainkan keharusan'], xref: [22, 23, 45, 46] },
      { id: 22, code: 'PGA-22', name: 'Konstitusi Agung & AD-ART', eng: 'Constitutional Documents', desc: 'Hukum tertinggi organisasi yang mengikat', domain: 3, domainColor: '#6A1B9A', badge: 'strategic', vision: '"Konstitusi adalah janji tertulis antara generasi pendiri dan generasi penerus."', dimensions: [{ label: 'Status', value: 'Dokumen Tertinggi' }, { label: 'Perubahan', value: 'Membutuhkan Muskup 2/3' }], principles: ['Konstitusi melindungi dari kekuasaan yang sewenang-wenang'], xref: [5, 7, 19, 23] },
      { id: 23, code: 'PGA-23', name: 'Tata Aturan Kemitraan', eng: 'Contracting Framework', desc: 'Kerangka kontrak yang adil dan melindungi', domain: 3, domainColor: '#6A1B9A', badge: 'operational', vision: '"Kontrak yang baik bukan yang menguntungkan satu pihak, tetapi yang membuat semua pihak merasa dilindungi."', dimensions: [{ label: 'Template', value: 'Standard & Custom' }, { label: 'Review', value: 'Legal & Compliance' }], principles: ['Setiap kontrak harus adil dan transparan'], xref: [21, 22, 37, 47] },
      { id: 24, code: 'PGA-24', name: 'Registri Kebijakan', eng: 'Policy Register & Tracker', desc: 'Pencatatan dan pelacakan seluruh kebijakan', domain: 3, domainColor: '#6A1B9A', badge: 'operational', vision: '"Organisasi yang tidak tahu kebijakannya sendiri adalah organisasi yang buta."', dimensions: [{ label: 'Format', value: 'Digital Register' }, { label: 'Akses', value: 'Seluruh Anggota' }], principles: ['Transparansi kebijakan adalah fondasi kepercayaan'], xref: [19, 20, 22, 72] },
    ],
  },
  {
    id: 4,
    code: 'D4',
    emoji: '⚙️',
    name: 'Product / Service / Solution',
    nameId: 'Produk & Layanan',
    range: 'PGA-25 — PGA-32',
    color: '#008F3D',
    bgColor: 'rgba(0,143,61,0.08)',
    borderColor: 'border-l-[#008F3D]',
    description: 'Rancangan lengkap produk dan layanan yang memberikan nilai nyata kepada rakyat',
    pillars: [
      { id: 25, code: 'PGA-25', name: 'Arsitektur 16 Hak Anggota', eng: 'Product / Service Architecture', desc: 'Rancangan lengkap produk dan layanan', domain: 4, domainColor: '#008F3D', badge: 'strategic', vision: '"Setiap anggota berhak atas layanan yang setara dengan martabatnya — bukan sisa, bukan murahan, tetapi yang terbaik."', dimensions: [{ label: 'Hak', value: '16 Hak Anggota' }, { label: 'Kategori', value: 'Produk, Layanan, Solusi' }], principles: ['Desain produk dimulai dari kebutuhan rakyat, bukan keinginan manajemen'], xref: [1, 9, 10, 26] },
      { id: 26, code: 'PGA-26', name: 'Spesifikasi Mesin Digital', eng: 'Product Requirement Document', desc: 'Detail teknis platform digital', domain: 4, domainColor: '#008F3D', badge: 'operational', vision: '"Mesin digital adalah jantung operasional KNBMP — ia harus sekuat dan setangguh tekad para pendiri."', dimensions: [{ label: 'Platform', value: 'Web, Mobile, API' }, { label: 'Standar', value: 'Enterprise-grade' }], principles: ['Teknologi melayani rakyat, bukan sebaliknya'], xref: [25, 27, 28, 67] },
      { id: 27, code: 'PGA-27', name: 'Peta Jalan Transformasi Digital', eng: 'Product Strategy & Roadmap', desc: 'Rencana strategis pengembangan produk', domain: 4, domainColor: '#008F3D', badge: 'strategic', vision: '"Transformasi digital bukan soal teknologi — ia soal mengubah cara rakyat mengakses kedaulatan ekonomi."', dimensions: [{ label: 'Fase', value: 'Foundation, Growth, Scale' }, { label: 'Timeline', value: '3 Tahun MVP to Full' }], principles: ['Digitalisasi harus inklusif — tidak boleh meninggalkan desa tanpa internet'], xref: [9, 26, 28, 31] },
      { id: 28, code: 'PGA-28', name: 'Cetak Biru Sistem Saraf Desa', eng: 'System Architecture / Blueprint', desc: 'Arsitektur teknis yang menghubungkan desa', domain: 4, domainColor: '#008F3D', badge: 'operational', vision: '"Saraf desa menghubungkan setiap titik ekonomi dalam jaringan yang tidak bisa diputus."', dimensions: [{ label: 'ArSITEKTUR', value: 'Distributed System' }, { label: 'Redundancy', value: 'Multi-node Backup' }], principles: ['Arsitektur harus tahan terhadap kegagalan node tunggal'], xref: [26, 27, 66, 67] },
      { id: 29, code: 'PGA-29', name: 'Peta Perjalanan Kehidupan Anggota', eng: 'User Journey Map', desc: 'Pengalaman anggota dari awal hingga akhir', domain: 4, domainColor: '#008F3D', badge: 'operational', vision: '"Setiap sentuhan dengan anggota adalah kesempatan untuk membuktikan bahwa kedaulatan itu nyata."', dimensions: [{ label: 'Touchpoint', value: 'Onboarding to Loyalty' }, { label: 'Metric', value: 'NPS, Retention, Satisfaction' }], principles: ['User experience harus mencerminkan nilai-nilai organisasi'], xref: [2, 10, 25, 35] },
      { id: 30, code: 'PGA-30', name: 'Standar Mutu Kelas Dunia', eng: 'Quality Standard & Acceptance', desc: 'Jaminan kualitas tanpa kompromi', domain: 4, domainColor: '#008F3D', badge: 'operational', vision: '"Kualitas kelas dunia bukan kemewahan — ia adalah hak setiap anggota KNBMP."', dimensions: [{ label: 'Standar', value: 'ISO & Custom' }, { label: 'Testing', value: 'Multi-layer QA' }], principles: ['Kualitas tidak bisa dinegosiasi — ia adalah janji kepada rakyat'], xref: [26, 31, 46, 67] },
      { id: 31, code: 'PGA-31', name: 'Dapur Inovasi Berkelanjutan', eng: 'Innovation Pipeline', desc: 'Mesin penciptaan inovasi yang tak padam', domain: 4, domainColor: '#008F3D', badge: 'strategic', vision: '"Inovasi bukan departemen — ia adalah mindset yang harus mengalir dalam setiap poros organisasi."', dimensions: [{ label: 'Pipeline', value: 'Idea to Production' }, { label: 'Budget', value: 'Revenue-linked' }], principles: ['Setiap anggota berhak mengusulkan inovasi'], xref: [25, 27, 30, 32] },
      { id: 32, code: 'PGA-32', name: 'Protokol Perubahan Platform', eng: 'Change Request Governance', desc: 'Tata kelola perubahan yang terkontrol', domain: 4, domainColor: '#008F3D', badge: 'operational', vision: '"Perubahan tanpa tata kelola adalah kekacauan. Tata kelola tanpa fleksibilitas adalah kematian."', dimensions: [{ label: 'Proses', value: 'Request, Review, Approve, Deploy' }, { label: 'SLA', value: 'Defined per Priority' }], principles: ['Setiap perubahan harus memiliki risiko assessment'], xref: [8, 20, 24, 72] },
    ],
  },
  {
    id: 5,
    code: 'D5',
    emoji: '🚚',
    name: 'Operations & Delivery',
    nameId: 'Operasional',
    range: 'PGA-33 — PGA-40',
    color: '#E65100',
    bgColor: 'rgba(230,81,0,0.08)',
    borderColor: 'border-l-[#E65100]',
    description: 'Eksekusi yang terukur: mengubah strategi menjadi layanan nyata di setiap desa',
    pillars: [
      { id: 33, code: 'PGA-33', name: 'Kitab Suci Operasional', eng: 'Master Operational SOP', desc: 'Panduan operasional utama seluruh ekosistem', domain: 5, domainColor: '#E65100', badge: 'operational', vision: '"Operasional tanpa SOP adalah improvisasi. Improvisasi tanpa standar adalah risiko."', dimensions: [{ label: 'Cakupan', value: 'Seluruh Fungsi Operasional' }, { label: 'Format', value: 'Step-by-step Playbook' }], principles: ['SOP harus hidup dan diperbarui berkala'], xref: [18, 34, 35, 40] },
      { id: 34, code: 'PGA-34', name: 'Peta Aliran Proses Abadi', eng: 'Process Map End-to-End', desc: 'Pemetaan proses dari hulu ke hilir', domain: 5, domainColor: '#E65100', badge: 'operational', vision: '"Proses yang terpetakan adalah proses yang bisa diperbaiki. Proses yang tak terlihat adalah proses yang tak bisa dipercaya."', dimensions: [{ label: 'Metode', value: 'BPMN & Visual Map' }, { label: 'Koneksi', value: 'Inter-process Dependencies' }], principles: ['Setiap proses harus memiliki input, output, dan owner yang jelas'], xref: [33, 35, 36, 38] },
      { id: 35, code: 'PGA-35', name: 'Panduan Pelayanan Paripurna', eng: 'Service Delivery Manual', desc: 'Standar pelayanan sempurna kepada anggota', domain: 5, domainColor: '#E65100', badge: 'operational', vision: '"Pelayanan paripurna bukan kemewahan — ia adalah standar minimum yang harus kami berikan kepada rakyat."', dimensions: [{ label: 'SLA', value: 'Response, Resolution, Satisfaction' }, { label: 'Channel', value: 'Omnichannel' }], principles: ['Kepuasan anggota adalah satu-satunya metrik yang benar-benar penting'], xref: [29, 33, 34, 40] },
      { id: 36, code: 'PGA-36', name: 'Panduan Pengadaan & Pemasok', eng: 'Procurement & Vendor Playbook', desc: 'Pengelolaan pengadaan yang transparan', domain: 5, domainColor: '#E65100', badge: 'operational', vision: '"Pengadaan yang transparan adalah bukti bahwa organisasi ini benar-benar milik rakyat."', dimensions: [{ label: 'Prinsip', value: 'Transparansi & Value' }, { label: 'Evaluasi', value: 'Scorecard System' }], principles: ['Setiap pengadaan harus bisa diaudit oleh anggota'], xref: [34, 37, 44, 46] },
      { id: 37, code: 'PGA-37', name: 'Tata Krama Kemitraan', eng: 'Partnership Playbook', desc: 'Etika dan mekanisme bermitra', domain: 5, domainColor: '#E65100', badge: 'operational', vision: '"Kemitraan sejati dibangun di atas rasa hormat, bukan di atas kepentingan sesaat."', dimensions: [{ label: 'Prinsip', value: 'Win-Win or No Deal' }, { label: 'Onboarding', value: 'Partner Vetting Process' }], principles: ['Setiap mitra harus menyepakati nilai-nilai KNBMP'], xref: [13, 14, 23, 36] },
      { id: 38, code: 'PGA-38', name: 'Protokol Pemadam Kebakaran', eng: 'Incident & Escalation SOP', desc: 'Penanganan insiden dan eskalasi darurat', domain: 5, domainColor: '#E65100', badge: 'operational', vision: '"Ketika kebakaran terjadi, yang menentukan bukan apakah itu terjadi, tetapi seberapa cepat kita memadamkannya."', dimensions: [{ label: 'Level', value: '1 (Minor) to 5 (Critical)' }, { label: 'Response', value: 'Defined per Level' }], principles: ['Setiap insiden harus memiliki post-mortem yang jujur'], xref: [34, 39, 40, 64] },
      { id: 39, code: 'PGA-39', name: 'Rencana Kebangkitan dari Bencana', eng: 'Business Continuity', desc: 'Kesiapan bangkit dari krisis terburuk', domain: 5, domainColor: '#E65100', badge: 'operational', vision: '"Organisasi yang hanya siap menghadapi hari baik bukan organisasi — ia adalah penjudi."', dimensions: [{ label: 'RTO', value: 'Recovery Time Objective' }, { label: 'RPO', value: 'Recovery Point Objective' }], principles: ['Business continuity harus diuji secara berkala, bukan hanya di atas kertas'], xref: [16, 38, 45, 66] },
      { id: 40, code: 'PGA-40', name: 'Panduan Pasukan Lapangan', eng: 'Field / Branch Deployment SOP', desc: 'Prosedur penempatan dan operasi lapangan', domain: 5, domainColor: '#E65100', badge: 'operational', vision: '"Pasukan lapangan adalah wajah KNBMP di setiap desa — mereka harus menjadi yang terbaik."', dimensions: [{ label: 'Deployment', value: 'Training, Placement, Monitoring' }, { label: 'Support', value: 'Central & Regional' }], principles: ['Setiap petugas lapangan adalah duta kedaulatan ekonomi'], xref: [12, 33, 35, 38] },
    ],
  },
  {
    id: 6,
    code: 'D6',
    emoji: '💰',
    name: 'Finance, Risk & Control',
    nameId: 'Keuangan & Risiko',
    range: 'PGA-41 — PGA-48',
    color: '#B01C28',
    bgColor: 'rgba(176,28,40,0.08)',
    borderColor: 'border-l-[#B01C28]',
    description: 'Keberlanjutan finansial: mengelola kekayaan rakyat dengan integritas tertinggi',
    pillars: [
      { id: 41, code: 'PGA-41', name: 'Anatomi Keuangan Masa Depan', eng: 'Financial Model & Projection', desc: 'Model keuangan yang meramal masa depan', domain: 6, domainColor: '#B01C28', badge: 'strategic', vision: '"Keuangan bukan hanya angka — ia adalah cermin keberlanjutan peradaban."', dimensions: [{ label: 'Model', value: 'Bottom-up Projection' }, { label: 'Horizon', value: '5, 10, 25, 50 Tahun' }], principles: ['Proyeksi keuangan harus konservatif dalam pendapatan, optimis dalam penghematan'], xref: [9, 42, 43, 47] },
      { id: 42, code: 'PGA-42', name: 'Hitungan Nadi Ekonomi', eng: 'Unit Economics', desc: 'Ekonomi per unit yang menjamin keberlanjutan', domain: 6, domainColor: '#B01C28', badge: 'strategic', vision: '"Jika nadi ekonomi per unit tidak sehat, maka ekosistem seluruhnya akan kolaps."', dimensions: [{ label: 'Metrics', value: 'CAC, LTV, Contribution Margin' }, { label: 'BEP', value: 'Per Desa, Per Domain' }], principles: ['Unit economics yang positif adalah syarat non-negotiable ekspansi'], xref: [41, 43, 44, 61] },
      { id: 43, code: 'PGA-43', name: 'Protokol Kendali Kas', eng: 'Budgeting & Cash Control SOP', desc: 'Pengendalian arus kas dengan disiplin tinggi', domain: 6, domainColor: '#B01C28', badge: 'operational', vision: '"Setiap rupiah milik rakyat harus dipertanggungjawabkan seolah ia satu-satunya rupiah yang kita miliki."', dimensions: [{ label: 'Prinsip', value: 'Zero-based Budgeting' }, { label: 'Approval', value: 'Multi-tier Authorization' }], principles: ['Tidak ada pengeluaran tanpa persetujuan dan pertanggungjawaban'], xref: [41, 42, 44, 48] },
      { id: 44, code: 'PGA-44', name: 'Mesin Penghasil Kemakmuran', eng: 'Revenue Model & Monetization', desc: 'Model pendapatan yang mengalir ke seluruh ekosistem', domain: 6, domainColor: '#B01C28', badge: 'strategic', vision: '"Kemakmuran bukan tujuan — ia adalah hasil dari sistem yang dirancang dengan benar."', dimensions: [{ label: 'Stream', value: 'Multiple Revenue Streams' }, { label: 'Distribution', value: 'Fair Value Sharing' }], principles: ['Revenue harus mengalir secara adil ke seluruh lapisan ekosistem'], xref: [25, 36, 42, 47] },
      { id: 45, code: 'PGA-45', name: 'Peta Radar Ancaman', eng: 'Risk Register & Mitigation Plan', desc: 'Pemetaan risiko dan rencana mitigasi', domain: 6, domainColor: '#B01C28', badge: 'strategic', vision: '"Risiko yang tidak dipetakan adalah risiko yang tidak bisa dikelola."', dimensions: [{ label: 'Framework', value: 'COSO ERM' }, { label: 'Review', value: 'Monthly Risk Committee' }], principles: ['Setiap risiko harus memiliki pemilik dan rencana mitigasi'], xref: [15, 16, 39, 46] },
      { id: 46, code: 'PGA-46', name: 'Mata Langit Transparansi', eng: 'Audit & Internal Control', desc: 'Pengawasan dan audit yang tak bisa ditipu', domain: 6, domainColor: '#B01C28', badge: 'operational', vision: '"Audit bukan tentang mencuri kesalahan — ia tentang memastikan kepercayaan tidak pernah pudar."', dimensions: [{ label: 'Jenis', value: 'Internal, Eksternal, Special' }, { label: 'Independensi', value: 'Direct to Board' }], principles: ['Audit harus independen dan dilindungi dari tekanan'], xref: [21, 30, 43, 48] },
      { id: 47, code: 'PGA-47', name: 'Memorandum Kepercayaan Investor', eng: 'Investment / Funding Memorandum', desc: 'Dokumen kepercayaan untuk mitra pendanaan', domain: 6, domainColor: '#B01C28', badge: 'strategic', vision: '"Investor yang tepat bukan yang memberi uang terbanyak, tetapi yang memahami visi peradaban."', dimensions: [{ label: 'Tipe', value: 'Equity, Debt, Grant' }, { label: 'Terms', value: 'Founder-friendly' }], principles: ['Setiap investasi harus selaras dengan misi kedaulatan ekonomi'], xref: [23, 41, 44, 63] },
      { id: 48, code: 'PGA-48', name: 'Penjaga Harta Karun', eng: 'Treasury, Asset & Reserve Policy', desc: 'Perlindungan aset dan cadangan strategis', domain: 6, domainColor: '#B01C28', badge: 'operational', vision: '"Harta yang tidak dijaga adalah harta yang menunggu untuk dirampas."', dimensions: [{ label: 'Cadangan', value: 'Operational & Strategic Reserve' }, { label: 'Investasi', value: 'Conservative Portfolio' }], principles: ['Aset strategis tidak boleh dijadikan jaminan utang spekulatif'], xref: [41, 43, 46, 47] },
    ],
  },
  {
    id: 7,
    code: 'D7',
    emoji: '👥',
    name: 'People, Culture & Leadership',
    nameId: 'Sumber Daya & Budaya',
    range: 'PGA-49 — PGA-56',
    color: '#00695C',
    bgColor: 'rgba(0,105,92,0.08)',
    borderColor: 'border-l-[#00695C]',
    description: 'Jiwa organisasi: membangun manusia dan budaya yang tangguh selama 100 tahun',
    pillars: [
      { id: 49, code: 'PGA-49', name: 'Seni Menemukan Bintang', eng: 'Talent & Recruitment Framework', desc: 'Kerangka merekrut talenta terbaik bangsa', domain: 7, domainColor: '#00695C', badge: 'operational', vision: '"Bintang tidak lahir dari selebaran — ia lahir dari proses penemuan yang sabar dan cermat."', dimensions: [{ label: 'Proses', value: 'Multi-stage Selection' }, { label: 'Kriteria', value: 'Competence & Character' }], principles: ['Karakter lebih penting dari kompetensi — kompetensi bisa diajarkan, karakter tidak'], xref: [50, 51, 53, 54] },
      { id: 50, code: 'PGA-50', name: 'Model Kepemimpinan Merah Putih', eng: 'Leadership Model', desc: 'Model pemimpin yang melayani rakyat', domain: 7, domainColor: '#00695C', badge: 'strategic', vision: '"Pemimpin yang sesungguhnya bukan yang dilayani, tetapi yang melayani."', dimensions: [{ label: 'Filosofi', value: 'Servant Leadership' }, { label: 'Level', value: 'Front-line to Board' }], principles: ['Setiap pemimpin harus melewati uji lapangan sebelum naik jabatan'], xref: [3, 17, 51, 56] },
      { id: 51, code: 'PGA-51', name: 'Panduan Pengelolaan SDM', eng: 'HR Operating Manual', desc: 'Manual operasional pengelolaan manusia', domain: 7, domainColor: '#00695C', badge: 'operational', vision: '"SDM bukan sumber daya — ia adalah manusia. Manusia yang harus diperlakukan dengan martabat."', dimensions: [{ label: 'Lifecyle', value: 'Hire to Retire' }, { label: 'Wellbeing', value: 'Physical, Mental, Financial' }], principles: ['Kesejahteraan karyawan adalah investasi, bukan biaya'], xref: [18, 49, 50, 52] },
      { id: 52, code: 'PGA-52', name: 'Cermin Prestasi Objektif', eng: 'Performance Management System', desc: 'Sistem evaluasi yang adil dan membangun', domain: 7, domainColor: '#00695C', badge: 'operational', vision: '"Evaluasi yang adil membangun kepercayaan. Evaluasi yang membangun menciptakan keunggulan."', dimensions: [{ label: 'Sistem', value: 'OKR + KPI' }, { label: 'Siklus', value: 'Quarterly Review' }], principles: ['Setiap orang berhak tahu di mana ia berdiri dan bagaimana ia bisa berkembang'], xref: [50, 51, 53, 67] },
      { id: 53, code: 'PGA-53', name: 'Kawah Candradimuka Akademi', eng: 'Training & Certification', desc: 'Tempat pembinaan dan sertifikasi kompetensi', domain: 7, domainColor: '#00695C', badge: 'operational', vision: '"Candradimuka — tempat para kesatria ditempa menjadi baja yang tak bisa dilenturkan."', dimensions: [{ label: 'Program', value: 'Leadership, Technical, Values' }, { label: 'Sertifikasi', value: 'Internal & External' }], principles: ['Setiap anggota berhak mengakses program pengembangan diri'], xref: [49, 51, 52, 54] },
      { id: 54, code: 'PGA-54', name: 'Kode Sandi Budaya', eng: 'Culture Code', desc: 'Sandi budaya yang membentuk karakter', domain: 7, domainColor: '#00695C', badge: 'strategic', vision: '"Budaya adalah apa yang kita lakukan ketika tidak ada yang melihat."', dimensions: [{ label: 'Pilar', value: 'Values, Rituals, Heroes, Symbols' }, { label: 'Enforcement', value: 'Culture Guardians' }], principles: ['Budaya harus dijaga secara aktif, bukan dibiarkan tumbuh liar'], xref: [3, 5, 50, 55] },
      { id: 55, code: 'PGA-55', name: 'Sumpah Etika Kesatria', eng: 'Ethics & Conduct Code', desc: 'Kode etik yang dijunjung tinggi', domain: 7, domainColor: '#00695C', badge: 'strategic', vision: '"Etika bukan aturan — ia adalah kompas jiwa yang menuntun setiap keputusan."', dimensions: [{ label: 'Prinsip', value: 'Zero Tolerance for Violations' }, { label: 'Reporting', value: 'Whistleblower Protection' }], principles: ['Pelanggaran etika harus ditindak tanpa pandang bulu'], xref: [5, 21, 54, 56] },
      { id: 56, code: 'PGA-56', name: 'Rantai Pewaris Peradaban', eng: 'Succession & Continuity Plan', desc: 'Rencana suksesi untuk keberlanjutan', domain: 7, domainColor: '#00695C', badge: 'strategic', vision: '"Organisasi yang hebat bukan yang bergantung pada satu orang — ia adalah yang memastikan kehebatan bertahan melampaui generasi."', dimensions: [{ label: 'Plan', value: 'Emergency & Strategic Succession' }, { label: 'Horizon', value: '7-Year Pipeline' }], principles: ['Suksesi harus direncanakan jauh sebelum dibutuhkan'], xref: [8, 50, 55, 71] },
    ],
  },
  {
    id: 8,
    code: 'D8',
    emoji: '📢',
    name: 'Brand, Growth & Stakeholders',
    nameId: 'Merek & Pertumbuhan',
    range: 'PGA-57 — PGA-64',
    color: '#AD1457',
    bgColor: 'rgba(173,20,87,0.08)',
    borderColor: 'border-l-[#AD1457]',
    description: 'Suara dan jangkauan: menyebarkan visi kedaulatan ke seluruh penjuru Nusantara',
    pillars: [
      { id: 57, code: 'PGA-57', name: 'Estetika Kedaulatan', eng: 'Brand & Communication Guideline', desc: 'Identitas visual yang memancarkan kedaulatan', domain: 8, domainColor: '#AD1457', badge: 'strategic', vision: '"Merek bukan logo — merek adalah janji yang diucapkan setiap hari melalui setiap interaksi."', dimensions: [{ label: 'Identity', value: 'Visual, Verbal, Digital' }, { label: 'Consistency', value: '100% Brand Compliance' }], principles: ['Setiap elemen visual harus mencerminkan kedaulatan dan martabat'], xref: [6, 58, 59, 63] },
      { id: 58, code: 'PGA-58', name: 'Matriks Narasi Penakluk Pikiran', eng: 'Narrative & Messaging', desc: 'Kerangka narasi yang menggerakkan hati', domain: 8, domainColor: '#AD1457', badge: 'strategic', vision: '"Narasi yang tepat pada waktu yang tepat bisa menggerakkan bangsa."', dimensions: [{ label: 'Framework', value: 'Hero, Problem, Solution, Vision' }, { label: 'Channel', value: 'All Media' }], principles: ['Narasi harus jujur, kuat, dan menginspirasi — bukan manipulatif'], xref: [4, 7, 57, 64] },
      { id: 59, code: 'PGA-59', name: 'Strategi Api Komunitas', eng: 'Community & Engagement', desc: 'Strategi menyalakan semangat komunitas', domain: 8, domainColor: '#AD1457', badge: 'operational', vision: '"Komunitas yang kuat bukan yang paling besar, tetapi yang paling saling peduli."', dimensions: [{ label: 'Platform', value: 'Digital & Physical' }, { label: 'Metric', value: 'Engagement, Advocacy, Growth' }], principles: ['Komunitas dibangun oleh anggota, bukan untuk anggota'], xref: [57, 58, 60, 61] },
      { id: 60, code: 'PGA-60', name: 'Konstelasi Pemangku Kepentingan', eng: 'Stakeholder Map', desc: 'Pemetaan hubungan dengan seluruh pemangku', domain: 8, domainColor: '#AD1457', badge: 'strategic', vision: '"Pemetaan yang akurat memungkinkan kita bergerak tanpa menginjak kaki siapa pun."', dimensions: [{ label: 'Map', value: 'Power-Interest Matrix' }, { label: 'Strategy', value: 'Per Segment' }], principles: ['Setiap pemangku kepentingan harus dipahami, bukan diabaikan'], xref: [13, 14, 59, 62] },
      { id: 61, code: 'PGA-61', name: 'Buku Pintar Ekspansi', eng: 'Sales / Acquisition Playbook', desc: 'Panduan akuisisi anggota dan mitra', domain: 8, domainColor: '#AD1457', badge: 'operational', vision: '"Ekspansi tanpa playbook adalah ekspansi tanpa arah."', dimensions: [{ label: 'Funnel', value: 'Awareness to Activation' }, { label: 'Conversion', value: 'Data-driven Optimization' }], principles: ['Akuisisi harus etis dan berkelanjutan — bukan agresif dan manipulatif'], xref: [11, 12, 42, 60] },
      { id: 62, code: 'PGA-62', name: 'Diplomasi Pemerintahan', eng: 'Public Affairs / Gov. Relations', desc: 'Hubungan strategis dengan pemerintah', domain: 8, domainColor: '#AD1457', badge: 'strategic', vision: '"Pemerintah bukan musuh — ia adalah mitra yang harus diyakinkan bahwa kedaulatan rakyat adalah kepentingan bersama."', dimensions: [{ label: 'Level', value: 'Pusat, Provinsi, Kabupaten, Desa' }, { label: 'Approach', value: 'Non-partisan' }], principles: ['Hubungan pemerintahan harus berbasis data dan bukti, bukan sentimen'], xref: [14, 21, 60, 64] },
      { id: 63, code: 'PGA-63', name: 'Deklarasi Mengguncang Investor', eng: 'Investor / Partner Deck', desc: 'Presentasi yang menggerakkan investor', domain: 8, domainColor: '#AD1457', badge: 'strategic', vision: '"Presentasi yang hebat bukan yang paling cantik, tetapi yang paling menggerakkan."', dimensions: [{ label: 'Format', value: 'Slide, Video, One-pager' }, { label: 'Update', value: 'Quarterly' }], principles: ['Setiap klaim dalam presentasi harus didukung data yang bisa diverifikasi'], xref: [41, 47, 57, 61] },
      { id: 64, code: 'PGA-64', name: 'Manajemen Krisis & Badai', eng: 'Media & Crisis Communication', desc: 'Protokol komunikasi saat badai melanda', domain: 8, domainColor: '#AD1457', badge: 'operational', vision: '"Badai akan datang. Yang membedakan adalah apakah kita siap atau tidak."', dimensions: [{ label: 'Protocol', value: 'Golden Hour Response' }, { label: 'Team', value: 'Crisis Task Force' }], principles: ['Kejujuran adalah satu-satunya strategi krisis yang berkelanjutan'], xref: [16, 38, 58, 62] },
    ],
  },
  {
    id: 9,
    code: 'D9',
    emoji: '💾',
    name: 'Data, Intelligence & Legacy',
    nameId: 'Data & Warisan',
    range: 'PGA-65 — PGA-72',
    color: '#1565C0',
    bgColor: 'rgba(21,101,192,0.08)',
    borderColor: 'border-l-[#1565C0]',
    description: 'Warisan peradaban: data, kebijaksanaan, dan keberlanjutan melampaui 100 tahun',
    pillars: [
      { id: 65, code: 'PGA-65', name: 'Kedaulatan Data Suci', eng: 'Data Governance & Privacy', desc: 'Tata kelola data yang menjaga kedaulatan', domain: 9, domainColor: '#1565C0', badge: 'strategic', vision: '"Data rakyat adalah harta suci yang tidak boleh diperjualbelikan."', dimensions: [{ label: 'Prinsip', value: 'Data Sovereignty' }, { label: 'Compliance', value: 'UU PDP & International' }], principles: ['Data anggota adalah milik anggota — KNBMP hanya menjaga'], xref: [28, 66, 67, 70] },
      { id: 66, code: 'PGA-66', name: 'Benteng Pertahanan Siber', eng: 'Security & Cyber Compliance', desc: 'Keamanan siber yang tak tertembus', domain: 9, domainColor: '#1565C0', badge: 'operational', vision: '"Keamanan siber bukan biaya — ia adalah jaminan bahwa kepercayaan rakyat tidak akan dikhianati."', dimensions: [{ label: 'Framework', value: 'Zero Trust Architecture' }, { label: 'Testing', value: 'Continuous Pen-test' }], principles: ['Security by design, bukan security as afterthought'], xref: [15, 28, 39, 65] },
      { id: 67, code: 'PGA-67', name: 'Panel Kontrol Alam Semesta', eng: 'KPI Dashboard & North Star Metrics', desc: 'Dasbor indikator kinerja utama', domain: 9, domainColor: '#1565C0', badge: 'operational', vision: '"Apa yang tidak terukur tidak bisa diperbaiki. Panel kontrol ini memastikan kita selalu tahu di mana kita berdiri."', dimensions: [{ label: 'North Star', value: 'Kedaulatan Ekonomi Index' }, { label: 'Dashboard', value: 'Real-time & Historical' }], principles: ['Metric yang benar lebih penting dari metric yang banyak'], xref: [20, 26, 30, 72] },
      { id: 68, code: 'PGA-68', name: 'Perpustakaan Kebijaksanaan', eng: 'Knowledge Management', desc: 'Pengelolaan pengetahuan organisasi', domain: 9, domainColor: '#1565C0', badge: 'operational', vision: '"Organisasi yang lupa pelajarannya akan mengulang kesalahannya. Perpustakaan ini memastikan kebijaksanaan tidak pernah hilang."', dimensions: [{ label: 'System', value: 'Centralized Knowledge Base' }, { label: 'Access', value: 'Role-based Permission' }], principles: ['Pengetahuan harus mengalir ke seluruh poros organisasi'], xref: [32, 53, 67, 69] },
      { id: 69, code: 'PGA-69', name: 'Radar Intelijen Ekonomi', eng: 'Research & Benchmark Register', desc: 'Riset dan tolok ukur terkini', domain: 9, domainColor: '#1565C0', badge: 'operational', vision: '"Organisasi yang buta terhadap lingkungannya akan tersesat."', dimensions: [{ label: 'Riset', value: 'Market, Competitor, Trend' }, { label: 'Frequency', value: 'Continuous Monitoring' }], principles: ['Keputusan harus didasarkan pada data, bukan asumsi'], xref: [11, 45, 67, 68] },
      { id: 70, code: 'PGA-70', name: 'Bakti Pada Bumi & Manusia', eng: 'ESG / Sustainability Framework', desc: 'Kerangka keberlanjutan dan tanggung jawab', domain: 9, domainColor: '#1565C0', badge: 'strategic', vision: '"Kita tidak mewarisi bumi dari nenek moyang — kita meminjamnya dari anak cucu."', dimensions: [{ label: 'Framework', value: 'ESG Triple Bottom Line' }, { label: 'Reporting', value: 'Annual Sustainability Report' }], principles: ['Keberlanjutan bukan departemen — ia adalah cara hidup organisasi'], xref: [4, 5, 65, 71] },
      { id: 71, code: 'PGA-71', name: 'Perjanjian Suci 100 Tahun', eng: 'Legacy / 100-Year Covenant', desc: 'Pakta suci warisan lintas generasi', domain: 9, domainColor: '#1565C0', badge: 'strategic', vision: '"Perjanjian ini mengikat generasi hari ini dengan generasi 100 tahun dari sekarang."', dimensions: [{ label: 'Horizon', value: '2025–2125' }, { label: 'Binding', value: 'Constitutional Level' }], principles: ['Warisan tidak dibangun sehari — ia dirajut setiap hari'], xref: [1, 4, 7, 72] },
      { id: 72, code: 'PGA-72', name: 'Indeks Master & Kontrol Semesta', eng: 'Master Index & Document Control', desc: 'Indeks induk dan pengendalian dokumen', domain: 9, domainColor: '#1565C0', badge: 'strategic', vision: '"Dokumen ini adalah otak dari seluruh arsitektur — ia memastikan setiap pilar tetap sinkron dan setiap perubahan tercatat."', dimensions: [{ label: 'Scope', value: 'All 72 Pillars' }, { label: 'Control', value: 'Version & Change Log' }], principles: ['Master Index adalah satu-satunya sumber kebenaran mutlak'], xref: [8, 24, 32, 67] },
    ],
  },
];

export const allPillars: Pillar[] = domains.flatMap(d => d.pillars);

export function getPillarByNumber(num: number): Pillar | undefined {
  return allPillars.find(p => p.id === num);
}

export function getDomainForPillar(pillarId: number): Domain | undefined {
  return domains.find(d => d.pillars.some(p => p.id === pillarId));
}
