# PRD: CC Level Up! — Platform Arsip Sharing Session Komunitas

**Versi**: 0.2 (Draft revisi)
**Tanggal**: 21 September 2026
**Status**: Draft untuk diskusi teknis & desain
**Domain (tentatif)**: cclevelup.web.id

---

## 0. Ringkasan Perubahan dari v0.1

| #   | Perubahan                                                                           | Alasan singkat                                                                        |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Definisi "view" dipecah jadi `page_view` dan `video_play`                           | View halaman ≠ video ditonton; klik facade adalah sinyal niat yang jauh lebih akurat  |
| 2   | Pencatatan view dipindah ke client-side beacon                                      | Halaman detail disajikan dari edge cache, jadi kode server tidak jalan tiap kunjungan |
| 3   | Cloudflare Access diperluas ke `/api/admin/*`                                       | Melindungi `/admin` saja meninggalkan endpoint tulis terbuka                          |
| 4   | URL embed Luma disimpan di DB (tabel `Setting`), bukan hardcode                     | Agar ganti event tidak perlu deploy ulang                                             |
| 5   | Ditambah field `ringkasan` (teks panjang/transkrip)                                 | Halaman detail v0.1 terlalu miskin teks untuk target SEO                              |
| 6   | Ditambah `slug`, tabel `Pembicara`, kategori many-to-many, status publikasi         | Keputusan yang murah sekarang, mahal diubah setelah live                              |
| 7   | Urutan rollout dibalik: konten jalan paralel dengan development                     | Dengan ritme 2–3 minggu/sesi, launch setelah web selesai berarti arsip nyaris kosong  |
| 8   | Ditambah bagian Risiko & Mitigasi, backup data, halaman Tentang, kebijakan takedown | Celah operasional yang belum tercakup di v0.1                                         |
| 9   | Open Question soal domain & frekuensi ditutup                                       | Sudah dijawab pemilik komunitas                                                       |

---

## 1. Latar Belakang & Masalah

Komunitas ini rutin mengadakan sharing session dari para membernya. Rekaman sesi diunggah ke YouTube, tapi:

- Konten "tenggelam" di antara video lain di channel YouTube, tidak fokus/terkurasi.
- Tidak mudah bagi audiens (member atau publik) untuk menelusuri sharing session berdasarkan topik yang mereka minati.
- Tidak ada data kepemilikan komunitas soal siapa yang mengakses konten, dari mana asalnya, dan sesi mana yang paling diminati — data ini penting untuk evaluasi & branding komunitas ke depan.

## 2. Tujuan Produk

1. Menyediakan satu tempat terkurasi untuk menonton ulang seluruh sharing session komunitas.
2. Memudahkan penemuan konten berdasarkan topik/kategori, baik dari dalam web maupun dari pencarian Google.
3. Memberi komunitas data kepemilikan sendiri (kunjungan halaman, klik putar video, visitor unik, sumber trafik) yang tidak sepenuhnya bisa didapat dari YouTube Analytics.
4. Menjadi media branding komunitas dan sarana latihan public speaking / sharing keilmuan bagi member.

## 3. Non-Tujuan (Out of Scope untuk MVP)

- Sistem akun/login untuk penonton.
- Tracking progress belajar individual.
- Sertifikat kelulusan atau kuis.
- Upload/hosting file video sendiri (video tetap di-host di YouTube).
- Upload file materi/slide langsung ke platform (cukup link Google Drive).
- Dukungan multi-komunitas (multi-tenant).
- Alur submission & approval dari member (direncanakan untuk fase berikutnya).
- Halaman profil pembicara (struktur datanya disiapkan, halamannya fase berikutnya).

## 4. Target Pengguna

| Peran                             | Deskripsi                                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Penonton (publik umum)**        | Siapa saja, tanpa perlu akun, ingin menonton/mencari sharing session.                                                                              |
| **Admin**                         | Saat ini **hanya pemilik komunitas** (satu orang). Mengelola seluruh data sharing session: input, edit, hapus, kategorisasi, serta URL embed Luma. |
| **Pembicara/Member (masa depan)** | Berpotensi submit sesi sharing mereka sendiri di fase berikutnya.                                                                                  |

