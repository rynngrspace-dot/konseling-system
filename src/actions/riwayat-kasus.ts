"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { KategoriKasus, StatusKasus } from "@prisma/client";

export async function createRiwayatKasus(
  userId: string,
  data: {
    siswaId: string;
    kategori: KategoriKasus;
    jenis_kasus: string;
    keterangan: string;
    status: StatusKasus;
    tanggal?: string;
  }
) {
  try {
    if (!userId) {
      return { error: "Akses ditolak! User ID tidak valid." };
    }

    if (!data.siswaId) {
      return { error: "Silakan pilih siswa terlebih dahulu!" };
    }

    if (!data.jenis_kasus.trim()) {
      return { error: "Jenis kasus / judul singkat wajib diisi!" };
    }

    if (!data.keterangan.trim()) {
      return { error: "Keterangan kasus wajib diisi!" };
    }

    // Cari data Guru BK berdasarkan User ID aktif
    const guru = await prisma.guruBK.findUnique({
      where: { userId },
    });

    if (!guru) {
      return { error: "Data Guru BK pendamping tidak ditemukan!" };
    }

    const dateVal = data.tanggal ? new Date(data.tanggal) : new Date();

    await prisma.riwayatKasus.create({
      data: {
        siswaId: data.siswaId,
        guruId: guru.id,
        kategori: data.kategori,
        jenis_kasus: data.jenis_kasus.trim(),
        keterangan: data.keterangan.trim(),
        status: data.status,
        tanggal: dateVal,
      },
    });

    revalidatePath("/dashboard/bk/riwayat-kasus");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating riwayat kasus:", error);
    return { error: error.message || "Gagal membuat catatan kasus." };
  }
}

export async function updateRiwayatKasus(
  id: string,
  data: {
    siswaId: string;
    kategori: KategoriKasus;
    jenis_kasus: string;
    keterangan: string;
    status: StatusKasus;
    tanggal?: string;
  }
) {
  try {
    if (!id) {
      return { error: "ID kasus tidak valid!" };
    }

    if (!data.siswaId) {
      return { error: "Silakan pilih siswa terlebih dahulu!" };
    }

    if (!data.jenis_kasus.trim()) {
      return { error: "Jenis kasus / judul singkat wajib diisi!" };
    }

    if (!data.keterangan.trim()) {
      return { error: "Keterangan kasus wajib diisi!" };
    }

    const dateVal = data.tanggal ? new Date(data.tanggal) : new Date();

    await prisma.riwayatKasus.update({
      where: { id },
      data: {
        siswaId: data.siswaId,
        kategori: data.kategori,
        jenis_kasus: data.jenis_kasus.trim(),
        keterangan: data.keterangan.trim(),
        status: data.status,
        tanggal: dateVal,
      },
    });

    revalidatePath("/dashboard/bk/riwayat-kasus");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating riwayat kasus:", error);
    return { error: error.message || "Gagal memperbarui catatan kasus." };
  }
}

export async function deleteRiwayatKasus(id: string) {
  try {
    if (!id) {
      return { error: "ID kasus tidak valid!" };
    }

    await prisma.riwayatKasus.delete({
      where: { id },
    });

    revalidatePath("/dashboard/bk/riwayat-kasus");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting riwayat kasus:", error);
    return { error: error.message || "Gagal menghapus catatan kasus." };
  }
}
