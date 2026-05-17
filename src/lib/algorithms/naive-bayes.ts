/**
 * Modul Algoritma Naive Bayes
 * Digunakan untuk klasifikasi probabilitas rekomendasi jurusan berdasarkan fitur independen.
 */

import { StudentFeatures } from "./decision-tree";

export interface NaiveBayesProbability {
  className: string;
  prob: number;
}

export interface NaiveBayesResult {
  prediction: string;
  confidence: number;
  probabilities: NaiveBayesProbability[];
}

export interface ProfileSample {
  stemRange: "tinggi" | "sedang" | "rendah";
  sosialRange: "tinggi" | "sedang" | "rendah";
  bahasaRange: "tinggi" | "sedang" | "rendah";
  minat: string;
  bakat: string;
  targetClass: string;
}

// Target classes - Representing all major SMA and SMK options in Indonesia
export const TARGET_CLASSES = [
  "SMA - MIPA (Matematika & IPA)",
  "SMA - IPS (Ilmu Pengetahuan Sosial)",
  "SMA - Bahasa & Budaya",
  "SMK - Rekayasa Perangkat Lunak (RPL)",
  "SMK - Teknik Komputer & Jaringan (TKJ)",
  "SMK - Multimedia & DKV",
  "SMK - Akuntansi & Keuangan Lembaga",
  "SMK - Otomatisasi & Perkantoran",
  "SMK - Bisnis & Pemasaran",
  "SMK - Teknik Otomotif",
  "SMK - Teknik Pemesinan",
  "SMK - Teknik Instalasi Tenaga Listrik",
  "SMK - Tata Boga (Kuliner)",
  "SMK - Tata Busana (Fashion)",
  "SMK - Perhotelan & Pariwisata",
  "SMK - Farmasi & Keperawatan",
  "SMK - Agribisnis & Pertanian"
];