> Konsekuensi dari admin tunggal: tidak perlu sistem role, tapi ada risiko _single point of failure_ — lihat bagian 17 (Risiko & Mitigasi).

## 5. Ruang Lingkup MVP

### 5.1 Fitur Utama

**A. Daftar & Arsip Sharing Session**

- Menampilkan seluruh sharing session berstatus `published` dalam bentuk grid, dengan thumbnail dari YouTube.
- Setiap card menampilkan: judul, nama pembicara, tanggal, badge kategori.
- Urutan default: tanggal terbaru lebih dulu.
- Pagination (bukan load semua sekaligus).

**B. Halaman Detail Sharing Session**

- URL berbasis slug: `/sesi/{slug}` (contoh: `/sesi/membangun-api-dengan-nuxt`), bukan ID numerik.
- Video embed YouTube dengan pola _facade_: tampilkan thumbnail dulu, iframe asli dimuat saat diklik.
- Metadata lengkap: judul, pembicara, tanggal, kategori, deskripsi singkat, link materi/slide (Google Drive).
- **Ringkasan/transkrip** (teks panjang) — lihat catatan SEO di bawah.
- Sesi terkait (kategori sama), maksimal 3–4 item.

> **Catatan SEO (penting):** Google tidak bisa mengindeks isi video. Halaman yang hanya berisi judul + nama pembicara + 2 kalimat deskripsi adalah _thin content_ dan kemungkinan besar tidak akan muncul di pencarian — padahal SEO adalah salah satu kebutuhan non-fungsional utama. Field `ringkasan` diisi dengan poin-poin utama sesi atau transkrip yang sudah dirapikan (caption otomatis YouTube bisa dijadikan bahan mentah). Ini sekaligus meningkatkan aksesibilitas dan membuat search internal jauh lebih berguna. **Ini pekerjaan konten, bukan development** — perlu dialokasikan waktunya per sesi.

**C. Kategori & Pencarian**

- Filter berdasarkan kategori (satu sesi bisa punya lebih dari satu kategori).
- Search sederhana berdasarkan judul / nama pembicara / kategori / ringkasan.
- **Implementasi MVP: search di sisi klien.** Ambil sekali file index ringan (JSON berisi id, slug, judul, pembicara, kategori, potongan ringkasan) saat halaman arsip dimuat, lalu filter di browser. Hasilnya instan, tanpa panggilan API per ketikan, dan kompatibel dengan halaman yang di-cache di edge. Untuk skala puluhan sampai ~200 sesi ini lebih dari cukup; pindah ke SQLite FTS5 hanya kalau sudah jauh melewati itu.

**D. "Sedang / Akan Sharing"**

- Section di halaman arsip (dan opsional di landing) yang menampilkan event sharing session terdekat.
- Diimplementasikan menggunakan **embed dari Luma** ("Embed Event Page" — menampilkan 1 event, bukan daftar).
- **URL/ID embed disimpan di tabel `Setting` dan bisa diubah dari admin panel.** Embed Event Page terikat pada satu event tertentu: perubahan detail pada event itu memang otomatis tercermin di web, tapi begitu event selesai dan diganti event baru, ID embed-nya berubah. Kalau di-hardcode, admin harus deploy ulang tiap siklus.
- **Perlu ada empty state.** Dengan ritme 2–3 minggu sekali, akan ada periode tanpa event terjadwal. Embed event yang sudah lewat dan nangkring di halaman depan membuat situs terlihat terbengkalai. Kalau field `luma_embed_url` kosong, tampilkan fallback: ajakan mengikuti channel komunitas untuk info sesi berikutnya.

**E. Admin Panel (sederhana)**

- List sharing session dengan aksi edit/hapus dan indikator status (`draft` / `published`).
- Form tambah/edit: judul, slug (auto-generate dari judul, bisa di-override), pembicara, tanggal, kategori (multi-select), deskripsi singkat, ringkasan/transkrip, link YouTube, link materi Google Drive, status.
- Form pengaturan: URL embed Luma aktif.
- Tombol ekspor data (lihat bagian 17).
- Akses dijaga Cloudflare Access di level edge — **termasuk endpoint API-nya**, lihat bagian 11.

