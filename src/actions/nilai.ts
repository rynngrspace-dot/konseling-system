"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertNilai(
  siswaId: string,
  semester: number,
  scores: Record<string, number | null>
) {
  try {
    if (!siswaId || !semester) {
      return { error: "ID Siswa dan Semester harus ditentukan!" };
    }

    // Jalankan transaksi atomik untuk memastikan seluruh nilai tersimpan atau gagal bersama
    await prisma.$transaction(async (tx) => {
      for (const [subjectKey, subjectValue] of Object.entries(scores)) {
        // Cari apakah nilai mapel untuk siswa dan semester ini sudah ada
        const existing = await tx.nilaiAkademik.findFirst({
          where: {
            siswaId,
            semester,
            mata_pelajaran: subjectKey,
          },
        });

        if (subjectValue === null) {
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
              data: { nilai: subjectValue },
            });
          } else {
            // Create jika data belum ada
            await tx.nilaiAkademik.create({
              data: {
                siswaId,
                semester,
                mata_pelajaran: subjectKey,
                nilai: subjectValue,
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

export async function bulkUpsertNilai(
  updates: {
    siswaId: string;
    semester: number;
    scores: Record<string, number | null>;
  }[]
) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        const { siswaId, semester, scores } = update;

        for (const [subjectKey, subjectValue] of Object.entries(scores)) {
          const existing = await tx.nilaiAkademik.findFirst({
            where: {
              siswaId,
              semester,
              mata_pelajaran: subjectKey,
            },
          });

          if (subjectValue === null) {
            if (existing) {
              await tx.nilaiAkademik.delete({
                where: { id: existing.id },
              });
            }
          } else {
            if (existing) {
              await tx.nilaiAkademik.update({
                where: { id: existing.id },
                data: { nilai: subjectValue },
              });
            } else {
              await tx.nilaiAkademik.create({
                data: {
                  siswaId,
                  semester,
                  mata_pelajaran: subjectKey,
                  nilai: subjectValue,
                },
              });
            }
          }
        }
      }
    });

    revalidatePath("/dashboard/bk/nilai-akademik");
    return { success: true };
  } catch (error: any) {
    console.error("Error bulk upserting nilai:", error);
    return { error: error.message || "Gagal menyimpan nilai massal." };
  }
}
