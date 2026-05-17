import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { LaporanClient } from "./laporan-client";

export const dynamic = "force-dynamic";

export default async function LaporanBKPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "GURU_BK") {
    redirect("/login");
  }

  // Load all cases with associated student and guru information
  const allCases = await prisma.riwayatKasus.findMany({
    orderBy: {
      tanggal: "desc",
    },
    include: {
      siswa: true,
      guruBk: true,
    },
  });

  // Serialize dates to prevent Next.js server-to-client serialization errors
  const serializedCases = allCases.map(item => ({
    id: item.id,
    isoDate: item.tanggal.toISOString().split("T")[0],
    date: item.tanggal.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    name: item.siswa.nama,
    type: item.jenis_kasus,
    kategori: item.kategori,
    desc: item.keterangan,
    status: item.status,
  }));

  return (
    <LaporanClient initialReports={serializedCases} />
  );
}