**F. Analitik Kepemilikan Komunitas**

- **Cloudflare Web Analytics** untuk: visitor unik, pageview, sumber trafik (organic/social/direct/referral), device.
- **Pencatatan internal di D1** untuk dua event per sesi:
  - `page_view` — halaman detail dibuka.
  - `video_play` — pengunjung mengklik facade untuk memutar video.
- `video_play` dijadikan **metrik utama** "paling banyak ditonton". `page_view` tetap berguna sebagai pembanding: rasio `video_play / page_view` menunjukkan seberapa menarik judul & thumbnail suatu sesi.
- Pencatatan dikirim dari browser lewat `navigator.sendBeacon`/`fetch` ke API route terpisah, **bukan** dihitung saat render halaman (lihat alasan teknis di bagian 11).

### 5.2 User Stories (MVP)

**Penonton**

- Saya ingin melihat daftar semua sharing session, agar bisa memilih yang saya minati.
- Saya ingin memfilter/mencari sesi berdasarkan topik, agar cepat menemukan konten relevan.
- Saya ingin membaca ringkasan sesi sebelum menonton, agar tahu apakah isinya sesuai kebutuhan saya.
- Saya ingin melihat siapa yang akan sharing berikutnya, agar bisa menyiapkan waktu untuk hadir.
- Saya ingin mengakses link materi presentasi, agar bisa belajar lebih dalam dari slide-nya.
- Saya ingin menemukan sesi ini lewat Google saat mencari topiknya, bukan hanya kalau sudah tahu komunitasnya.

**Admin**

- Saya ingin menginput data sharing session dengan mudah, agar arsip selalu ter-update.
- Saya ingin menyimpan sesi sebagai draft sebelum videonya siap dipublikasikan.
- Saya ingin mengganti event Luma yang tampil tanpa harus menyentuh kode.
- Saya ingin melihat sesi mana yang paling banyak diputar dan dari mana asal trafiknya, agar bisa mengevaluasi topik yang diminati dan efektivitas promosi.
- Saya ingin bisa mengekspor seluruh data arsip, agar tidak tergantung sepenuhnya pada satu platform.

## 6. Model Data

**SharingSession**

- `id`
- `slug` (unik, indexed)
- `judul`
- `pembicara_id` → relasi ke `Pembicara`
- `tanggal` (indexed)
- `deskripsi` (singkat, untuk card & meta description)
- `ringkasan` (teks panjang / transkrip, untuk SEO & aksesibilitas)
- `youtube_video_id`
- `link_materi` (URL Google Drive, nullable)
- `status` (`draft` | `published`, indexed)
- `created_at`, `updated_at`

**Pembicara**

- `id`
- `nama`
- `slug`
- `bio` (nullable, dipakai fase berikutnya)

> Alasan dinormalisasi meski halaman profil belum dibuat: nama sebagai teks bebas cepat berantakan (typo, variasi gelar, "Budi" vs "Budi Santoso") dan menghilangkan kemungkinan halaman per pembicara — padahal wadah untuk member adalah Tujuan #4. Menambah tabel sekarang jauh lebih murah daripada membersihkan data nanti.

**Kategori**

- `id`
- `nama`
- `slug`

**SessionKategori** (tabel pivot, many-to-many)

- `session_id`
- `kategori_id`

> Alasan many-to-many: realistis satu sesi menyentuh lebih dari satu topik (misal "Bisnis" + "Desain"). Biaya implementasinya kecil, tapi mengubah one-to-many jadi many-to-many setelah data terisi merepotkan.

**SessionEvent** (analitik internal)

- `id`
- `session_id` (indexed)
- `event_type` (`page_view` | `video_play`)
- `timestamp`
- `referrer` (nullable)

**Setting** (key-value sederhana)

- `key` (contoh: `luma_embed_url`)
- `value`

> Tidak ada entitas untuk jadwal event — data itu sepenuhnya dikelola di Luma. Yang disimpan hanya URL embed-nya.

