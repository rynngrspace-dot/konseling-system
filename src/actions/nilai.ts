"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertNilai(
  siswaId: string,
  semester: number,
  scores: {
    matematika: number | null;
    indonesian: number | null;
    english: number | null;
    science: number | null;
    social: number | null;
  }
) {
  try {
    if (!siswaId || !semester) {
      return { error: "ID Siswa dan Semester harus ditentukan!" };
    }

    const subjectsMap = [
      { key: "Matematika", value: scores.matematika },
      { key: "Bahasa Indonesia", value: scores.indonesian },
      { key: "Bahasa Inggris", value: scores.english },
      { key: "IPA", value: scores.science },
      { key: "IPS", value: scores.social },
    ];

    // Jalankan transaksi atomik untuk memastikan seluruh nilai tersimpan atau gagal bersama
    await prisma.$transaction(async (tx) => {
      for (const subj of subjectsMap) {
        // Cari apakah nilai mapel untuk siswa dan semester ini sudah ada
        const existing = await tx.nilaiAkademik.findFirst({
          where: {
            siswaId,
            semester,
            mata_pelajaran: subj.key,
          },
        });

        if (subj.value === null) {
          // Jika nilai dikosongkan (null) dan record-nya ada di DB, hapus dari DB
          if (existing) {
            await tx.nilaiAkademik.delete({
              where: { id: existing.id },
            });
          }
        } else {
          if (existing) {
            // Update jika data sudah ada
            await tx.nilaiAkademik.update({
              where: { id: existing.id },
              data: { nilai: subj.value },
            });
          } else {
            // Create jika data belum ada
            await tx.nilaiAkademik.create({
              data: {
                siswaId,
                semester,
                mata_pelajaran: subj.key,
                nilai: subj.value,
              },
            });
          }
        }
      }
    });

    revalidatePath("/dashboard/bk/nilai-akademik");
    return { success: true };
  } catch (error: any) {
    console.error("Error upserting nilai:", error);
    return { error: error.message || "Gagal menyimpan nilai akademik." };
  }
}

export async function deleteNilai(siswaId: string, semester: number) {
  try {
    if (!siswaId || !semester) {
      return { error: "ID Siswa dan Semester harus ditentukan!" };
    }

    await prisma.nilaiAkademik.deleteMany({
      where: {
        siswaId,
        semester,
      },
    });

    revalidatePath("/dashboard/bk/nilai-akademik");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting nilai:", error);
    return { error: error.message || "Gagal menghapus nilai akademik." };
  }
}
