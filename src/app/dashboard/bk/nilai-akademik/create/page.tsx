import prisma from "@/lib/prisma";
import { NilaiConsole } from "./console";

// Dynamic routing config
export const dynamic = "force-dynamic";

export default async function CreateNilaiPage() {
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
      initialSiswaId=""
      initialSemester={1}
    />
  );
}
