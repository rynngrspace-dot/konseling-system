import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default async function BKLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "GURU_BK") {
    redirect("/login");
  }

  return (
    <DashboardLayout
      session={session}
      roleLabel="Admin BK"
      roleBadgeColor="blue"
      role="bk"
    >
      {children}
    </DashboardLayout>
  );
}
