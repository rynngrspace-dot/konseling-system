import prisma from "@/lib/prisma";
import { MinatBakatConsole } from "../create/console";

// Dynamic routing config
export const dynamic = "force-dynamic";

export default async function EditMinatBakatPage({
  searchParams,
}: {
  searchParams: Promise<{ siswaId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const siswaId = resolvedParams.siswaId || "";

  // Fetch all students to support dropdown selection
  const allStudents = await prisma.siswa.findMany({
    include: {
      minatBakat: true,
    },
    orderBy: {
      nama: "asc",
    },
  });

  return (
    <MinatBakatConsole
      allStudents={allStudents as any}
      initialSiswaId={siswaId}
    />
  );
}
