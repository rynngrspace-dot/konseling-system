"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { calculateDecisionTree } from "@/lib/algorithms/decision-tree";
import { calculateNaiveBayes } from "@/lib/algorithms/naive-bayes";

export async function calculateRecommendation(siswaId: string) {
  try {
    // 1. Fetch Student Grades & Interests
    const student = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        nilaiAkademik: true,
        minatBakat: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!student) {
      return { error: "Siswa tidak ditemukan." };
    }

    const hasGrades = student.nilaiAkademik.length > 0;
    const hasMinatBakat = student.minatBakat.length > 0;

    if (!hasGrades || !hasMinatBakat) {
      return {
        success: false,
        incomplete: true,
        studentData: {
          id: student.id,
          nama: student.nama,
          nis: student.nis,
          kelas: student.kelas,
          gender: student.jenis_kelamin,
          hasGrades,
          hasMinatBakat
        }
      };
    }

    const mb = student.minatBakat[0];
    const minat = mb.minat;
    const bakat = mb.bakat;

    // 2. Calculate Category Averages
    const getSubjectAverage = (names: string[]) => {
      const match = student.nilaiAkademik.filter(n => names.includes(n.mata_pelajaran));
      if (match.length === 0) return 0;
      return match.reduce((a, b) => a + b.nilai, 0) / match.length;
    };

    const stemAvg = Number(getSubjectAverage(["Matematika", "IPA", "Informatika"]).toFixed(1));
    const bahasaAvg = Number(getSubjectAverage(["Indonesia", "Inggris", "Sunda"]).toFixed(1));
    const sosialAvg = Number(getSubjectAverage(["IPS", "Pendidikan Pancasila", "PAI"]).toFixed(1));
    const vokasiAvg = Number(getSubjectAverage(["Penjaskes", "Prakarya"]).toFixed(1));

    const totalAvg = Number((student.nilaiAkademik.reduce((a, b) => a + b.nilai, 0) / student.nilaiAkademik.length).toFixed(1));

    const infoMatch = student.nilaiAkademik.find(n => n.mata_pelajaran === "Informatika");
    const infoGrade = infoMatch ? infoMatch.nilai : 0;

    // Call modular algorithms
    const dtResult = calculateDecisionTree({
      minat,
      bakat,
      stemAvg,
      bahasaAvg,
      sosialAvg,
      vokasiAvg,
      totalAvg,
      infoGrade
    });

    const nbResult = calculateNaiveBayes({
      minat,
      bakat,
      stemAvg,
      bahasaAvg,
      sosialAvg,
      vokasiAvg,
      totalAvg,
      infoGrade
    });

    // ==========================================
    // 🏆 FINAL ENSEMBLE DECISION
    // ==========================================
    let finalPrediction = "";
    let finalConfidence = 0;
    let reason = "";

    // If both agree, high confidence
    if (dtResult.prediction === nbResult.prediction) {
      finalPrediction = dtResult.prediction;
      finalConfidence = Math.max(dtResult.confidence, nbResult.confidence);
      reason = `Kedua algoritma (Decision Tree & Naive Bayes) sepakat merekomendasikan **${finalPrediction}** dengan keyakinan kuat karena didukung oleh minat dominan siswa di bidang **${minat}**, bakat dalam **${bakat}**, serta rata-rata nilai akademik ${totalAvg} yang sangat menunjang.`;
    } else {
      // If disagree, prefer Decision Tree because of strict psychological interest/talent splits
      finalPrediction = dtResult.prediction;
      finalConfidence = Math.round((dtResult.confidence + nbResult.confidence) / 2);
      reason = `Algoritma merekomendasikan **${finalPrediction}** (berdasarkan model pohon keputusan minat ${minat} dan bakat ${bakat}) dengan pertimbangan sekunder Naive Bayes memprediksi **${nbResult.prediction}** (berdasarkan distribusi nilai sains ${stemAvg} vs sosial ${sosialAvg}).`;
    }

    // Determine the smart alternative prediction (Peringkat ke-2 yang berbeda dari rekomendasi utama)
    let alternativePrediction = "";
    let alternativeConfidence = 0;

    if (nbResult.probabilities[0].className !== finalPrediction) {
      alternativePrediction = nbResult.probabilities[0].className;
      alternativeConfidence = nbResult.probabilities[0].prob;
    } else {
      alternativePrediction = nbResult.probabilities[1]?.className || "";
      alternativeConfidence = nbResult.probabilities[1]?.prob || 0;
    }

    return {
      success: true,
      studentData: {
        id: student.id,
        nama: student.nama,
        nis: student.nis,
        kelas: student.kelas,
        gender: student.jenis_kelamin,
        minat,
        bakat,
        stemAvg,
        bahasaAvg,
        sosialAvg,
        vokasiAvg,
        totalAvg
      },
      decisionTree: {
        prediction: dtResult.prediction,
        confidence: `${dtResult.confidence}%`,
        nodes: dtResult.nodes
      },
      naiveBayes: {
        prediction: nbResult.prediction,
        confidence: `${nbResult.confidence}%`,
        probabilities: nbResult.probabilities.slice(0, 4) // top 4 classes
      },
      final: {
        prediction: finalPrediction,
        confidence: `${finalConfidence}%`,
        alternativePrediction,
        alternativeConfidence: `${alternativeConfidence}%`,
        reason
      }
    };

  } catch (error: any) {
    console.error("Gagal melakukan kalkulasi AI:", error);
    return { error: `Terjadi kesalahan saat memproses kalkulasi: ${error.message}` };
  }
}

