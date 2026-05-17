import prisma from "@/lib/prisma";
import StudentClient from "./student-client";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    kelas?: string;
    page?: string;
  }>;
}

export default async function DataSiswaPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const kelas = resolvedParams.kelas || "";
  const page = parseInt(resolvedParams.page || "1", 10);
  const pageSize = 10; // 10 data per halaman

  const skip = (page - 1) * pageSize;

  // Bangun query where dinamis untuk Prisma
  const where: any = {};

  if (kelas) {
    where.kelas = kelas;
  }

  if (q) {
    where.OR = [
      { nis: { contains: q, mode: "insensitive" } },
      { nama: { contains: q, mode: "insensitive" } },
    ];
  }

  // Tarik data siswa real dari Supabase via Prisma
  const [students, totalCount] = await prisma.$transaction([
    prisma.siswa.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        nama: "asc",
      },
      select: {
        id: true,
        nis: true,
        nama: true,
        kelas: true,
        jenis_kelamin: true,
      },
    }),
    prisma.siswa.count({ where }),
  ]);

  return (
    <StudentClient
      students={students}
      totalCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      initialQuery={q}
      initialKelas={kelas}
    />
  );
}