## 7. Kebutuhan Non-Fungsional

- **Responsif**: prioritas mobile-first, karena kemungkinan besar audiens mengakses lewat HP.
- **SEO-friendly**:
  - SSG/SSR untuk seluruh halaman publik.
  - Meta title & description per sesi, Open Graph image dari thumbnail YouTube.
  - Structured data `VideoObject` (schema.org) di halaman detail.
  - `sitemap.xml` yang ter-generate otomatis dari data sesi berstatus `published`.
  - Konten teks yang memadai di tiap halaman detail (lihat 5.1.B).
- **Performa**:
  - Lazy-load embed YouTube/Luma dengan pola _facade_.
  - Static generation (SSG) atau cache route untuk halaman arsip & detail, disajikan dari edge cache Cloudflare.
  - Optimasi gambar/thumbnail (resize, WebP, lazy-load saat masuk viewport).
  - Pagination untuk daftar sharing session.
  - Index database pada kolom yang sering difilter (status, tanggal, slug, session_id).
  - Transisi halaman yang halus (View Transitions API / page transition bawaan Nuxt).
- **Aksesibilitas (a11y)**: kontras warna memadai, navigasi keyboard, alt text pada thumbnail, transkrip sebagai alternatif teks untuk video.
- **Keamanan admin**: dijaga di level edge (lihat bagian 11), tidak perlu sistem role kompleks karena admin hanya 1 orang.

## 8. Metrik Keberhasilan

| Metrik                                      | Target awal (6 bulan pertama)                             |
| ------------------------------------------- | --------------------------------------------------------- |
| Jumlah sesi terarsipkan                     | ≥ 10 (mengikuti ritme 2–3 minggu/sesi)                    |
| Unique visitor per bulan                    | Tetapkan baseline di bulan 1, lalu ukur pertumbuhan       |
| Klik putar video (`video_play`) per visitor | Indikator engagement utama                                |
| Rasio `video_play / page_view` per sesi     | Evaluasi daya tarik judul & thumbnail                     |
| Top 5 sesi berdasarkan `video_play`         | Insight topik yang diminati                               |
| Distribusi sumber trafik                    | Evaluasi channel promosi yang efektif                     |
| % trafik dari organic search                | Indikator apakah investasi SEO/ringkasan membuahkan hasil |

## 9. Roadmap / Fase Berikutnya

- Member bisa submit sharing session sendiri, dengan alur approval oleh admin.
- Halaman profil pembicara (struktur data sudah siap sejak MVP).
- Sistem akun ringan (misal Google Sign-In) jika butuh fitur personal.
- Dukungan multi-komunitas (multi-tenant).
- Notifikasi (email/WA/Telegram) untuk info "Sedang/Akan Sharing".
- Rating atau feedback dari penonton.
- Bilingual penuh (Indonesia + Inggris).

## 10. Keputusan yang Sudah Ditutup & Open Questions

### Sudah diputuskan (sebelumnya open)

| Topik                         | Keputusan                                                  |
| ----------------------------- | ---------------------------------------------------------- |
| **Domain**                    | `cclevelup.web.id`                                         |
| **Frekuensi sharing session** | Minimal 1 sesi per 2–3 minggu (≈ 17–26 sesi/tahun)         |
| **Jumlah admin**              | Satu orang (pemilik komunitas)                             |
| **Tools analytics**           | Cloudflare Web Analytics + pencatatan event internal di D1 |
| **Struktur kategori**         | Many-to-many                                               |

**Catatan soal `cclevelup.web.id`:**

- Perlu dicek persyaratan registrasi — ekstensi `.web.id` umumnya mensyaratkan identitas/dokumen Indonesia, jadi pastikan sebelum merencanakan peluncuran.
- ccTLD `.id` mengirim sinyal geo-targeting Indonesia ke mesin pencari. Ini **selaras** dengan MVP berbahasa Indonesia, tapi sedikit menghambat kalau fase bilingual nanti menargetkan audiens internasional. Bukan penghalang untuk MVP, hanya perlu disadari.
- Amankan juga akun media sosial dengan handle yang sama, sekalian saat mendaftarkan domain.

