# 🏫 Sistem Konseling BK Cerdas - SMP Bina Karya Ngamprah

Sistem Konseling BK Cerdas adalah platform web modern berbasis **Next.js 16** yang dirancang untuk membantu Guru BK (Bimbingan Konseling) di SMP Bina Karya Ngamprah dalam memantau rekam jejak siswa, mencatat riwayat kasus, serta memberikan **rekomendasi penjurusan kelanjutan studi (SMA/SMK)** secara cerdas menggunakan kecerdasan buatan (Hybrid AI).

Sistem ini menggabungkan aturan logika psikologis klinis (**Decision Tree**) dengan probabilitas statistik historis (**Naive Bayes**) untuk menyajikan rekomendasi akhir (utama) dan rekomendasi alternatif secara presisi dan ilmiah.

---

## 🚀 Fitur Utama Sistem

1. **🔐 Multi-Role Authentication**: Login khusus dengan hak akses berbeda untuk **Siswa**, **Guru BK**, dan **Admin** menggunakan NextAuth.
2. **🌳 Hybrid AI Recommendation Engine**: 
   * Mesin klasifikasi hibrida yang memproses data **Nilai Akademik (STEM, Sosial, Bahasa)**, **Minat**, dan **Bakat** siswa.
   * Aturan khusus *Informatika Grade A* untuk deteksi potensi teknologi siswa secara akurat.
   * Penentuan rekomendasi alternatif secara dinamis menggunakan ranking probabilitas Naive Bayes.
3. **📊 Manajemen Data Siswa & Akademis**: Pencatatan profil siswa, nilai rapor per semester, serta minat-bakat.
4. **📝 Catatan Riwayat Kasus**: Modul pencatatan kasus konseling atau pelanggaran siswa yang terintegrasi dengan Guru BK yang menangani.
5. **📥 Export & Import Data**: Dukungan pengolahan data dengan format spreadsheet Excel (`xlsx`).
6. **📱 Premium UI/UX**: Tampilan responsif, modern, dan interaktif dengan Tailwind CSS v4 dan dynamic micro-animations.

---

## 🛠️ Stack Teknologi (Tech Stack)

* **Framework Utama**: [Next.js 16 (App Router)](https://nextjs.org/)
* **Database ORM**: [Prisma ORM](https://www.prisma.io/)
* **Database Engine**: [PostgreSQL](https://www.postgresql.org/) (Didukung Supabase / Neon DB)
* **Authentication**: [NextAuth.js](https://next-auth.js.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
* **Helper Script**: [tsx](https://github.com/privatenumber/tsx) (untuk eksekusi script TypeScript / Seeding)
* **Utility**: [xlsx](https://sheetjs.com/) (untuk laporan Excel), [lucide-react](https://lucide.react.dev/) (iconpack)

---

## 📖 Dokumentasi Lengkap

Kami telah menyediakan dokumentasi teknis dan panduan operasional terperinci yang dapat diakses melalui tautan di bawah ini:

* 📥 **[Panduan Instalasi Proyek (Lokal/PC Lain)](file:///c:/Users/Mystic/Desktop/JOKI/ON%20PROGRESS/Website/konseling/docs/cara-install.md)** - Langkah-langkah detail setting database, `.env`, package installation, dan troubleshooting.
* 🧠 **[Cara Kerja Algoritma Klasifikasi AI](file:///c:/Users/Mystic/Desktop/JOKI/ON%20PROGRESS/Website/konseling/docs/cara-kerja-algoritma.md)** - Penjelasan detail tentang kalkulasi matematis Naive Bayes, pohon keputusan (Decision Tree), dan sistem konsensus hibrida.
* 🗺️ **[Alur Proses Rekomendasi (End-to-End Workflow)](file:///c:/Users/Mystic/Desktop/JOKI/ON%20PROGRESS/Website/konseling/docs/alur-proses-rekomendasi.md)** - Diagram alur bisnis dan diagram urutan (sequence diagram) interaksi antarmuka dengan database.

---

## ⚡ Langkah Cepat Memulai (Quick Start)

Untuk detail langkah instalasi lengkap di PC baru, harap merujuk ke **[Panduan Instalasi](file:///c:/Users/Mystic/Desktop/JOKI/ON%20PROGRESS/Website/konseling/docs/cara-install.md)**. Berikut ringkasannya:

```bash
# 1. Install dependensi
npm install

# 2. Siapkan file .env (Salin dari .env.example)
cp .env.example .env
# Lalu konfigurasi DATABASE_URL, DIRECT_URL, dan NEXTAUTH_SECRET di file .env

# 3. Generate Prisma client
npx prisma generate

# 4. Sinkronisasikan database (Tabel & Skema)
npx prisma db push

# 5. Isi data awal / default account
npx prisma db seed

# 6. Jalankan server lokal
npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)** di browser Anda.

---

## 🔑 Akun Bawaan Seeding (Default Accounts)

Gunakan credential berikut setelah menjalankan perintah `npx prisma db seed`:

* **Akun Guru BK (Admin)**:
  * **Username**: `admin@bk.com`
  * **Password**: `123`
* **Akun Siswa**:
  * **Username**: `101010`
  * **Password**: `123`

---

## 📂 Struktur Direktori Proyek

```bash
├── docs/                      # Dokumentasi sistem, alur proses, dan algoritma
├── prisma/                    # Konfigurasi database PostgreSQL (Schema & Seed)
├── public/                    # Aset statis (gambar, icon, logo)
├── src/
│   ├── app/                   # Routing Next.js (App Router) & Pages
│   ├── components/            # Komponen UI Reusable (Dashboard, UI Elements)
│   ├── lib/                   # Utility & Inisialisasi Database (Prisma Client)
│   └── types/                 # Definisi Tipe TypeScript
├── .env.example               # Template environment variables
├── package.json               # Dependensi & script perintah NPM
└── tsconfig.json              # Konfigurasi TypeScript
```
