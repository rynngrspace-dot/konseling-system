import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CaseConsole } from "./console";

export default async function CreateCasePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "GURU_BK") {
    redirect("/login");
  }

  // Fetch all students for the dropdown
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
      initialCase={null}
      initialCaseId=""
      activeUserId={session.user.id}
    />
  );
}