// Predefined training set profiles for Naive Bayes dynamic likelihood calculations
export const TRAINING_SAMPLES: ProfileSample[] = [
  // SMA - MIPA (Matematika & IPA)
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "sedang", minat: "Sains & Teknologi", bakat: "Logika Matematika Kalkulus Aljabar Kimia Fisika Biologi Riset", targetClass: "SMA - MIPA (Matematika & IPA)" },
  { stemRange: "tinggi", sosialRange: "rendah", bahasaRange: "tinggi", minat: "Sains & Teknologi", bakat: "Analisis Sains Laboratorium Eksperimen", targetClass: "SMA - MIPA (Matematika & IPA)" },
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "tinggi", minat: "Medis & Kesehatan", bakat: "Naturalis Anatomi Kedokteran Biologi", targetClass: "SMA - MIPA (Matematika & IPA)" },
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "sedang", minat: "Pertanian & Kelautan", bakat: "Riset Biologi Botani Ekologi Tumbuhan", targetClass: "SMA - MIPA (Matematika & IPA)" },

  // SMA - IPS (Ilmu Pengetahuan Sosial)
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Pendidikan & Sosial", bakat: "Sosiologi Sejarah Geografi Kepemimpinan Hubungan Publik", targetClass: "SMA - IPS (Ilmu Pengetahuan Sosial)" },
  { stemRange: "rendah", sosialRange: "tinggi", bahasaRange: "tinggi", minat: "Pendidikan & Sosial", bakat: "Analisis Sosial Konseling Psikologi Kemasyarakatan", targetClass: "SMA - IPS (Ilmu Pengetahuan Sosial)" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Ekonomi Makro Manajemen Organisasi Wirausaha", targetClass: "SMA - IPS (Ilmu Pengetahuan Sosial)" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "tinggi", minat: "Seni & Jurnalistik", bakat: "Jurnalistik Berita Debat Opini Publik Politik", targetClass: "SMA - IPS (Ilmu Pengetahuan Sosial)" },

  // SMA - Bahasa & Budaya
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "tinggi", minat: "Seni & Jurnalistik", bakat: "Sastra Novel Puisi Menulis Cerita Bahasa Asing Linguistik Verbal", targetClass: "SMA - Bahasa & Budaya" },
  { stemRange: "rendah", sosialRange: "tinggi", bahasaRange: "tinggi", minat: "Pendidikan & Sosial", bakat: "Linguistik Penerjemah Translator Komunikasi Verbal", targetClass: "SMA - Bahasa & Budaya" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "tinggi", minat: "Bisnis & Manajemen", bakat: "Public Relations Komunikasi Antar Budaya", targetClass: "SMA - Bahasa & Budaya" },
  { stemRange: "rendah", sosialRange: "sedang", bahasaRange: "tinggi", minat: "Seni & Jurnalistik", bakat: "Filologi Bahasa Jepang Inggris Korea Mandarin Arab", targetClass: "SMA - Bahasa & Budaya" },

  // SMK - Rekayasa Perangkat Lunak (RPL)
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "sedang", minat: "Sains & Teknologi", bakat: "Pemrograman Python Coding Java Javascript C++ Database SQL Web Developer", targetClass: "SMK - Rekayasa Perangkat Lunak (RPL)" },
  { stemRange: "tinggi", sosialRange: "rendah", bahasaRange: "sedang", minat: "Sains & Teknologi", bakat: "Coding Game Aplikasi Mobile App Android iOS Software Engineering", targetClass: "SMK - Rekayasa Perangkat Lunak (RPL)" },
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "sedang", minat: "Seni & Jurnalistik", bakat: "UI UX Design Front End Koding Desain Web", targetClass: "SMK - Rekayasa Perangkat Lunak (RPL)" },
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Data Science Algoritma Analisis Sistem Koding", targetClass: "SMK - Rekayasa Perangkat Lunak (RPL)" },

  // SMK - Teknik Komputer & Jaringan (TKJ)
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Sains & Teknologi", bakat: "Jaringan Komputer Server Router Cisco Mikrotik LAN WAN", targetClass: "SMK - Teknik Komputer & Jaringan (TKJ)" },
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "rendah", minat: "Sains & Teknologi", bakat: "Instalasi Jaringan Kabel Wifi Cyber Security Keamanan Jaringan Hacking", targetClass: "SMK - Teknik Komputer & Jaringan (TKJ)" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "rendah", minat: "Teknik & Konstruksi", bakat: "Kabel Fiber Optik RJ45 Wifi Hardware PC Merakit Komputer", targetClass: "SMK - Teknik Komputer & Jaringan (TKJ)" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Olahraga & Fisik", bakat: "Teknisi Jaringan Instalasi Lapangan Perbaikan Router", targetClass: "SMK - Teknik Komputer & Jaringan (TKJ)" },

  // SMK - Multimedia & DKV
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Seni & Jurnalistik", bakat: "Visual Spasial Desain Gambar Photoshop Illustrator CorelDraw", targetClass: "SMK - Multimedia & DKV" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Desain & Arsitektur", bakat: "Video Editing Animasi Melukis Digital Premiere After Effects Sinematografi Fotografi", targetClass: "SMK - Multimedia & DKV" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Seni & Jurnalistik", bakat: "Animasi 3D Blender Menggambar Komik Karakter Kartun", targetClass: "SMK - Multimedia & DKV" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Social Media Admin Content Creator Desainer Kreatif", targetClass: "SMK - Multimedia & DKV" },

  // SMK - Akuntansi & Keuangan Lembaga
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Akuntansi Keuangan Pembukuan Neraca Excel Matematika Keuangan", targetClass: "SMK - Akuntansi & Keuangan Lembaga" },
  { stemRange: "tinggi", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Pajak Perpajakan Audit Laporan Keuangan Neraca Pembukuan", targetClass: "SMK - Akuntansi & Keuangan Lembaga" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Teller Bank Keuangan Mikro Kasir Transaksi Keuangan", targetClass: "SMK - Akuntansi & Keuangan Lembaga" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Pendidikan & Sosial", bakat: "Ketelitian Administrasi Keuangan Pajak Buku Kas", targetClass: "SMK - Akuntansi & Keuangan Lembaga" },

  // SMK - Otomatisasi & Perkantoran
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Administrasi Perkantoran Mengetik Cepat Surat Menyurat Sekretaris Arsip", targetClass: "SMK - Otomatisasi & Perkantoran" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "tinggi", minat: "Bisnis & Manajemen", bakat: "Manajemen Dokumen Microsoft Office Word PowerPoint Sekretaris", targetClass: "SMK - Otomatisasi & Perkantoran" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Pendidikan & Sosial", bakat: "Customer Service Hubungan Masyarakat Komunikasi Resepsionis", targetClass: "SMK - Otomatisasi & Perkantoran" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "tinggi", minat: "Bisnis & Manajemen", bakat: "Resepsionis Agenda Rapat Notulen Kearsipan", targetClass: "SMK - Otomatisasi & Perkantoran" },

  // SMK - Bisnis & Pemasaran
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Sales Pemasaran Jualan Negosiasi Hubungan Pelanggan", targetClass: "SMK - Bisnis & Pemasaran" },
  { stemRange: "rendah", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Digital Marketing E-Commerce Toko Online Marketplace", targetClass: "SMK - Bisnis & Pemasaran" },
  { stemRange: "rendah", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Pendidikan & Sosial", bakat: "Komunikasi Persuasi Wirausaha Dagang Jualan Retail", targetClass: "SMK - Bisnis & Pemasaran" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "tinggi", minat: "Seni & Jurnalistik", bakat: "Copywriting Branding Iklan Promosi Dagang Online", targetClass: "SMK - Bisnis & Pemasaran" },

  // SMK - Teknik Otomotif
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "rendah", minat: "Teknik & Konstruksi", bakat: "Mesin Otomotif Mobil Motor Bengkel Tune Up Transmisi", targetClass: "SMK - Teknik Otomotif" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "rendah", minat: "Olahraga & Fisik", bakat: "Mekanik Servis Motor Reparasi Kendaraan Bongkar Pasang Mesin", targetClass: "SMK - Teknik Otomotif" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "rendah", minat: "Teknik & Konstruksi", bakat: "Modifikasi Mobil Kelistrikan Otomotif Bengkel Kendaraan", targetClass: "SMK - Teknik Otomotif" },
  { stemRange: "sedang", sosialRange: "rendah", bahasaRange: "rendah", minat: "Sains & Teknologi", bakat: "Diagnosis Mesin Elektronik ECU Otomotif Sensor Mobil", targetClass: "SMK - Teknik Otomotif" },

  // SMK - Teknik Pemesinan
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "rendah", minat: "Teknik & Konstruksi", bakat: "Mesin Bubut CNC Milling Las Logam Fabrikasi Plat", targetClass: "SMK - Teknik Pemesinan" },
  { stemRange: "sedang", sosialRange: "rendah", bahasaRange: "rendah", minat: "Desain & Arsitektur", bakat: "Gambar Teknik AutoCAD SolidWorks Desain Alat Industri", targetClass: "SMK - Teknik Pemesinan" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "rendah", minat: "Olahraga & Fisik", bakat: "Mekanik Perkakas Industri Bengkel Bubut Perkakas Logam", targetClass: "SMK - Teknik Pemesinan" },
  { stemRange: "sedang", sosialRange: "rendah", bahasaRange: "rendah", minat: "Sains & Teknologi", bakat: "Otomasi Industri Mesin Berat Maintenance Pabrik Manufaktur", targetClass: "SMK - Teknik Pemesinan" },

  // SMK - Teknik Instalasi Tenaga Listrik
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "rendah", minat: "Teknik & Konstruksi", bakat: "Instalasi Listrik Kabel MCB Saklar Panel Listrik Solder", targetClass: "SMK - Teknik Instalasi Tenaga Listrik" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "rendah", minat: "Sains & Teknologi", bakat: "Elektronika Arus Kuat Genset Motor Listrik PLC Otomasi Listrik", targetClass: "SMK - Teknik Instalasi Tenaga Listrik" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "rendah", minat: "Teknik & Konstruksi", bakat: "Teknisi AC Pendingin Listrik Rumah Tangga Perbaikan Dinamo", targetClass: "SMK - Teknik Instalasi Tenaga Listrik" },
  { stemRange: "sedang", sosialRange: "rendah", bahasaRange: "rendah", minat: "Olahraga & Fisik", bakat: "Instalasi Kabel Lapangan Panel Listrik Tiang Listrik", targetClass: "SMK - Teknik Instalasi Tenaga Listrik" },

  // SMK - Tata Boga (Kuliner)
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Olahraga & Fisik", bakat: "Tata Boga Kuliner Masak Membuat Kue Makanan Nusantara Western Chef", targetClass: "SMK - Tata Boga (Kuliner)" },
  { stemRange: "rendah", sosialRange: "sedang", bahasaRange: "sedang", minat: "Olahraga & Fisik", bakat: "Resep Dapur Baking Roti Kue Pastry Dekorasi Hidangan", targetClass: "SMK - Tata Boga (Kuliner)" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Restoran Catering Pengusaha Kuliner Barista Kopi", targetClass: "SMK - Tata Boga (Kuliner)" },
  { stemRange: "rendah", sosialRange: "sedang", bahasaRange: "sedang", minat: "Pendidikan & Sosial", bakat: "Penyajian Makanan Gizi Pelayanan Restoran Hospitality Kuliner", targetClass: "SMK - Tata Boga (Kuliner)" },

  // SMK - Tata Busana (Fashion)
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Seni & Jurnalistik", bakat: "Tata Busana Fashion Jahit Baju Desain Pakaian Merancang Busana Sketsa Mode", targetClass: "SMK - Tata Busana (Fashion)" },
  { stemRange: "rendah", sosialRange: "sedang", bahasaRange: "sedang", minat: "Seni & Jurnalistik", bakat: "Merancang Busana Kain Mode Pola Pakaian Bordir Mesin Jahit", targetClass: "SMK - Tata Busana (Fashion)" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Butik Wirausaha Fashion Model Tren Baju Toko Pakaian", targetClass: "SMK - Tata Busana (Fashion)" },
  { stemRange: "rendah", sosialRange: "sedang", bahasaRange: "tinggi", minat: "Seni & Jurnalistik", bakat: "Tekstil Padu Padan Warna Hijab Kebaya Busana Pengantin", targetClass: "SMK - Tata Busana (Fashion)" },

  // SMK - Perhotelan & Pariwisata
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "tinggi", minat: "Olahraga & Fisik", bakat: "Interpersonal Pelayanan Tamu Perhotelan Housekeeping Resepsionis Hotel", targetClass: "SMK - Perhotelan & Pariwisata" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Pendidikan & Sosial", bakat: "Interpersonal Guide Tour Wisata Pemandu Perjalanan Asing", targetClass: "SMK - Perhotelan & Pariwisata" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Event Organizer Perencana Acara Pramusaji Tata Hidang Hotel", targetClass: "SMK - Perhotelan & Pariwisata" },
  { stemRange: "rendah", sosialRange: "tinggi", bahasaRange: "tinggi", minat: "Pendidikan & Sosial", bakat: "Komunikasi Ramah Tamah Hospitality Perhotelan Tour Travel", targetClass: "SMK - Perhotelan & Pariwisata" },

  // SMK - Farmasi & Keperawatan
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Medis & Kesehatan", bakat: "Naturalis Farmasi Obat Medis Meracik Obat Apotek Kimia Obat", targetClass: "SMK - Farmasi & Keperawatan" },
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "sedang", minat: "Medis & Kesehatan", bakat: "Logika Matematika Rawat Pasien Merawat Orang Sakit Keperawatan", targetClass: "SMK - Farmasi & Keperawatan" },
  { stemRange: "sedang", sosialRange: "tinggi", bahasaRange: "sedang", minat: "Pendidikan & Sosial", bakat: "Empati Pelayanan Kesehatan Rumah Sakit Klinik P3K", targetClass: "SMK - Farmasi & Keperawatan" },
  { stemRange: "tinggi", sosialRange: "sedang", bahasaRange: "sedang", minat: "Sains & Teknologi", bakat: "Anatomi Tubuh Pertolongan Pertama Medis Cek Tensi Darah", targetClass: "SMK - Farmasi & Keperawatan" },

  // SMK - Agribisnis & Pertanian
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Medis & Kesehatan", bakat: "Naturalis Agribisnis Pertanian Tanaman Hidroponik Budidaya Tanah", targetClass: "SMK - Agribisnis & Pertanian" },
  { stemRange: "rendah", sosialRange: "sedang", bahasaRange: "sedang", minat: "Pendidikan & Sosial", bakat: "Naturalis Budidaya Pangan Peternakan Hewan Perikanan Kolam", targetClass: "SMK - Agribisnis & Pertanian" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Sains & Teknologi", bakat: "Bioteknologi Pertanian Hama Pupuk Organik Perkebunan Tanaman", targetClass: "SMK - Agribisnis & Pertanian" },
  { stemRange: "sedang", sosialRange: "sedang", bahasaRange: "sedang", minat: "Bisnis & Manajemen", bakat: "Agribisnis Jualan Hasil Tani Perkebunan Pangan Sayur Buah", targetClass: "SMK - Agribisnis & Pertanian" }
];

