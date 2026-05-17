import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  return (
    <DashboardLayout
      session={session}
      roleLabel="Siswa"
      roleBadgeColor="emerald"
      role="siswa"
    >
      {children}
    </DashboardLayout>
  );
}
