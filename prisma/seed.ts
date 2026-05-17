import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

async function main() {
  console.log('🌱 Memulai proses seeding...');

  // Hapus data lama (opsional, hati-hati jika di production)
  // await prisma.siswa.deleteMany();
  // await prisma.guruBK.deleteMany();
  // await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123', 10);

  // 1. Akun Guru BK (Admin)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin@bk.com' },
    update: {},
    create: {
      username: 'admin@bk.com',
      password: passwordHash,
      role: Role.GURU_BK,
    },
  });

  const adminGuru = await prisma.guruBK.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      nip: '198001012005011003',
      nama: 'Bapak Admin BK',
    },
  });
  console.log(`✅ Dibuat: Guru BK (${adminUser.username})`);

  // 2. Akun Siswa
  const siswaUser = await prisma.user.upsert({
    where: { username: '101010' },
    update: {},
    create: {
      username: '101010',
      password: passwordHash,
      role: Role.SISWA,
    },
  });

  const siswaProfile = await prisma.siswa.upsert({
    where: { userId: siswaUser.id },
    update: {},
    create: {
      userId: siswaUser.id,
      nis: '101010',
      nama: 'Siswa Percobaan',
      kelas: 'IX-A',
      jenis_kelamin: 'Laki-laki',
    },
  });
  console.log(`✅ Dibuat: Siswa (${siswaUser.username})`);

  console.log('🎉 Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
