import prisma from "@/lib/prisma";
import { NilaiConsole } from "../create/console";

// Dynamic routing config
export const dynamic = "force-dynamic";

export default async function EditNilaiPage({
  searchParams,
}: {
  searchParams: Promise<{ siswaId?: string; semester?: string }>;
}) {
  const resolvedParams = await searchParams;
  const siswaId = resolvedParams.siswaId || "";
  const semesterStr = resolvedParams.semester || "";
  const initialSemester = semesterStr ? parseInt(semesterStr, 10) : 1;

  // Fetch all students to support dropdown selection
  const allStudents = await prisma.siswa.findMany({
    include: {
      nilaiAkademik: true,
    },
    orderBy: {
      nama: "asc",
    },
  });

  return (
    <NilaiConsole
      allStudents={allStudents as any}
      initialSiswaId={siswaId}
      initialSemester={initialSemester}
    />
  );
}
