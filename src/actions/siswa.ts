"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createSiswa(data: {
  nis: string;
  nama: string;
  kelas: string;
  jenis_kelamin: string;
}) {
  try {
    if (!data.nis || !data.nama || !data.kelas || !data.jenis_kelamin) {
      return { error: "Semua field harus diisi!" };
    }

    // Cek apakah NIS sudah terdaftar
    const existingSiswa = await prisma.siswa.findUnique({
      where: { nis: data.nis },
    });

    if (existingSiswa) {
      return { error: "NIS sudah terdaftar!" };
    }

    const hashedPassword = await bcrypt.hash("123", 10);

    // Gunakan Prisma Transaction untuk menjamin ACID
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: data.nis,
          password: hashedPassword,
          role: "SISWA",
        },
      });

      await tx.siswa.create({
        data: {
          userId: user.id,
          nis: data.nis,
          nama: data.nama,
          kelas: data.kelas,
          jenis_kelamin: data.jenis_kelamin,
        },
      });
    });

    revalidatePath("/dashboard/bk/data-siswa");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating siswa:", error);
    return { error: error.message || "Gagal menambahkan data siswa." };
  }
}

export async function updateSiswa(
  id: string,
  data: {
    nis: string;
    nama: string;
    kelas: string;
    jenis_kelamin: string;
  }
) {
  try {
    if (!data.nis || !data.nama || !data.kelas || !data.jenis_kelamin) {
      return { error: "Semua field harus diisi!" };
    }

    // Cek apakah NIS baru bentrok dengan siswa lain
    const existingSiswa = await prisma.siswa.findFirst({
      where: {
        nis: data.nis,
        id: { not: id },
      },
    });

    if (existingSiswa) {
      return { error: "NIS sudah digunakan oleh siswa lain!" };
    }

    const currentSiswa = await prisma.siswa.findUnique({
      where: { id },
    });

    if (!currentSiswa) {
      return { error: "Data siswa tidak ditemukan!" };
    }

    // Gunakan transaction untuk mengubah siswa dan username user-nya
    await prisma.$transaction(async (tx) => {
      await tx.siswa.update({
        where: { id },
        data: {
          nis: data.nis,
          nama: data.nama,
          kelas: data.kelas,
          jenis_kelamin: data.jenis_kelamin,
        },
      });

      await tx.user.update({
        where: { id: currentSiswa.userId },
        data: {
          username: data.nis,
        },
      });
    });

    revalidatePath("/dashboard/bk/data-siswa");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating siswa:", error);
    return { error: error.message || "Gagal mengubah data siswa." };
  }
}

export async function deleteSiswa(id: string) {
  try {
    const siswa = await prisma.siswa.findUnique({
      where: { id },
    });

    if (!siswa) {
      return { error: "Data siswa tidak ditemukan!" };
    }

    // Menghapus user otomatis akan menghapus siswa karena Cascade Delete
    await prisma.user.delete({
      where: { id: siswa.userId },
    });

    revalidatePath("/dashboard/bk/data-siswa");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting siswa:", error);
    return { error: error.message || "Gagal menghapus data siswa." };
  }
}
