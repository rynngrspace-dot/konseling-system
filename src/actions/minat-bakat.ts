"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertMinatBakat(
  siswaId: string,
  minat: string,
  bakat: string,
  detailTes: {
    dominan: string;
    mbti: string;
  }
) {
  try {
    if (!siswaId) {
      return { error: "ID Siswa harus ditentukan!" };
    }

    if (!minat.trim() || !bakat.trim()) {
      return { error: "Minat dan Bakat harus diisi!" };
    }

    // Cari apakah rekor minat bakat siswa ini sudah ada
    const existing = await prisma.minatBakat.findFirst({
      where: {
        siswaId,
      },
    });

    if (existing) {
      // Update jika data sudah ada
      await prisma.minatBakat.update({
        where: { id: existing.id },
        data: {
          minat,
          bakat,
          detailTes: detailTes as any,
        },
      });
    } else {
      // Create jika data belum ada
      await prisma.minatBakat.create({
        data: {
          siswaId,
          minat,
          bakat,
          detailTes: detailTes as any,
        },
      });
    }

    revalidatePath("/dashboard/bk/minat-bakat");
    return { success: true };
  } catch (error: any) {
    console.error("Error upserting minat bakat:", error);
    return { error: error.message || "Gagal menyimpan data minat dan bakat." };
  }
}

export async function deleteMinatBakat(id: string) {
  try {
    if (!id) {
      return { error: "ID Minat Bakat harus ditentukan!" };
    }

    await prisma.minatBakat.delete({
      where: {
        id,
      },
    });

    revalidatePath("/dashboard/bk/minat-bakat");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting minat bakat:", error);
    return { error: error.message || "Gagal menghapus data minat dan bakat." };
  }
}