### Masih terbuka

1. **Landing page terpisah atau digabung dengan arsip?**
   v0.1 memisahkan landing page (root) dari halaman arsip. Konsekuensinya: satu klik tambahan antara pengunjung dan konten, dan halaman root tanpa konten adalah halaman terlemah untuk SEO — padahal root adalah halaman yang paling sering di-_link_ orang.
   **Rekomendasi**: satu halaman root berisi hero singkat + section Luma + grid 6–9 sesi terbaru + tautan "Lihat semua sesi" ke arsip lengkap. Ini mempertahankan fungsi branding tapi langsung menunjukkan isi.
   Kalau tetap ingin memisahkan demi kesan brand yang lebih kuat, itu sah — tapi jadikan keputusan sadar, dan pastikan landing page tetap punya konten teks yang cukup.

2. **RSVP via Luma**: apakah event Luma sekaligus dipakai untuk pendaftaran peserta yang hadir langsung, atau murni informasi jadwal? Jawabannya memengaruhi copy CTA ("Daftar sekarang" vs "Lihat jadwal").

3. **Apakah setiap sesi wajib punya ringkasan/transkrip sebelum bisa `published`?** Kalau ya, ini menambah beban kerja per sesi; kalau tidak, target SEO melemah. Bisa jadi jalan tengah: deskripsi minimal ~150 kata wajib, transkrip penuh opsional.

4. **Kategori awal**: daftar kategori dibiarkan dinamis, tapi perlu ditetapkan 4–6 kategori awal supaya filter tidak kosong saat launch.

## 11. Tech Stack & Arsitektur Teknis

**Stack terpilih:**

| Layer             | Pilihan                            | Alasan                                                                                                               |
| ----------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Framework         | **Nuxt.js** (Vue + Vite)           | Familiar bagi developer, full-stack dalam satu project, SSR/SSG untuk SEO                                            |
| Hosting           | **Cloudflare Pages/Workers**       | Gratis untuk skala komunitas, satu ekosistem dengan D1 & Access, edge network cepat                                  |
| Database          | **Cloudflare D1** (SQLite)         | Native di ekosistem Cloudflare, gratis, tanpa risiko auto-pause — cocok untuk traffic yang tidak konsisten tiap hari |
| Autentikasi admin | **Cloudflare Zero Trust Access**   | Melindungi route admin di level edge tanpa membangun sistem auth sendiri                                             |
| Analytics         | **Cloudflare Web Analytics**       | Gratis, tanpa cookie, data visitor & sumber trafik otomatis                                                          |
| Video & jadwal    | **YouTube embed** + **Luma embed** | Dimuat langsung oleh browser; backend hanya menyimpan link/ID                                                        |

**Alur arsitektur:**
Browser → Nuxt app (berjalan sebagai Cloudflare Worker) → Cloudflare D1. Video YouTube dan info jadwal Luma dimuat langsung oleh browser lewat embed, tanpa melalui backend.

### Tiga catatan teknis yang harus diperhatikan sejak awal

**1. Cloudflare Access harus menutupi endpoint API, bukan hanya halaman.**
Kalau policy Access hanya melindungi path `/admin`, sementara form di dalamnya memanggil `/api/sessions` (POST/PUT/DELETE), endpoint tersebut **terbuka untuk siapa saja** — orang bisa menghapus seluruh arsip dengan satu perintah `curl`. Ini kesalahan yang sangat umum pada pola "auth di edge".
**Solusi**: letakkan seluruh endpoint tulis di bawah prefix `/api/admin/*`, dan masukkan **dua** path ke dalam policy Access: `/admin*` dan `/api/admin/*`. Sebagai lapisan kedua, verifikasi header `Cf-Access-Jwt-Assertion` di sisi server sebelum memproses operasi tulis.

