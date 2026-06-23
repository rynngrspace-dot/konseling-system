# Panduan Instalasi Proyek Sistem Konseling di PC Lain

Dokumen ini berisi panduan langkah demi langkah untuk menginstal dan menjalankan proyek **Sistem Konseling** di komputer atau PC baru. Proyek ini dibangun menggunakan **Next.js 16**, **Prisma (PostgreSQL)**, **Tailwind CSS v4**, dan **NextAuth**.

---

## 📋 Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan PC baru sudah menginstal beberapa software berikut:

1. **Node.js**: Versi **18.18.0+** atau **20.x+** (sangat direkomendasikan versi LTS terbaru).
   * Cek versi Node.js di terminal: `node -v`
2. **NPM**: Biasanya otomatis terinstal bersama Node.js.
   * Cek versi NPM: `npm -v`
3. **Database PostgreSQL**: Anda bisa menggunakan:
   * PostgreSQL lokal yang terinstal di PC.
   * Database cloud gratis seperti **Supabase** (sangat disarankan, proyek ini sebelumnya menggunakan Supabase) atau **Neon DB**.
4. **Git** (Opsional): Untuk melakukan kloning repository.

---

## 🚀 Langkah-langkah Instalasi

### Langkah 1: Salin Proyek ke PC Baru
Jika menggunakan Git, jalankan perintah berikut di terminal:
```bash
git clone <url-repository-anda>
cd konseling
```
Jika tidak menggunakan Git, salin/ekstrak folder proyek `konseling` ke direktori PC Anda, kemudian buka terminal (Command Prompt/PowerShell/Terminal) di dalam folder tersebut.

---

### Langkah 2: Instalasi Dependensi Node.js
Jalankan perintah berikut untuk menginstal semua library/paket yang diperlukan oleh proyek:
```bash
npm install
```
> [!NOTE]
> Proses ini akan membaca file `package.json` dan mengunduh package ke dalam folder `node_modules`. Pastikan koneksi internet stabil.

---

### Langkah 3: Konfigurasi Environment Variables (`.env`)
Aplikasi membutuhkan konfigurasi koneksi database dan keamanan sesi.
1. Cari file bernama `.env.example` di root direktori proyek.
2. Salin (copy) dan ganti namanya menjadi `.env`. Di Windows/Linux via terminal:
   ```bash
   cp .env.example .env
   ```
3. Buka file `.env` yang baru dibuat dengan text editor (seperti VS Code atau Notepad), kemudian sesuaikan nilainya:

```env
# URL koneksi database PostgreSQL (dengan port pooling seperti PgBouncer jika memakai Supabase cloud)
DATABASE_URL="postgresql://username:password@host:port/database_name?pgbouncer=true"

# URL koneksi database langsung (direct connection) tanpa pooling. Digunakan Prisma untuk migrasi.
DIRECT_URL="postgresql://username:password@host:port/database_name"

# Kunci rahasia untuk enkripsi token NextAuth. Anda bebas menulis string acak panjang apa saja.
NEXTAUTH_SECRET="tulis_kode_rahasia_bebas_disini_minimal_32_karakter"
```

> [!TIP]
> * Jika menggunakan **Supabase**, Anda bisa mendapatkan `DATABASE_URL` (Transaction Mode - port 6543) dan `DIRECT_URL` (Session Mode - port 5432) di dashboard Supabase bagian **Project Settings > Database**.
> * Jika menggunakan **PostgreSQL Lokal**, Anda bisa menyamakan nilai `DATABASE_URL` dan `DIRECT_URL` ke database lokal Anda, misalnya: `postgresql://postgres:admin123@localhost:5432/db_konseling`

---

### Langkah 4: Setup Database dengan Prisma
Setelah file `.env` terkonfigurasi dengan benar, sinkronisasikan skema database dan masukkan data awal (seed data) dengan langkah berikut:

1. **Generate Prisma Client**:
   Menghasilkan client database agar query TypeScript/JavaScript dapat berjalan.
   ```bash
   npx prisma generate
   ```

2. **Push Skema Database**:
   Membuat tabel-tabel di database PostgreSQL Anda sesuai skema yang telah didefinisikan di [schema.prisma](file:///c:/Users/Mystic/Desktop/JOKI/ON%20PROGRESS/Website/konseling/prisma/schema.prisma).
   ```bash
   npx prisma db push
   ```
   *(Alternatif jika ingin menggunakan migration tracking: `npx prisma migrate dev --name init`)*

3. **Seeding Data (Data Awal)**:
   Mengisi database dengan akun Guru BK (Admin) dan Siswa percobaan bawaan sistem.
   ```bash
   npx prisma db seed
   ```

---

### Langkah 5: Jalankan Aplikasi dalam Mode Development
Sekarang aplikasi siap dijalankan. Mulai server lokal dengan perintah:
```bash
npm run dev
```
Setelah server berjalan, buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Akun Uji Coba Bawaan (Default Credentials)

Setelah menjalankan proses **Seeding Data** di Langkah 4, Anda bisa login ke aplikasi menggunakan akun-akun berikut:

### 1. Akun Guru BK / Admin (Akses Penuh)
* **Username / Email**: `admin@bk.com`
* **Password**: `123`
* **Fitur**: Mencatat riwayat kasus siswa, mengelola rekomendasi jurusan, memvalidasi hasil.

### 2. Akun Siswa
* **Username / NIS**: `101010`
* **Password**: `123`
* **Fitur**: Melihat nilai akademik, minat bakat, riwayat kasus sendiri, dan hasil rekomendasi jurusan.

---

## 🛠️ Pemecahan Masalah (Troubleshooting)

Berikut adalah beberapa masalah umum yang sering ditemui saat instalasi di PC baru dan cara mengatasinya:

### 1. Error: `PrismaClientInitializationError` atau Gagal Menghubungkan ke Database
* **Penyebab**: Koneksi internet terputus (jika menggunakan cloud DB), credential database salah, atau database lokal belum aktif.
* **Solusi**: 
  * Cek kembali file `.env` Anda. Pastikan username, password, host, port, dan nama database sudah benar.
  * Jika menggunakan PostgreSQL lokal, pastikan service PostgreSQL sudah berjalan (di Windows lewat `services.msc` -> cari `postgresql` -> klik `Start`).

### 2. Error: Gagal saat `npx prisma db seed`
* **Penyebab**: Terjadi bentrok data (data unik sudah ada) atau module `tsx` belum terinstal.
* **Solusi**:
  * Pastikan Anda sudah menjalankan `npm install` dengan lengkap agar module `tsx` terinstal.
  * Jika database sudah memiliki data sebelumnya, pastikan data yang di-seed tidak bentrok, atau Anda dapat mereset database dengan `npx prisma db push --force-reset` lalu seed kembali (peringatan: ini menghapus data lama).

### 3. Masalah dengan Versi Node.js
* **Penyebab**: Next.js 16 membutuhkan versi Node.js yang modern.
* **Solusi**: Jika Anda mendapat error kompilasi, perbarui Node.js Anda ke versi LTS terbaru (v20+).
