"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  ChevronLeft, 
  BrainCircuit, 
  Target, 
  Sparkles, 
  Award, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertMinatBakat } from "@/actions/minat-bakat";
import { SiswaWithMinatBakat } from "@/types";

// Options List
const mbtiOptions = [
  "INTJ", "ENTJ", "INFJ", "ENFJ",
  "INTP", "ENTP", "INFP", "ENFP",
  "ISTJ", "ESTJ", "ISFJ", "ESFJ",
  "ISTP", "ESTP", "ISFP", "ESFP"
];

const dominanOptions = [
  "Logika Matematika",
  "Linguistik Verbal",
  "Visual Spasial",
  "Musikal",
  "Kinestetik",
  "Naturalis",
  "Interpersonal",
  "Intrapersonal"
];

const minatOptions = [
  "Sains & Teknologi",
  "Seni & Jurnalistik",
  "Olahraga & Fisik",
  "Pendidikan & Sosial",
  "Desain & Arsitektur",
  "Bisnis & Manajemen",
  "Medis & Kesehatan",
  "Teknik & Konstruksi"
];

const mbtiDiagnosticQuestions = [
  {
    dimension: "EorI",
    title: "Sumber Energi Utama (E vs I)",
    desc: "Bagaimana siswa mengarahkan energi dan bersosialisasi?",
    options: [
      { value: "E", label: "Extraversion (E)", detail: "Aktif bersosialisasi, ekspresif, antusias dalam kelompok, dan senang berkolaborasi." },
      { value: "I", label: "Introversion (I)", detail: "Tenang, mandiri, cenderung tertutup, reflektif, dan lebih fokus belajar mandiri." }
    ]
  },
  {
    dimension: "SorN",
    title: "Penyerapan Informasi (S vs N)",
    desc: "Bagaimana siswa mencerna fakta dan gambaran besar?",
    options: [
      { value: "S", label: "Sensing (S)", detail: "Fokus pada fakta konkret, praktis, detail instruksi, dan tugas terstruktur." },
      { value: "N", label: "Intuition (N)", detail: "Imajinatif, menyukai konsep/ide abstrak, kreatif, dan berpikir jangka panjang." }
    ]
  },
  {
    dimension: "TorF",
    title: "Pengambilan Keputusan (T vs F)",
    desc: "Bagaimana siswa menganalisis dan memutuskan masalah?",
    options: [
      { value: "T", label: "Thinking (T)", detail: "Rasional, kritis, logis, objektif, dan mengutamakan fakta/aturan." },
      { value: "F", label: "Feeling (F)", detail: "Empati tinggi, peka perasaan, mengutamakan keharmonisan sosial dan hubungan interpersonal." }
    ]
  },
  {
    dimension: "JorP",
    title: "Gaya Pola Kerja & Hidup (J vs P)",
    desc: "Bagaimana siswa mengelola waktu dan rencana tugas?",
    options: [
      { value: "J", label: "Judging (J)", detail: "Teratur, tepat waktu, menyukai rencana matang, dan menyelesaikan tugas seawal mungkin." },
      { value: "P", label: "Perceiving (P)", detail: "Fleksibel, adaptif dengan perubahan, nyaman bekerja mendekati tenggat, dan spontan." }
    ]
  }
];

