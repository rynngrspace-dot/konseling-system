import prisma from "@/lib/prisma";
import { NilaiClient } from "./nilai-client";

// Dynamic routing config
export const dynamic = "force-dynamic";

export default async function NilaiAkademikPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kelas?: string; semester?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const kelas = resolvedParams.kelas || "";
  const semester = parseInt(resolvedParams.semester || "1", 10);
  const page = parseInt(resolvedParams.page || "1", 10);
  const pageSize = 10;

  // Query condition setup
  const where: any = {};

  if (q) {
    where.OR = [
      { nama: { contains: q, mode: "insensitive" } },
      { nis: { contains: q, mode: "insensitive" } },
    ];
  }

  if (kelas && kelas !== "all") {
    where.kelas = kelas;
  }

  // Fetch total students matching criteria for pagination
  const totalCount = await prisma.siswa.count({ where });

  // Fetch students with their corresponding NilaiAkademik records
  const students = await prisma.siswa.findMany({
    where,
    include: {
      nilaiAkademik: true,
    },
    orderBy: {
      nama: "asc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // Fetch all students to support full dropdown selection in the input grades modal
  const allStudents = await prisma.siswa.findMany({
    include: {
      nilaiAkademik: true,
    },
    orderBy: {
      nama: "asc",
    },
  });

  return (
    <NilaiClient
      students={students as any}
      allStudents={allStudents as any}
      totalCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      initialQuery={q}
      initialKelas={kelas}
      initialSemester={semester}
    />
  );
}