**2. Edge cache dan view counter saling bertabrakan.**
Kalau halaman detail disajikan dari edge cache atau di-_generate_ secara statis, kode server tidak dijalankan pada setiap kunjungan — sehingga counter tidak akan pernah bertambah. Menonaktifkan cache demi counter berarti membuang keunggulan performa utama arsitektur ini.
**Solusi**: halaman tetap statis/ter-cache; pencatatan dikirim dari browser ke endpoint terpisah (`POST /api/events`) lewat `sendBeacon`. Efek samping yang menguntungkan: cara ini otomatis menyaring sebagian besar bot dan crawler, yang kalau tidak akan menggelembungkan angka arsip.
**Catatan**: endpoint ini publik, jadi beri rate limit sederhana (Cloudflare Rate Limiting Rules) supaya tidak mudah di-spam.

**3. Batas D1 pada tabel event.**
`SessionEvent` adalah tabel yang tumbuh terus. Untuk skala komunitas ini jumlahnya kecil, tapi siapkan job agregasi berkala (harian/mingguan) yang meringkas jumlah event per sesi per hari, lalu memangkas baris mentah yang lebih lama dari ~90 hari. Bisa dijalankan lewat Cloudflare Cron Trigger.

## 12. Branding & Penamaan

- **Nama**: "CC Level Up!" — dipakai penuh (tidak disingkat jadi akronim), karena makna "naik level" adalah daya tarik utama nama ini. Singkatan/monogram hanya untuk elemen visual kecil (favicon/logo mark).
- **Domain**: `cclevelup.web.id`.
- **Tone visual**: terinspirasi luma.com — sans-serif bersih, banyak white space, card dengan rounded corner lembut, warna soft/pastel namun tetap kontras, animasi halus. Selaras dengan prinsip performa (flat design, minim efek berat).

## 13. Bahasa & Lokalisasi

- MVP: konten & UI dalam **Bahasa Indonesia**.
- Arsitektur disiapkan **i18n-ready** (`@nuxtjs/i18n`) sejak awal.
- Bilingual penuh masuk roadmap fase berikutnya, bukan MVP.

## 14. Etika, Perizinan & Kebijakan Konten

- Setiap sharing session yang direkam & dipublikasikan sudah mendapat izin dari pembicara.
- **Kebijakan penarikan konten (baru)**: jika suatu saat pembicara meminta sesinya diturunkan, admin mengubah status sesi menjadi `draft` (halaman tidak lagi dapat diakses publik) tanpa menghapus datanya. Cantumkan kontak untuk permintaan ini di halaman Tentang.
- Materi presentasi tetap berada di Google Drive milik pembicara/komunitas — platform hanya menautkan, tidak menyalin.

## 15. Rencana Peluncuran (Rollout) — **direvisi**

v0.1 merencanakan: bangun website sampai selesai, baru mulai menjalankan sharing session.

**Rekomendasi revisi: jalankan keduanya secara paralel.**

Alasannya berkaitan langsung dengan ritme 2–3 minggu sekali. Kalau sesi pertama baru dijalankan setelah web selesai, arsip akan berisi 1 sesi saat peluncuran, 2 sesi setelah sebulan, dan baru mencapai 5 sesi sekitar 3 bulan kemudian. Kesan pertama — yang paling menentukan — jatuh tepat saat platform paling terlihat kosong. Grid dengan satu card sulit dibedakan dari proyek yang ditinggalkan.

**Urutan yang disarankan:**

| Fase            | Kegiatan                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Sekarang**    | Mulai jalankan sharing session dengan cara yang sudah ada (upload ke YouTube seperti biasa). Kumpulkan juga deskripsi & materi tiap sesi. |
| **Paralel**     | Development web berjalan. Daftarkan domain & cek persyaratan `.web.id` lebih awal.                                                        |
| **Web selesai** | Isi arsip dengan seluruh sesi yang sudah terkumpul (status `draft` dulu).                                                                 |
| **Launch**      | Publikasikan setelah ada **minimal 5–8 sesi** terarsipkan. Baru promosikan ke luar komunitas.                                             |

**Keuntungan tambahan**: kalau ternyata ritme sharing session lebih sulit dijaga daripada perkiraan, hal itu akan ketahuan **sebelum** ada effort development yang terlanjur besar. Konten adalah bottleneck sebenarnya di produk ini, bukan kode.

