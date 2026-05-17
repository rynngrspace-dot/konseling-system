import prisma from "@/lib/prisma";
import { StudentConsole } from "../create/console";

// Dynamic routing config
export const dynamic = "force-dynamic";

export default async function EditStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ siswaId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const siswaId = resolvedParams.siswaId || "";

  let studentToEdit = null;
  if (siswaId) {
    studentToEdit = await prisma.siswa.findUnique({
      where: { id: siswaId },
    });
  }

  return (
    <StudentConsole
      initialStudent={studentToEdit as any}
      initialSiswaId={siswaId}
    />
  );
}
