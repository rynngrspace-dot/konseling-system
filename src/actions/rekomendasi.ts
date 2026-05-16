"use server";

import { calculateDecisionTree } from "@/lib/algorithms/decision-tree";
import { calculateNaiveBayes } from "@/lib/algorithms/naive-bayes";

/**
 * Server Action: generateRekomendasi
 * Berfungsi sebagai jembatan (API) antara UI Client dan Algoritma Server/Database.
 */
export async function generateRekomendasi(studentId: string) {
  // 1. TODO: Tarik data siswa mentah dari Database (Prisma) menggunakan studentId
  // const studentRawData = await prisma.student.findUnique({ ... })
  
  // Placeholder mock data simulasi database:
  const mockStudentData = {
    matematika: 92,
    ipa: 89,
    bahasaIndonesia: 85,
    bahasaInggris: 86,
    ips: 80,
    minatUtama: "Teknologi",
    bakatDominan: "Logika Analitik",
  };

  // 2. Kalkulasi algoritma di sisi server secara rahasia
  const treeResult = calculateDecisionTree(mockStudentData);
  const bayesResult = calculateNaiveBayes(mockStudentData);

  // 3. Menentukan Rekomendasi Akhir berdasarkan konsensus kedua algoritma
  // TODO: Implementasi logika penengah (ensemble/voting)
  const finalRecommendation = treeResult.saranJurusan === bayesResult.saranJurusan 
    ? treeResult.saranJurusan 
    : "Membutuhkan Validasi Konselor";

  // 4. Mengembalikan hasil ke komponen Client (UI)
  return {
    success: true,
    data: {
      decisionTree: treeResult,
      naiveBayes: bayesResult,
      final: finalRecommendation,
      studentRaw: mockStudentData
    }
  };
}
