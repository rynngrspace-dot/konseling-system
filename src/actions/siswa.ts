"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createSiswa(data: {
  nis: string;
  nama: string;
  kelas?: string | null;
  jenis_kelamin: string;
}) {
  try {
    if (!data.nis || !data.nama || !data.jenis_kelamin) {
      return { error: "NIS, Nama, dan Jenis Kelamin wajib diisi!" };
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
          kelas: data.kelas || null,
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
    kelas?: string | null;
    jenis_kelamin: string;
  }
) {
  try {
    if (!data.nis || !data.nama || !data.jenis_kelamin) {
      return { error: "NIS, Nama, dan Jenis Kelamin wajib diisi!" };
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
          kelas: data.kelas || null,
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

export async function bulkCreateSiswa(data: {
  kelas?: string | null;
  students: { nis: string; nama: string; jenis_kelamin: string; kelas?: string | null }[];
}) {
  try {
    // Filter baris yang valid (NIS & Nama tidak boleh kosong)
    const validStudents = data.students.filter(
      (s) => s.nis.trim() !== "" && s.nama.trim() !== ""
    );

    if (validStudents.length === 0) {
      return { error: "Tidak ada data siswa valid untuk disimpan!" };
    }

    // Ambil semua NIS yang diinput untuk pengecekan duplikasi database
    const inputNises = validStudents.map((s) => s.nis.trim());

    // Cek apakah ada NIS yang duplikat di dalam input itu sendiri
    const duplicateInInput = inputNises.filter(
      (nis, index) => inputNises.indexOf(nis) !== index
    );
    if (duplicateInInput.length > 0) {
      return { error: `Terdapat NIS duplikat di dalam input: ${Array.from(new Set(duplicateInInput)).join(", ")}` };
    }

    // Cek apakah ada NIS yang sudah terdaftar di database
    const existingStudents = await prisma.siswa.findMany({
      where: {
        nis: { in: inputNises },
      },
      select: { nis: true, nama: true },
    });

    if (existingStudents.length > 0) {
      const duplicateDetails = existingStudents
        .map((s) => `${s.nama} (${s.nis})`)
        .join(", ");
      return {
        error: `Gagal menyimpan! Siswa berikut dengan NIS tersebut sudah terdaftar di database: ${duplicateDetails}`,
      };
    }

    const hashedPassword = await bcrypt.hash("123", 10);

    // Jalankan transaksi database ACID
    await prisma.$transaction(async (tx) => {
      for (const student of validStudents) {
        const user = await tx.user.create({
          data: {
            username: student.nis.trim(),
            password: hashedPassword,
            role: "SISWA",
          },
        });

        await tx.siswa.create({
          data: {
            userId: user.id,
            nis: student.nis.trim(),
            nama: student.nama.trim(),
            kelas: student.kelas || data.kelas || null,
            jenis_kelamin: student.jenis_kelamin,
          },
        });
      }
    });

    revalidatePath("/dashboard/bk/data-siswa");
    return { success: true, count: validStudents.length };
  } catch (error: any) {
    console.error("Error bulk creating siswa:", error);
    return { error: error.message || "Gagal melakukan registrasi massal siswa." };
  }
}