// Detail MBTI mapping
const mbtiDetails: Record<string, { title: string; desc: string }> = {
  INTJ: { title: "Sang Arsitek", desc: "Pemikir strategis dengan logika tajam, visioner, mandiri, dan menyukai efisiensi tingkat tinggi." },
  ENTJ: { title: "Sang Komandan", desc: "Pemimpin karismatik, berani mengambil keputusan besar, dan sangat andal dalam mengelola sistem." },
  INFJ: { title: "Sang Advokat", desc: "Idealis penuh integritas, peka secara emosional, mendalam, dan memiliki dorongan kuat membantu sesama." },
  ENFJ: { title: "Sang Protagonis", desc: "Komunikator ulung yang empatik, pemimpin alami yang menginspirasi, serta penggerak massa yang hebat." },
  INTP: { title: "Sang Logikawan", desc: "Penemu kreatif, teoretis, analitis, pemecah masalah alami yang menyukai eksplorasi ide abstrak." },
  ENTP: { title: "Sang Debat", desc: "Cerdas, fleksibel, senang menantang status quo, inovator ulung, dan mahir dalam mendiskusikan gagasan baru." },
  INFP: { title: "Sang Mediator", desc: "Penuh empati, idealis berjiwa seni tinggi, setia pada nilai pribadi, dan sangat kreatif secara literasi." },
  ENFP: { title: "Sang Juru Kampanye", desc: "Sangat energik, kreatif, supel, berjiwa bebas, penuh antusiasme, serta pandai bersosialisasi." },
  ISTJ: { title: "Sang Logistikus", desc: "Sangat praktis, andal, teratur, menghormati fakta, terstruktur, serta berintegritas tinggi." },
  ESTJ: { title: "Sang Eksekutif", desc: "Pengelola ulung yang menyukai ketertiban, ketegasan operasional, pengarah kerja tim yang andal." },
  ISFJ: { title: "Sang Pembela", desc: "Sangat setia, pelindung yang berdedikasi tinggi, hangat, penyayang, dan siap membantu di balik layar." },
  ESFJ: { title: "Sang Konsul", desc: "Sangat ramah, peduli sosial, aktif membantu komunitas, dan senang menciptakan harmoni lingkungan." },
  ISTP: { title: "Sang Pengrajin", desc: "Eksperimentator berani, menguasai berbagai instrumen fisik, praktis, serta andal dalam pemecahan masalah teknis." },
  ESTP: { title: "Sang Pengusaha", desc: "Energik, berorientasi tindakan, tanggap terhadap peluang cepat, ramah, dan menyukai tantangan fisik." },
  ISFP: { title: "Sang Petualang", desc: "Seniman fleksibel, menyukai estetika harmoni, ramah, menghargai keindahan visual, dan berjiwa bebas." },
  ESFP: { title: "Sang Penghibur", desc: "Spontan, antusias, membuat suasana menyenangkan, supel, dan mencintai interaksi sosial aktif." }
};

interface ConsoleProps {
  allStudents: SiswaWithMinatBakat[];
  initialSiswaId?: string;
}