## 16. Desain: Daftar Halaman & Elemen

**A. Landing Page / Root** _(struktur final tergantung Open Question #1)_

- Hero: nama "CC Level Up!", headline & tagline singkat
- CTA: (1) ke arsip sharing session, (2) ke jadwal sesi berikutnya (Luma)
- 3 poin value proposition: gratis, terkategori, bisa ditonton kapan saja
- _(Jika digabung)_: section Luma + grid 6–9 sesi terbaru + tautan "Lihat semua sesi"

**B. Halaman Arsip/Jelajah**

- Section "Sedang/Akan Sharing" (embed Luma, dengan empty state)
- Search bar + filter kategori
- Grid card: thumbnail YouTube, judul, pembicara, tanggal, badge kategori
- Pagination

**C. Halaman Detail Sharing Session** (`/sesi/{slug}`)

- Video embed YouTube (facade/lazy-load)
- Judul, pembicara, tanggal, badge kategori
- Deskripsi + ringkasan/transkrip
- Tombol ke materi presentasi (Google Drive)
- Sesi terkait (kategori sama) + navigasi kembali ke arsip

**D. Halaman Kategori/Hasil Pencarian** (`/kategori/{slug}`)

- Sama seperti grid arsip, sudah terfilter
- Indikator filter aktif dengan opsi hapus
- Punya URL sendiri agar bisa dibagikan dan diindeks Google

**E. Halaman Tentang** _(baru)_

- Apa itu komunitas ini dan siapa yang menjalankannya
- Cara ikut hadir / menjadi pembicara
- Kontak (termasuk untuk permintaan penarikan konten)
- _Alasan: branding komunitas adalah Tujuan #4, tapi v0.1 tidak punya satu pun halaman yang menjelaskan komunitasnya._

**F. Panel Admin**

- Login disediakan Cloudflare Access (tidak perlu didesain)
- List sesi dengan aksi edit/hapus + indikator status
- Form tambah/edit sesi
- Form pengaturan (URL embed Luma)
- Tombol ekspor data

**G. Halaman 404** — dengan tautan kembali ke arsip.

## 17. Risiko & Mitigasi _(bagian baru)_

| Risiko                                                                     | Dampak                                                                                        | Mitigasi                                                                                                                                                                           |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin tunggal** — pemilik komunitas satu-satunya yang bisa mengisi arsip | Arsip berhenti ter-update saat ia sibuk; jika akses akunnya hilang, tidak ada yang bisa masuk | Masukkan **minimal 2 email** ke whitelist Cloudflare Access sejak awal (email kedua bisa akun cadangan milik sendiri). Buat checklist input sesi supaya mudah didelegasikan nanti. |
| **Ritme konten terputus**                                                  | Situs terlihat mati; Luma section kosong                                                      | Empty state yang baik; target eksplisit 2–3 minggu/sesi; jadwalkan beberapa sesi sekaligus di awal                                                                                 |
| **Kehilangan data**                                                        | Arsip adalah satu-satunya aset data komunitas                                                 | D1 punya _time travel_ ~30 hari, tapi itu bukan backup jangka panjang. Tambahkan ekspor berkala seluruh tabel ke JSON/CSV (tombol manual di admin + Cron Trigger mingguan)         |
| **Endpoint admin tidak terlindungi**                                       | Data bisa dihapus orang luar                                                                  | Lihat bagian 11, catatan #1                                                                                                                                                        |
| **Ketergantungan pada Luma & YouTube**                                     | Perubahan kebijakan embed bisa merusak tampilan                                               | Simpan `youtube_video_id` (bukan hanya URL) dan URL Luma di DB; keduanya mudah diganti tanpa migrasi data                                                                          |
| **Arsip terlihat kosong saat launch**                                      | Kesan pertama buruk, sulit diperbaiki                                                         | Lihat bagian 15 (rollout paralel)                                                                                                                                                  |

---

_Dokumen ini adalah draft v0.2 untuk didiskusikan lebih lanjut sebelum masuk ke tahap desain teknis & wireframe. Item yang masih terbuka terkumpul di bagian 10._
