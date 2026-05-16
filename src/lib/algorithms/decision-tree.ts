/**
 * Modul Algoritma Decision Tree
 * Digunakan untuk klasifikasi rekomendasi jurusan berdasarkan pohon keputusan.
 */

export interface StudentFeatures {
  matematika: number;
  ipa: number;
  bahasaIndonesia: number;
  bahasaInggris: number;
  ips: number;
  minatUtama: string;
  bakatDominan: string;
}

export interface DecisionTreeResult {
  saranJurusan: string;
  akurasi: number;
  faktorPenentu: {
    atribut: string;
    nilai: string;
  }[];
}

export function calculateDecisionTree(data: StudentFeatures): DecisionTreeResult {
  // TODO: Implementasi logika Information Gain, Entropy, dan Node Splitting.
  // Saat ini mengembalikan mock data sebagai placeholder arsitektur.
  
  return {
    saranJurusan: "SMA - MIPA",
    akurasi: 92,
    faktorPenentu: [
      { atribut: "Nilai Tertinggi", nilai: `Matematika (${data.matematika})` },
      { atribut: "Minat Utama", nilai: data.minatUtama },
      { atribut: "Bakat Dominan", nilai: data.bakatDominan }
    ]
  };
}
