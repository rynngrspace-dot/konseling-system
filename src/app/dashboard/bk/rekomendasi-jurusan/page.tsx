import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RekomendasiClient } from "./rekomendasi-client";

export const dynamic = "force-dynamic";

export default async function RekomendasiPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "GURU_BK") {
    redirect("/login");
  }

  // 1. Fetch all recommendations from database
  const recommendationsRaw = await prisma.rekomendasiJurusan.findMany({
    include: {
      siswa: {
        select: {
          nama: true,
          nis: true,
          kelas: true
        }
      }
    },
    orderBy: {
      tanggal: "desc"
    }
  });

  // Map to matching client type structure
  const recommendations = recommendationsRaw.map(r => ({
    id: r.id,
    siswaId: r.siswaId,
    siswa: {
      nama: r.siswa.nama,
      nis: r.siswa.nis,
      kelas: r.siswa.kelas
    },
    hasil_decision_tree: r.hasil_decision_tree,
    hasil_naive_bayes: r.hasil_naive_bayes,
    rekomendasi_akhir: r.rekomendasi_akhir,
    detail_persentase: r.detail_persentase,
    tanggal: r.tanggal
  }));

  // 2. Fetch all students including their grades & interest/talent to support dropdown selection
  const allStudents = await prisma.siswa.findMany({
    include: {
      minatBakat: {
        select: {
          minat: true,
          bakat: true
        }
      },
      nilaiAkademik: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      nama: "asc"
    }
  });

  return (
    <RekomendasiClient
      recommendations={recommendations}
      allStudents={allStudents as any}
    />
  );
}