export async function saveRecommendation(payload: {
  siswaId: string;
  hasilDecisionTree: string;
  hasilNaiveBayes: string;
  rekomendasiAkhir: string;
  detailPersentase: any;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU_BK") {
      return { error: "Akses ditolak. Hanya Guru BK yang berwenang menyimpan rekomendasi." };
    }

    // Get current Guru BK record
    const guru = await prisma.guruBK.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      return { error: "Profil Guru BK tidak ditemukan." };
    }

    // Transactional Upsert: One student has at most ONE recommendation report
    const existing = await prisma.rekomendasiJurusan.findFirst({
      where: { siswaId: payload.siswaId }
    });

    if (existing) {
      await prisma.rekomendasiJurusan.update({
        where: { id: existing.id },
        data: {
          guruId: guru.id,
          hasil_decision_tree: payload.hasilDecisionTree,
          hasil_naive_bayes: payload.hasilNaiveBayes,
          rekomendasi_akhir: payload.rekomendasiAkhir,
          detail_persentase: payload.detailPersentase,
          tanggal: new Date()
        }
      });
    } else {
      await prisma.rekomendasiJurusan.create({
        data: {
          siswaId: payload.siswaId,
          guruId: guru.id,
          hasil_decision_tree: payload.hasilDecisionTree,
          hasil_naive_bayes: payload.hasilNaiveBayes,
          rekomendasi_akhir: payload.rekomendasiAkhir,
          detail_persentase: payload.detailPersentase
        }
      });
    }

    revalidatePath("/dashboard/bk/rekomendasi-jurusan");
    return { success: true };

  } catch (error: any) {
    console.error("Gagal menyimpan rekomendasi:", error);
    return { error: `Gagal menyimpan data ke database: ${error.message}` };
  }
}

export async function deleteRecommendation(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "GURU_BK") {
      return { error: "Akses ditolak. Hanya Guru BK yang berwenang menghapus rekomendasi." };
    }

    await prisma.rekomendasiJurusan.delete({
      where: { id }
    });

    revalidatePath("/dashboard/bk/rekomendasi-jurusan");
    return { success: true };

  } catch (error: any) {
    console.error("Gagal menghapus rekomendasi:", error);
    return { error: `Gagal menghapus data dari database: ${error.message}` };
  }
}