export function MinatBakatConsole({ allStudents, initialSiswaId }: ConsoleProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // States
  const [selectedStudent, setSelectedStudent] = useState<SiswaWithMinatBakat | null>(null);
  const [inputMinat, setInputMinat] = useState("");
  const [inputBakat, setInputBakat] = useState("");
  const [inputDominan, setInputDominan] = useState("");
  const [inputMbti, setInputMbti] = useState("");

  // Wizard & Diagnostic States
  const [currentStep, setCurrentStep] = useState(1);
  const [isDiagnosticMode, setIsDiagnosticMode] = useState(true);
  const [mbtiEorI, setMbtiEorI] = useState("");
  const [mbtiSorN, setMbtiSorN] = useState("");
  const [mbtiTorF, setMbtiTorF] = useState("");
  const [mbtiJorP, setMbtiJorP] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Diagnostic MBTI Calculation Effect
  useEffect(() => {
    if (isDiagnosticMode) {
      if (mbtiEorI && mbtiSorN && mbtiTorF && mbtiJorP) {
        setInputMbti(`${mbtiEorI}${mbtiSorN}${mbtiTorF}${mbtiJorP}`);
      } else {
        setInputMbti("");
      }
    }
  }, [isDiagnosticMode, mbtiEorI, mbtiSorN, mbtiTorF, mbtiJorP]);

  // Set initial selected student if passed in query
  useEffect(() => {
    if (initialSiswaId && allStudents.length > 0) {
      const matched = allStudents.find(s => s.id === initialSiswaId);
      if (matched) {
        setSelectedStudent(matched);
        // Prefill if student already has a record
        const record = matched.minatBakat && matched.minatBakat.length > 0 ? matched.minatBakat[0] : null;
        if (record) {
          const detail = typeof record.detailTes === "string" ? JSON.parse(record.detailTes) : record.detailTes;
          setInputMinat(record.minat);
          setInputBakat(record.bakat);
          setInputDominan(detail?.dominan || "");
          const m = detail?.mbti || "";
          setInputMbti(m);
          if (m && m.length === 4) {
            setMbtiEorI(m[0]);
            setMbtiSorN(m[1]);
            setMbtiTorF(m[2]);
            setMbtiJorP(m[3]);
            setIsDiagnosticMode(true);
          } else {
            setMbtiEorI("");
            setMbtiSorN("");
            setMbtiTorF("");
            setMbtiJorP("");
            setIsDiagnosticMode(false);
          }
        }
      }
    }
  }, [initialSiswaId, allStudents]);

  // Handle student select changes
  const handleStudentChange = (siswaId: string) => {
    const matched = allStudents.find(s => s.id === siswaId);
    if (matched) {
      setSelectedStudent(matched);
      const record = matched.minatBakat && matched.minatBakat.length > 0 ? matched.minatBakat[0] : null;
      if (record) {
        const detail = typeof record.detailTes === "string" ? JSON.parse(record.detailTes) : record.detailTes;
        setInputMinat(record.minat);
        setInputBakat(record.bakat);
        setInputDominan(detail?.dominan || "");
        const m = detail?.mbti || "";
        setInputMbti(m);
        if (m && m.length === 4) {
          setMbtiEorI(m[0]);
          setMbtiSorN(m[1]);
          setMbtiTorF(m[2]);
          setMbtiJorP(m[3]);
          setIsDiagnosticMode(true);
        } else {
          setMbtiEorI("");
          setMbtiSorN("");
          setMbtiTorF("");
          setMbtiJorP("");
          setIsDiagnosticMode(false);
        }
      } else {
        setInputMinat("");
        setInputBakat("");
        setInputDominan("");
        setInputMbti("");
        setMbtiEorI("");
        setMbtiSorN("");
        setMbtiTorF("");
        setMbtiJorP("");
        setIsDiagnosticMode(true);
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setFormError("Pilih siswa terlebih dahulu!");
      return;
    }
    setFormLoading(true);
    setFormError("");

    const res = await upsertMinatBakat(
      selectedStudent.id,
      inputMinat,
      inputBakat,
      { dominan: inputDominan, mbti: inputMbti }
    );

    setFormLoading(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setToast({ message: "Data asesmen minat & bakat berhasil disimpan!", type: "success" });
      setTimeout(() => {
        router.push("/dashboard/bk/minat-bakat");
        router.refresh();
      }, 800);
    }
  };

  // Live counseling guidance advisory generator
  const getLiveAdvisory = () => {
    if (!inputMbti || !inputDominan || !inputMinat) {
      return "Silakan lengkapi pilihan formulir asesmen di samping kiri untuk menghasilkan analisis rekomendasi bimbingan karir otomatis.";
    }

    const title = mbtiDetails[inputMbti]?.title || "Tipe Unik";
    
    return `Siswa teridentifikasi memiliki kepribadian ${inputMbti} (${title}) dengan kecerdasan dominan ${inputDominan}. Karakter ini sangat sinkron dengan arah minat karir di bidang ${inputMinat}. Guru BK disarankan membimbing siswa untuk mengambil kegiatan pendukung yang melatih kompetensi ${inputBakat || "keahlian khusus"} serta mendorong mereka bergabung dalam kelompok belajar yang relevan secara aplikatif.`;
  };
  // Helper to breakdown MBTI letters
  const getMbtiBreakdown = (mbti: string) => {
    if (!mbti || mbti.length !== 4) return "";
    const chars = mbti.toUpperCase().split("");
    const map: Record<string, string> = {
      E: "Extraverted (E)",
      I: "Introverted (I)",
      S: "Sensing (S)",
      N: "Intuitive (N)",
      T: "Thinking (T)",
      F: "Feeling (F)",
      J: "Judging (J)",
      P: "Perceiving (P)"
    };
    return chars.map(c => map[c] || c).join(" • ");
  };
  return (
    <div className="space-y-6 animate-in-fade">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between pb-2">
        <Button 
          onClick={() => router.push("/dashboard/bk/minat-bakat")}
          variant="ghost" 
          className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-semibold text-xs px-3 h-9 rounded-lg transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Rekap
        </Button>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Minat & Bakat Console WorkSpace
        </span>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Assessment Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-100 shadow-xs rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-blue-500" />
                Asesmen Pemetaan Potensi
              </CardTitle>
              {/* Premium Stepper Bar */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center gap-1.5">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-extrabold transition-all duration-300 border ${
                      currentStep === step 
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" 
                        : currentStep > step 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}>
                      {currentStep > step ? "✓" : step}
                    </div>
                    <span className={`hidden sm:inline ${currentStep === step ? "text-blue-600" : currentStep > step ? "text-slate-700" : "text-slate-400"}`}>
                      {step === 1 ? "Siswa" : step === 2 ? "Karakter" : step === 3 ? "Bakat" : "Review"}
                    </span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2 animate-in-shake">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                                {/* STEP 1: Identitas & Kecerdasan Dominan */}
                {currentStep === 1 && (
                  <div className="space-y-5 animate-in-fade">
                    {/* Select Student */}
                    <div className="space-y-1.5">
                      <Label htmlFor="student-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Siswa</Label>
                      <select
                        id="student-select"
                        value={selectedStudent?.id || ""}
                        onChange={(e) => handleStudentChange(e.target.value)}
                        required
                        disabled={!!initialSiswaId}
                        className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 rounded-lg text-sm outline-none cursor-pointer font-bold text-slate-700 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="" disabled>-- Pilih Siswa --</option>
                        {allStudents.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.nama} ({s.nis}) - Kelas {s.kelas}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Kecerdasan Dominan */}
                    <div className="space-y-1.5">
                      <Label htmlFor="select-dominan" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kecerdasan Dominan (Multiple Intelligences)</Label>
                      <select
                        id="select-dominan"
                        value={inputDominan}
                        onChange={(e) => setInputDominan(e.target.value)}
                        required
                        disabled={!selectedStudent}
                        className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 rounded-lg text-sm outline-none cursor-pointer font-bold text-slate-700 transition-all disabled:opacity-50"
                      >
                        <option value="" disabled>-- Pilih Kecerdasan --</option>
                        {dominanOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        if (!selectedStudent || !inputDominan) {
                          setFormError("Silakan pilih siswa dan kecerdasan dominan terlebih dahulu!");
                          return;
                        }
                        setFormError("");
                        setCurrentStep(2);
                      }}
                      disabled={!selectedStudent || !inputDominan}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      Lanjut ke Diagnosis Karakter
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* STEP 2: Diagnosis Karakter & MBTI */}
                {currentStep === 2 && (
                  <div className="space-y-5 animate-in-fade">
                    <div className="flex justify-between items-center bg-slate-50 p-2 border border-slate-200/60 rounded-xl">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 pl-2">Metode Diagnosis MBTI</span>
                      <div className="flex bg-slate-200 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setIsDiagnosticMode(true)}
                          className={`px-3 py-1 text-[8px] font-extrabold uppercase rounded-md transition-all cursor-pointer ${
                            isDiagnosticMode ? "bg-white text-blue-600 shadow-xs" : "text-slate-500"
                          }`}
                        >
                          Diagnosis Perilaku
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDiagnosticMode(false)}
                          className={`px-3 py-1 text-[8px] font-extrabold uppercase rounded-md transition-all cursor-pointer ${
                            !isDiagnosticMode ? "bg-white text-blue-600 shadow-xs" : "text-slate-500"
                          }`}
                        >
                          Input Manual
                        </button>
                      </div>
                    </div>

                    {!isDiagnosticMode ? (
                      /* Manual Dropdown Mode */
                      <div className="space-y-1.5">
                        <Label htmlFor="select-mbti" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kepribadian MBTI</Label>
                        <select
                          id="select-mbti"
                          value={inputMbti}
                          onChange={(e) => setInputMbti(e.target.value)}
                          required
                          className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 rounded-lg text-sm outline-none cursor-pointer font-bold text-slate-700 transition-all"
                        >
                          <option value="" disabled>-- Pilih Tipe MBTI --</option>
                          {mbtiOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-1">
                          Gunakan mode manual jika Anda sudah memiliki hasil tes psikologi formal siswa.
                        </p>
                      </div>
                    ) : (
                      /* Diagnostic Questionnaire Mode */
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[9px] font-bold text-blue-800 leading-normal mb-2">
                          💡 Tentukan opsi perilaku siswa yang paling mendekati berdasarkan hasil pengamatan Anda sehari-hari di sekolah.
                        </div>

                        {mbtiDiagnosticQuestions.map((q, idx) => {
                          const currentValue = 
                            q.dimension === "EorI" ? mbtiEorI :
                            q.dimension === "SorN" ? mbtiSorN :
                            q.dimension === "TorF" ? mbtiTorF : mbtiJorP;
                          
                          const setter = 
                            q.dimension === "EorI" ? setMbtiEorI :
                            q.dimension === "SorN" ? setMbtiSorN :
                            q.dimension === "TorF" ? setMbtiTorF : setMbtiJorP;

                          return (
                            <div key={idx} className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block">
                                {idx + 1}. {q.title}
                              </span>
                              <p className="text-[9px] font-semibold text-slate-400 leading-none">{q.desc}</p>
                              
                              <div className="grid grid-cols-1 gap-2 mt-1.5">
                                {q.options.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setter(opt.value)}
                                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                      currentValue === opt.value
                                        ? "bg-blue-50 border-blue-500 shadow-xs"
                                        : "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className={`text-[10px] font-extrabold ${currentValue === opt.value ? "text-blue-600" : "text-slate-700"}`}>
                                        {opt.label}
                                      </span>
                                      <div className={`h-3 w-3 rounded-full border flex items-center justify-center shrink-0 ${
                                        currentValue === opt.value ? "border-blue-500 bg-blue-500" : "border-slate-300"
                                      }`}>
                                        {currentValue === opt.value && <div className="h-1 w-1 bg-white rounded-full" />}
                                      </div>
                                    </div>
                                    <p className="text-[9px] font-semibold text-slate-500 mt-1 leading-normal">
                                      {opt.detail}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="w-1/2 h-11 border-slate-200 text-slate-600 rounded-lg cursor-pointer font-bold text-xs"
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!inputMbti) {
                            setFormError("Silakan selesaikan diagnosis atau isian MBTI terlebih dahulu!");
                            return;
                          }
                          setFormError("");
                          setCurrentStep(3);
                        }}
                        disabled={!inputMbti}
                        className="w-1/2 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 hover:shadow-lg"
                      >
                        Lanjut
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Arah Karir & Keahlian Khusus */}
                {currentStep === 3 && (
                  <div className="space-y-5 animate-in-fade">
                    {/* Minat Karir */}
                    <div className="space-y-1.5">
                      <Label htmlFor="select-minat" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Minat Karir Utama</Label>
                      <select
                        id="select-minat"
                        value={inputMinat}
                        onChange={(e) => setInputMinat(e.target.value)}
                        required
                        className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 rounded-lg text-sm outline-none cursor-pointer font-bold text-slate-700 transition-all"
                      >
                        <option value="" disabled>-- Pilih Bidang Karir --</option>
                        {minatOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bakat Spesifik */}
                    <div className="space-y-1.5">
                      <Label htmlFor="input-bakat" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bakat / Keahlian Khusus</Label>
                      <Input
                        id="input-bakat"
                        placeholder="Contoh: Pemrograman Python, Melukis Digital, dll."
                        value={inputBakat}
                        onChange={(e) => setInputBakat(e.target.value)}
                        required
                        className="h-11 px-4 bg-slate-50/50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm outline-none font-bold"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="w-1/2 h-11 border-slate-200 text-slate-600 rounded-lg cursor-pointer font-bold text-xs"
                      >
                        Kembali
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!inputMinat || !inputBakat) {
                            setFormError("Silakan isi minat karir dan bakat spesifik siswa!");
                            return;
                          }
                          setFormError("");
                          setCurrentStep(4);
                        }}
                        disabled={!inputMinat || !inputBakat}
                        className="w-1/2 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 hover:shadow-lg"
                      >
                        Lanjut
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Ringkasan & AI Counseling Review */}
                {currentStep === 4 && (
                  <div className="space-y-5 animate-in-fade">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm font-extrabold text-sm">
                        ✓
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">Diagnosis Lengkap</span>
                        <span className="text-[11px] font-bold text-slate-600 leading-none">Profil potensi siswa telah berhasil disusun!</span>
                      </div>
                    </div>

                    {/* Diagnostic Review Cards */}
                    <div className="bg-slate-50/80 border border-slate-200/50 rounded-2xl p-4 space-y-3">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block border-b border-slate-200/40 pb-1.5">
                        Ringkasan Hasil Asesmen
                      </span>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Nama Siswa</span>
                          <span className="font-extrabold text-slate-700 block truncate">{selectedStudent?.nama}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Kecerdasan Dominan</span>
                          <span className="font-extrabold text-slate-700 block truncate">{inputDominan}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Kepribadian MBTI</span>
                          <span className="font-extrabold text-blue-700 block">{inputMbti} ({isDiagnosticMode ? "Diagnostic" : "Manual"})</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block">Arah Karir Utama</span>
                          <span className="font-extrabold text-slate-700 block truncate">{inputMinat}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={formLoading}
                        onClick={() => setCurrentStep(3)}
                        className="w-1/3 h-11 border-slate-200 text-slate-600 rounded-lg cursor-pointer font-bold text-xs"
                      >
                        Kembali
                      </Button>
                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="w-2/3 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg cursor-pointer shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {formLoading ? "Menyimpan..." : "Simpan Asesmen"}
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

              </form>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview Panel (7 Cols - WOW FACTOR) */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-100 shadow-lg rounded-3xl overflow-hidden bg-linear-to-b from-slate-900 via-slate-800 to-indigo-950 text-white min-h-[500px] flex flex-col justify-between p-8 relative">
            {/* Background dynamic light flare effect */}
            <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl -ml-20 -mb-20 pointer-events-none" />

            <div>
              {/* Header Profile Title */}
              <div className="flex justify-between items-start pb-5 border-b border-white/10 relative z-10">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    Live Analytical Card Preview
                  </span>
                  <h3 className="text-xl font-extrabold mt-3 tracking-tight">
                    {selectedStudent ? selectedStudent.nama : "Nama Siswa"}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {selectedStudent ? `NIS: ${selectedStudent.nis} • Kelas ${selectedStudent.kelas}` : "Identitas Siswa"}
                  </p>
                </div>
                <Sparkles className="h-7 w-7 text-indigo-400 animate-pulse shrink-0" />
              </div>

              {/* Assessment Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-10">
                {/* MBTI Panel */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Award className="h-4.5 w-4.5 shrink-0" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Kepribadian MBTI</span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-2xl font-extrabold tracking-tight text-blue-300">
                      {inputMbti || "----"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {inputMbti ? mbtiDetails[inputMbti]?.title : "Belum Dipilih"}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
                    {inputMbti ? mbtiDetails[inputMbti]?.desc : "Pilih tipe kepribadian untuk menampilkan analisis dasar kepribadian."}
                  </p>
                  {inputMbti && (
                    <div className="text-[8px] font-extrabold text-blue-300/90 uppercase tracking-wider mt-2 border-t border-white/5 pt-1.5 leading-relaxed">
                      {getMbtiBreakdown(inputMbti)}
                    </div>
                  )}
                </div>

                {/* Dominan Intelligence Panel */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <BrainCircuit className="h-4.5 w-4.5 shrink-0" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Kecerdasan Dominan</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-base font-extrabold text-indigo-200 leading-tight block">
                      {inputDominan || "Belum Terdefinisi"}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                      Multiple Intelligences
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 leading-relaxed">
                    Kombinasi kemampuan kognitif terbaik siswa dalam mencerna masalah dan informasi.
                  </p>
                </div>
              </div>

              {/* Minat & Bakat Details */}
              <div className="mt-5 p-4 bg-white/5 border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Target className="h-3 w-3 text-amber-500" />
                    Minat Karir Utama
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {inputMinat || "Belum Diisi"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 text-emerald-500" />
                    Bakat Spesifik
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate block">
                    {inputBakat || "Belum Diisi"}
                  </span>
                </div>
              </div>
            </div>

            {/* Counseling Guidance auto-advisory (Wow Factor) */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl space-y-2 relative z-10">
              <div className="flex items-center gap-1.5 text-blue-300">
                <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Rekomendasi Bimbingan Konseling (BK)</span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-slate-300">
                {getLiveAdvisory()}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Toast portal notification */}
      {mounted && toast && createPortal(
        <div 
          className="fixed top-6 right-6 z-[100] max-w-sm w-full bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 text-slate-800 animate-toast-in relative overflow-hidden"
          style={{ top: '24px', right: '24px', bottom: 'auto', left: 'auto', position: 'fixed' }}
        >
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
            toast.type === "success" 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100/50 shadow-xs" 
              : "bg-red-50 text-red-600 border-red-100/50 shadow-xs"
          }`}>
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-tight">Berhasil</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-snug">{toast.message}</p>
          </div>
          <div className="absolute bottom-0 left-0 h-[3px] bg-linear-to-r animate-toast-timer from-emerald-500 to-teal-400" />
        </div>,
        document.body
      )}
    </div>
  );
}
