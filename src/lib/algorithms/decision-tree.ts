export interface StudentFeatures {
  minat: string;
  bakat: string;
  stemAvg: number;
  bahasaAvg: number;
  sosialAvg: number;
  vokasiAvg: number;
  totalAvg: number;
  infoGrade?: number;
}

export interface DecisionTreeNode {
  parameter: string;
  value: string;
}

export interface DecisionTreeResult {
  prediction: string;
  confidence: number;
  nodes: DecisionTreeNode[];
}

export function calculateDecisionTree(data: StudentFeatures): DecisionTreeResult {
  const { minat, bakat, stemAvg, bahasaAvg, sosialAvg, totalAvg } = data;
  const infoGrade = data.infoGrade || 0;
  let prediction = "";
  let confidence = 0;
  let nodes: DecisionTreeNode[] = [];

  const bkLower = (bakat || "").toLowerCase();

  // 1. Minat: Sains & Teknologi
  if (minat === "Sains & Teknologi") {
    nodes.push({ parameter: "Minat Utama", value: "Sains & Teknologi" });
    
    // Check if they gravitate towards Software / Networking / IT
    const isIT = bkLower.includes("komputer") || 
                 bkLower.includes("software") || 
                 bkLower.includes("rpl") || 
                 bkLower.includes("coding") || 
                 bkLower.includes("pemrograman") || 
                 bkLower.includes("jaringan") || 
                 bkLower.includes("tkj") || 
                 bkLower.includes("robot") || 
                 bkLower.includes("game") || 
                 bkLower.includes("web") || 
                 bkLower.includes("aplikasi") || 
                 bkLower.includes("teknologi") ||
                 infoGrade >= 85; // High computer grade is a strong indicator of IT capability!

    const isDesign = bkLower.includes("visual") || 
                     bkLower.includes("desain") || 
                     bkLower.includes("gambar") || 
                     bkLower.includes("video") || 
                     bkLower.includes("animasi") || 
                     bkLower.includes("editing") || 
                     bkLower.includes("kreatif") || 
                     bkLower.includes("art") || 
                     bkLower.includes("seni") || 
                     bkLower.includes("foto");

    if (isIT) {
      nodes.push({ parameter: "Bakat / Nilai Info", value: `TI / Informatika: ${infoGrade}` });
      if (stemAvg >= 80 || infoGrade >= 90) {
        nodes.push({ parameter: "Rerata STEM / Info", value: `STEM: ${stemAvg} / Info: ${infoGrade}` });
        prediction = "SMK - Rekayasa Perangkat Lunak (RPL)";
        confidence = 96;
      } else {
        nodes.push({ parameter: "Rerata STEM", value: `< 80 (${stemAvg})` });
        prediction = "SMK - Teknik Komputer & Jaringan (TKJ)";
        confidence = 90;
      }
    } else if (isDesign) {
      nodes.push({ parameter: "Bakat Spesifik", value: "Desain Kreatif" });
      prediction = "SMK - Multimedia & DKV";
      confidence = 93;
    } else {
      // Default: Pure Science vs IT based on scores
      if (stemAvg >= 75) {
        nodes.push({ parameter: "STEM Average", value: `>= 75 (${stemAvg})` });
        prediction = "SMA - MIPA (Matematika & IPA)";
        confidence = 92;
      } else {
        nodes.push({ parameter: "STEM Average", value: `< 75 (${stemAvg})` });
        prediction = "SMK - Teknik Komputer & Jaringan (TKJ)";
        confidence = 85;
      }
    }
  }
  // 2. Minat: Teknik & Konstruksi
  else if (minat === "Teknik & Konstruksi") {
    nodes.push({ parameter: "Minat Utama", value: "Teknik & Konstruksi" });
    
    const isElectricity = bkLower.includes("listrik") || 
                          bkLower.includes("elektronika") || 
                          bkLower.includes("kabel") || 
                          bkLower.includes("sirkuit") || 
                          bkLower.includes("power") || 
                          bkLower.includes("instalasi");

    const isMachinery = bkLower.includes("mesin") || 
                        bkLower.includes("bubut") || 
                        bkLower.includes("las") || 
                        bkLower.includes("logam") || 
                        bkLower.includes("baja") || 
                        bkLower.includes("manufaktur") || 
                        bkLower.includes("konstruksi") || 
                        bkLower.includes("bangunan");

    if (isElectricity) {
      nodes.push({ parameter: "Bakat Teknik", value: "Kelistrikan & Elektronika" });
      prediction = "SMK - Teknik Instalasi Tenaga Listrik";
      confidence = 94;
    } else if (isMachinery) {
      nodes.push({ parameter: "Bakat Teknik", value: "Pemesinan & Logam" });
      prediction = "SMK - Teknik Pemesinan";
      confidence = 92;
    } else {
      nodes.push({ parameter: "Bakat Teknik", value: "Umum / Otomotif" });
      prediction = "SMK - Teknik Otomotif";
      confidence = 90;
    }
  }
  // 3. Minat: Bisnis & Manajemen
  else if (minat === "Bisnis & Manajemen") {
    nodes.push({ parameter: "Minat Utama", value: "Bisnis & Manajemen" });
    
    const isAccounting = bkLower.includes("hitung") || 
                         bkLower.includes("keuangan") || 
                         bkLower.includes("uang") || 
                         bkLower.includes("akuntansi") || 
                         bkLower.includes("math") || 
                         bkLower.includes("tabel") || 
                         bkLower.includes("pajak") || 
                         bkLower.includes("data");

    const isMarketing = bkLower.includes("bicara") || 
                        bkLower.includes("jual") || 
                        bkLower.includes("dagang") || 
                        bkLower.includes("sales") || 
                        bkLower.includes("promosi") || 
                        bkLower.includes("marketing") || 
                        bkLower.includes("bisnis") || 
                        bkLower.includes("negosiasi");

    const isOffice = bkLower.includes("tulis") || 
                      bkLower.includes("ketik") || 
                      bkLower.includes("arsip") || 
                      bkLower.includes("admin") || 
                      bkLower.includes("kantor") || 
                      bkLower.includes("sekretaris") || 
                      bkLower.includes("organisasi");

    if (isAccounting) {
      nodes.push({ parameter: "Bakat Bisnis", value: "Akuntansi & Finansial" });
      prediction = "SMK - Akuntansi & Keuangan Lembaga";
      confidence = 95;
    } else if (isMarketing) {
      nodes.push({ parameter: "Bakat Bisnis", value: "Pemasaran & Negosiasi" });
      prediction = "SMK - Bisnis & Pemasaran";
      confidence = 92;
    } else if (isOffice) {
      nodes.push({ parameter: "Bakat Bisnis", value: "Administrasi Perkantoran" });
      prediction = "SMK - Otomatisasi & Perkantoran";
      confidence = 90;
    } else {
      if (sosialAvg >= 75) {
        nodes.push({ parameter: "Sosial Average", value: `>= 75 (${sosialAvg})` });
        prediction = "SMA - IPS (Ilmu Pengetahuan Sosial)";
        confidence = 88;
      } else {
        nodes.push({ parameter: "Sosial Average", value: `< 75 (${sosialAvg})` });
        prediction = "SMK - Otomatisasi & Perkantoran";
        confidence = 80;
      }
    }
  }
  // 4. Minat: Seni & Jurnalistik
  else if (minat === "Seni & Jurnalistik") {
    nodes.push({ parameter: "Minat Utama", value: "Seni & Jurnalistik" });
    
    const isFashion = bkLower.includes("busana") || 
                      bkLower.includes("baju") || 
                      bkLower.includes("jahit") || 
                      bkLower.includes("pakaian") || 
                      bkLower.includes("fashion") || 
                      bkLower.includes("kain") || 
                      bkLower.includes("desain baju") || 
                      bkLower.includes("merancang");

    const isLanguage = bkLower.includes("tulis") || 
                       bkLower.includes("bahasa") || 
                       bkLower.includes("baca") || 
                       bkLower.includes("bicara") || 
                       bkLower.includes("debat") || 
                       bkLower.includes("jurnal") || 
                       bkLower.includes("cerita") || 
                       bkLower.includes("sastra") || 
                       bkLower.includes("puisi");

    if (isFashion) {
      nodes.push({ parameter: "Bakat Kreatif", value: "Tata Busana / Fashion" });
      prediction = "SMK - Tata Busana (Fashion)";
      confidence = 94;
    } else if (isLanguage) {
      nodes.push({ parameter: "Bakat Kreatif", value: "Linguistik / Sastra" });
      prediction = "SMA - Bahasa & Budaya";
      confidence = 92;
    } else {
      nodes.push({ parameter: "Bakat Kreatif", value: "Seni Visual / Desain" });
      prediction = "SMK - Multimedia & DKV";
      confidence = 90;
    }
  }
  // 5. Minat: Pendidikan & Sosial
  else if (minat === "Pendidikan & Sosial") {
    nodes.push({ parameter: "Minat Utama", value: "Pendidikan & Sosial" });
    
    if (bahasaAvg >= sosialAvg && bahasaAvg >= 75) {
      nodes.push({ parameter: "Bahasa vs Sosial Avg", value: `Bahasa Lebih Tinggi (${bahasaAvg} vs ${sosialAvg})` });
      prediction = "SMA - Bahasa & Budaya";
      confidence = 90;
    } else {
      nodes.push({ parameter: "Bahasa vs Sosial Avg", value: `Sosial Lebih Tinggi (${sosialAvg} vs ${bahasaAvg})` });
      prediction = "SMA - IPS (Ilmu Pengetahuan Sosial)";
      confidence = 92;
    }
  }
  // 6. Minat: Medis & Kesehatan
  else if (minat === "Medis & Kesehatan") {
    nodes.push({ parameter: "Minat Utama", value: "Medis & Kesehatan" });
    
    if (stemAvg >= 80) {
      nodes.push({ parameter: "STEM Average", value: `>= 80 (${stemAvg})` });
      prediction = "SMA - MIPA (Matematika & IPA)";
      confidence = 94;
    } else {
      nodes.push({ parameter: "STEM Average", value: `< 80 (${stemAvg})` });
      prediction = "SMK - Farmasi & Keperawatan";
      confidence = 91;
    }
  }
  // 7. Minat: Olahraga & Fisik
  else if (minat === "Olahraga & Fisik") {
    nodes.push({ parameter: "Minat Utama", value: "Olahraga & Fisik" });
    
    const isCulinary = bkLower.includes("masak") || 
                       bkLower.includes("kuliner") || 
                       bkLower.includes("kue") || 
                       bkLower.includes("makanan") || 
                       bkLower.includes("resep") || 
                       bkLower.includes("dapur") || 
                       bkLower.includes("baking") || 
                       bkLower.includes("roti");

    if (isCulinary) {
      nodes.push({ parameter: "Bakat Fisik", value: "Tata Boga / Kuliner" });
      prediction = "SMK - Tata Boga (Kuliner)";
      confidence = 94;
    } else {
      nodes.push({ parameter: "Bakat Fisik", value: "Kinestetik Motorik" });
      prediction = "SMK - Teknik Otomotif";
      confidence = 88;
    }
  }
  // 8. Minat: Desain & Arsitektur
  else if (minat === "Desain & Arsitektur") {
    nodes.push({ parameter: "Minat Utama", value: "Desain & Arsitektur" });
    
    const isTechnicalDrafting = bkLower.includes("bangun") || 
                                bkLower.includes("gambar teknik") || 
                                bkLower.includes("drafting") || 
                                bkLower.includes("maket") || 
                                bkLower.includes("autocad") || 
                                bkLower.includes("arsitektur") || 
                                bkLower.includes("konstruksi");

    if (isTechnicalDrafting) {
      nodes.push({ parameter: "Bakat Desain", value: "Gambar Teknik / Arsitektur" });
      prediction = "SMK - Teknik Pemesinan";
      confidence = 90;
    } else {
      nodes.push({ parameter: "Bakat Desain", value: "Desain Grafis / DKV" });
      prediction = "SMK - Multimedia & DKV";
      confidence = 95;
    }
  }
  // 9. Fallback / Default
  else {
    nodes.push({ parameter: "Minat Lainnya", value: minat });
    if (stemAvg >= totalAvg) {
      prediction = "SMA - MIPA (Matematika & IPA)";
      confidence = 75;
    } else {
      prediction = "SMA - IPS (Ilmu Pengetahuan Sosial)";
      confidence = 75;
    }
  }

  return {
    prediction,
    confidence,
    nodes
  };
}
