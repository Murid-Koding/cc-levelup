-- Dev seed only. Not the approved launch taxonomy (PRD open question #4).
-- Contains 12 published sessions + 1 draft session to ensure pagination (> 9 items)
-- and same-day ordering tie-breakers can be reliably tested.

INSERT OR IGNORE INTO `pembicaras` (`id`, `nama`, `slug`, `bio`) VALUES
  (1, 'Budi Santoso', 'budi-santoso', NULL),
  (2, 'Siti Rahma', 'siti-rahma', NULL),
  (3, 'Andi Wijaya', 'andi-wijaya', NULL);

INSERT OR IGNORE INTO `kategoris` (`id`, `nama`, `slug`) VALUES
  (1, 'Teknologi', 'teknologi'),
  (2, 'Bisnis', 'bisnis'),
  (3, 'Desain', 'desain'),
  (4, 'Karir', 'karir'),
  (5, 'Komunitas', 'komunitas'),
  (6, 'Product', 'product');

INSERT OR IGNORE INTO `sharing_sessions` (
  `id`, `slug`, `judul`, `pembicara_id`, `tanggal`, `deskripsi`, `ringkasan`,
  `youtube_video_id`, `link_materi`, `status`
) VALUES
  (
    1,
    'membangun-api-dengan-nuxt',
    'Membangun API dengan Nuxt',
    1,
    '2025-09-01',
    'Pengantar merancang API sederhana di Nuxt untuk kebutuhan komunitas.',
    'Sesi ini membahas struktur route server Nuxt, validasi input, dan cara menjaga handler tetap tipis.',
    'devVideo001',
    'https://drive.google.com/drive/folders/membangun-api-dengan-nuxt-test',
    'published'
  ),
  (
    2,
    'desain-slide-yang-jelas',
    'Desain Slide yang Jelas',
    2,
    '2025-10-15',
    'Praktik merancang slide sharing session agar mudah diikuti di HP dan laptop.',
    'Pembahasan hierarki visual, tipografi, dan durasi per slide. Fokus pada materi komunitas.',
    'devVideo002',
    NULL,
    'published'
  ),
  (
    3,
    'produk-komunitas-yang-bertahan',
    'Produk Komunitas yang Bertahan',
    3,
    '2025-11-20',
    'Cara menjaga produk komunitas tetap berguna tanpa tim besar.',
    'Membahas scope MVP, keputusan yang ditunda, dan operasional harian.',
    'devVideo003',
    'https://drive.google.com/drive/folders/produk-komunitas-yang-bertahan-test',
    'published'
  ),
  (
    4,
    'karir-engineer-di-komunitas',
    'Karir Engineer di Komunitas',
    1,
    '2026-01-08',
    'Refleksi belajar publik lewat sharing session dan dampaknya ke karier.',
    'Sesi ini menelusuri manfaat mengajar, portofolio publik, dan batasan yang perlu dijaga.',
    'devVideo004',
    NULL,
    'published'
  ),
  (
    5,
    'bisnis-sampingan-untuk-member',
    'Bisnis Sampingan untuk Member',
    2,
    '2026-02-27',
    'Kerangka sederhana mengevaluasi ide bisnis sampingan tanpa meninggalkan kerja utama.',
    'Membahas validasi ide, waktu yang realistis, dan sinyal demand dari komunitas.',
    'devVideo005',
    NULL,
    'published'
  ),
  (
    6,
    'draft-sesi-belum-tayang',
    'Draft Sesi Belum Tayang',
    3,
    '2026-03-30',
    'Sesi draft untuk pengembangan lokal. Tidak boleh tampil di halaman publik.',
    'Konten ini sengaja berstatus draft agar pengujian filter published-only punya data negatif.',
    'devVideo006',
    NULL,
    'draft'
  ),
  (
    7,
    'pengenalan-typescript-modern',
    'Pengenalan TypeScript Modern',
    1,
    '2026-04-10',
    'Pondasi TypeScript untuk pengembang JavaScript yang ingin naik level.',
    'Ringkasan tipe dasar, inferensi, union type, dan best practice di aplikasi fullstack.',
    'devVideo007',
    NULL,
    'published'
  ),
  (
    8,
    'ux-research-praktis-komunitas',
    'UX Research Praktis untuk Komunitas',
    2,
    '2026-04-10',
    'Cara melakukan user interview cepat untuk memvalidasi ide produk.',
    'Teknik bertanya tanpa mengarahkan jawaban dan memetakan pola kebutuhan pengguna.',
    'devVideo008',
    NULL,
    'published'
  ),
  (
    9,
    'manajemen-state-di-vue-3',
    'Manajemen State di Vue 3',
    3,
    '2026-05-02',
    'Mengelola reaktivitas tanpa over-engineering menggunakan composable native.',
    'Pola composable lightweight MVVM dan perbandingannya dengan store global.',
    'devVideo009',
    NULL,
    'published'
  ),
  (
    10,
    'dasar-dasar-keamanan-web',
    'Dasar-dasar Keamanan Web',
    1,
    '2026-05-20',
    'Mengamankan form, validasi server-side, dan boundary akses di edge.',
    'Membahas serangan web umum, sanitasi input, token header assertion, dan rate limiting.',
    'devVideo010',
    NULL,
    'published'
  ),
  (
    11,
    'storytelling-dalam-presentasi',
    'Storytelling dalam Presentasi Teknis',
    2,
    '2026-06-15',
    'Struktur narasi agar topik teknis yang rumit tetap memikat audiens.',
    'Metode problem-action-result dan visualisasi alur berpikir saat membawakan materi.',
    'devVideo011',
    NULL,
    'published'
  ),
  (
    12,
    'optimasi-performa-web-modern',
    'Optimasi Performa Web Modern',
    3,
    '2026-07-01',
    'Teknik mengurangi ukuran bundle, image optimization, dan caching di edge.',
    'Analisis metrik Core Web Vitals, pattern YouTube facade, dan perutean SSR ringan.',
    'devVideo012',
    NULL,
    'published'
  ),
  (
    13,
    'mengembangkan-kebiasaan-menulis-teknis',
    'Mengembangkan Kebiasaan Menulis Teknis',
    1,
    '2026-07-20',
    'Mendokumentasikan apa yang dipelajari menjadi artikel yang mudah dipahami orang lain.',
    'Pentingnya catatan publik, konsistensi menulis mingguan, dan memilih sudut pandang.',
    'devVideo013',
    NULL,
    'published'
  );

INSERT OR IGNORE INTO `session_kategoris` (`session_id`, `kategori_id`) VALUES
  (1, 1),
  (1, 6),
  (2, 3),
  (3, 2),
  (3, 5),
  (4, 4),
  (4, 5),
  (5, 2),
  (6, 1),
  (7, 1),
  (8, 3),
  (8, 6),
  (9, 1),
  (10, 1),
  (11, 4),
  (12, 1),
  (13, 4);

INSERT OR IGNORE INTO `settings` (`key`, `value`) VALUES
  ('luma_embed_url', '');
