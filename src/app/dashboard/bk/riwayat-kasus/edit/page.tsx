import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CaseConsole } from "../create/console";

export const dynamic = "force-dynamic";

export default async function EditCasePage({
  searchParams,
}: {
  searchParams: Promise<{ kasusId?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "GURU_BK") {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const kasusId = resolvedParams.kasusId || "";

  let caseToEdit = null;
  if (kasusId) {
    caseToEdit = await prisma.riwayatKasus.findUnique({
      where: { id: kasusId },
    });
  }

  // Fetch all students to support dropdown selection
  const allStudents = await prisma.siswa.findMany({
    orderBy: {
      nama: "asc",
    },
    select: {
      id: true,
      nama: true,
      nis: true,
      kelas: true,
    },
  });

  return (
    <CaseConsole
      allStudents={allStudents}
      initialCase={caseToEdit}
      initialCaseId={kasusId}
      activeUserId={session.user.id}
    />
  );
}
