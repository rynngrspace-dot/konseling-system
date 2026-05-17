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
          setInputMbti(detail?.mbti || "");
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
        setInputMbti(detail?.mbti || "");
      } else {
        setInputMinat("");
        setInputBakat("");
        setInputDominan("");
        setInputMbti("");
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
          className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-semibold text-xs px-3 h-9 rounded-xl transition-all cursor-pointer"
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
                Formulir Asesmen
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-400 mt-1">
                Isi data asesmen psikologi dan arah minat bakat siswa secara lengkap.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2 animate-in-shake">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Select Student */}
                <div className="space-y-1.5">
                  <Label htmlFor="student-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Siswa</Label>
                  <select
                    id="student-select"
                    value={selectedStudent?.id || ""}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    required
                    disabled={!!initialSiswaId}
                    className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 rounded-xl text-sm outline-none cursor-pointer font-bold text-slate-700 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>-- Pilih Siswa --</option>
                    {allStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.nis}) - Kelas {s.kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Kecerdasan Dominan */}
                  <div className="space-y-1.5">
                    <Label htmlFor="select-dominan" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kecerdasan Dominan</Label>
                    <select
                      id="select-dominan"
                      value={inputDominan}
                      onChange={(e) => setInputDominan(e.target.value)}
                      required
                      disabled={!selectedStudent}
                      className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 rounded-xl text-xs outline-none cursor-pointer font-bold text-slate-700 transition-all disabled:opacity-50"
                    >
                      <option value="" disabled>-- Pilih --</option>
                      {dominanOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* MBTI Personality */}
                  <div className="space-y-1.5">
                    <Label htmlFor="select-mbti" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kepribadian MBTI</Label>
                    <select
                      id="select-mbti"
                      value={inputMbti}
                      onChange={(e) => setInputMbti(e.target.value)}
                      required
                      disabled={!selectedStudent}
                      className="h-11 w-full px-4 bg-slate-50/50 border-slate-200/80 focus:border-blue-500 rounded-xl text-xs outline-none cursor-pointer font-bold text-slate-700 transition-all disabled:opacity-50"
                    >
                      <option value="" disabled>-- Pilih --</option>
                      {mbtiOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Minat Karir */}
                <div className="space-y-1.5">
                  <Label htmlFor="select-minat" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Minat Karir Utama</Label>
                  <select
                    id="select-minat"
                    value={inputMinat}
                    onChange={(e) => setInputMinat(e.target.value)}
                    required
                    disabled={!selectedStudent}
                    className="h-11 w-full px-4 bg-slate-50/50 border-slate-200/80 focus:border-blue-500 rounded-xl text-sm outline-none cursor-pointer font-bold text-slate-700 transition-all disabled:opacity-50"
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
                    disabled={!selectedStudent}
                    className="h-11 px-4 bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl text-sm outline-none font-bold disabled:opacity-50"
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={formLoading || !selectedStudent}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? "Menyimpan Asesmen..." : "Simpan Asesmen"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