export function calculateNaiveBayes(data: StudentFeatures): NaiveBayesResult {
  const { minat, bakat, stemAvg, bahasaAvg, sosialAvg } = data;

  // Helper to bin numerical scores into ranges
  const getRange = (score: number) => {
    if (score >= 82) return "tinggi";
    if (score >= 70) return "sedang";
    return "rendah";
  };

  const studentStemRange = getRange(stemAvg);
  const studentSosialRange = getRange(sosialAvg);
  const studentBahasaRange = getRange(bahasaAvg);

  // Compute prior probabilities P(C)
  const priorCounts: Record<string, number> = {};
  TARGET_CLASSES.forEach(tc => { priorCounts[tc] = 0; });
  
  TRAINING_SAMPLES.forEach(s => {
    priorCounts[s.targetClass] = (priorCounts[s.targetClass] || 0) + 1;
  });

  const totalSamples = TRAINING_SAMPLES.length;
  const priors: Record<string, number> = {};
  TARGET_CLASSES.forEach(tc => {
    // Add Laplace smoothing (add 1)
    priors[tc] = (priorCounts[tc] + 1) / (totalSamples + TARGET_CLASSES.length);
  });

  // Compute posterior probabilities
  const posteriors: Record<string, number> = {};
  const nbProbabilities: NaiveBayesProbability[] = [];

  TARGET_CLASSES.forEach(tc => {
    const classSamples = TRAINING_SAMPLES.filter(s => s.targetClass === tc);
    const countC = classSamples.length;

    // Laplace smoothed conditional probability calculations
    const countStem = classSamples.filter(s => s.stemRange === studentStemRange).length;
    const pStem = (countStem + 1) / (countC + 3);

    const countSosial = classSamples.filter(s => s.sosialRange === studentSosialRange).length;
    const pSosial = (countSosial + 1) / (countC + 3);

    const countBahasa = classSamples.filter(s => s.bahasaRange === studentBahasaRange).length;
    const pBahasa = (countBahasa + 1) / (countC + 3);

    const countMinat = classSamples.filter(s => s.minat === minat).length;
    const pMinat = (countMinat + 1) / (countC + 8); // 8 minat options

    // Robust case-insensitive substring matching for free-text bakat field
    const countBakat = classSamples.filter(s => {
      const sBakatLower = s.bakat.toLowerCase();
      const studBakatLower = bakat.toLowerCase();
      return sBakatLower.includes(studBakatLower) || studBakatLower.includes(sBakatLower);
    }).length;
    const pBakat = (countBakat + 1) / (countC + 8); // 8 bakat options

    // P(C | Attributes) = P(C) * P(A1|C) * P(A2|C) ...
    const likelihood = pStem * pSosial * pBahasa * pMinat * pBakat;
    const posterior = priors[tc] * likelihood;
    posteriors[tc] = posterior;
  });

  // Normalize posteriors to sum up to 100%
  const sumPosteriors = Object.values(posteriors).reduce((a, b) => a + b, 0);
  TARGET_CLASSES.forEach(tc => {
    const normProb = sumPosteriors > 0 ? (posteriors[tc] / sumPosteriors) * 100 : 0;
    nbProbabilities.push({ className: tc, prob: Math.round(normProb) });
  });

  // Sort Naive Bayes probabilities
  nbProbabilities.sort((a, b) => b.prob - a.prob);
  const prediction = nbProbabilities[0].className;
  const confidence = nbProbabilities[0].prob;

  return {
    prediction,
    confidence,
    probabilities: nbProbabilities
  };
}
