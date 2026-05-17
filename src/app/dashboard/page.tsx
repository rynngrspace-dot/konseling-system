import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Redirect berdasarkan role pengguna
  // ts-ignore jika typescript belum mendeteksi tambahan field 'role' di session.user
  const role = (session.user as any)?.role;

  if (role === "GURU_BK") {
    redirect("/dashboard/bk");
  } else if (role === "SISWA") {
    redirect("/dashboard/siswa");
  } else {
    // Default fallback jika admin atau role belum terdaftar
    redirect("/dashboard/bk");
  }
}
