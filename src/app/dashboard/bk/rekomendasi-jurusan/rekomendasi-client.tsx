"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  Search, 
  Compass, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  BrainCircuit, 
  Activity, 
  Database, 
  Save, 
  UserCheck, 
  Eye, 
  Trash2,
  AlertCircle,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  X,
  Layers,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { calculateRecommendation, saveRecommendation, deleteRecommendation } from "@/actions/rekomendasi";

interface RecommendationItem {
  id: string;
  siswaId: string;
  siswa: {
    nama: string;
    nis: string;
    kelas: string | null;
  };
  hasil_decision_tree: string;
  hasil_naive_bayes: string;
  rekomendasi_akhir: string;
  detail_persentase: any;
  tanggal: Date;
}

interface StudentItem {
  id: string;
  nama: string;
  nis: string;
  kelas: string | null;
  minatBakat: {
    minat: string;
    bakat: string;
  }[];
  nilaiAkademik: {
    id: string;
  }[];
}

const getAlternative = (item: any) => {
  const detail = item.detail_persentase as any;
  if (detail?.alternative?.prediction) {
    return detail.alternative.prediction;
  }
  // Fallback if not saved in JSON: read from Naive Bayes probabilities
  const probs = detail?.nb?.probabilities;
  if (probs && probs.length > 1) {
    if (probs[0].className !== item.rekomendasi_akhir) {
      return probs[0].className;
    } else {
      return probs[1].className;
    }
  }
  return "-";
};

const formatReason = (text: string) => {
  if (!text) return "";
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">$1</strong>');
};

interface RekomendasiClientProps {
  recommendations: RecommendationItem[];
  allStudents: StudentItem[];
}

export function RekomendasiClient({
  recommendations,
  allStudents
}: RekomendasiClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode: "list" (main dashboard table) or "generate" (algorithm wizard)
  const [mode, setMode] = useState<"list" | "generate">("list");

  // Main list filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("all");

  // Selection & calculation state
  const [selectedSiswaId, setSelectedSiswaId] = useState("");
  const [isSearchingSiswa, setIsSearchingSiswa] = useState(false);
  const [studentFound, setStudentFound] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Detail Modal / Drawer state
  const [activeDetail, setActiveDetail] = useState<RecommendationItem | null>(null);

  // Delete Confirmation state
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);

  // Form notifications
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sort all students alphabetically
  const sortedStudents = [...allStudents].sort((a, b) => a.nama.localeCompare(b.nama));

  // List filter logic
  const filteredRecs = recommendations.filter(item => {
    const matchesSearch = item.siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.siswa.nis.includes(searchQuery);
    const matchesKelas = selectedKelas === "all" || item.siswa.kelas === selectedKelas;
    return matchesSearch && matchesKelas;
  });

  // Unique classes extract for list view filter
  const classes = Array.from(new Set(recommendations.map(r => r.siswa.kelas))).filter((k): k is string => k !== null).sort();

  // Search single student for wizard
  const handleStudentSearch = async () => {
    if (!selectedSiswaId) return;

    // Check if recommendation already exists to prevent duplicate generation
    const alreadyHasRec = recommendations.some(r => r.siswaId === selectedSiswaId);
    if (alreadyHasRec) {
      setFormError("Rekomendasi untuk siswa ini sudah pernah dibuat. Silakan hapus rekomendasi sebelumnya terlebih dahulu jika ingin membuat rekomendasi baru.");
      setStudentFound(null);
      setCalcResult(null);
      return;
    }

    setIsSearchingSiswa(true);
    setFormError("");
    setCalcResult(null);

    // Call server action to check eligibility and load stats
    const res = await calculateRecommendation(selectedSiswaId);
    setIsSearchingSiswa(false);

    if (res.error) {
      setFormError(res.error);
      setStudentFound(null);
    } else if (res.incomplete) {
      setStudentFound(res.studentData);
      setFormError("");
    } else {
      setStudentFound(res.studentData);
      setFormError("");
    }
  };

  // Run machine learning algorithms
  const handleRunAlgorithms = async () => {
    if (!selectedSiswaId) return;
    setIsCalculating(true);
    setFormError("");

    const res = await calculateRecommendation(selectedSiswaId);
    setIsCalculating(false);

    if (res.error) {
      setFormError(res.error);
    } else {
      setCalcResult(res);
      showToast("Analisis Decision Tree & Naive Bayes berhasil diselesaikan!", "success");
    }
  };

  // Save the result to the database
  const handleSaveResult = async () => {
    if (!calcResult) return;
    setIsCalculating(true);
    setFormError("");

    const payload = {
      siswaId: calcResult.studentData.id,
      hasilDecisionTree: `${calcResult.decisionTree.prediction} (${calcResult.decisionTree.confidence})`,
      hasilNaiveBayes: `${calcResult.naiveBayes.prediction} (${calcResult.naiveBayes.confidence})`,
      rekomendasiAkhir: calcResult.final.prediction,
      detailPersentase: {
        confidence: calcResult.final.confidence,
        reason: calcResult.final.reason,
        alternative: {
          prediction: calcResult.final.alternativePrediction,
          confidence: calcResult.final.alternativeConfidence
        },
        dt: calcResult.decisionTree,
        nb: calcResult.naiveBayes,
        studentData: calcResult.studentData
      }
    };

    const res = await saveRecommendation(payload);
    setIsCalculating(false);

    if (res.error) {
      setFormError(res.error);
      showToast(res.error, "error");
    } else {
      showToast("Rekomendasi jurusan berhasil disimpan!", "success");
      setMode("list");
      // Reset wizard
      setSelectedSiswaId("");
      setStudentFound(null);
      setCalcResult(null);
      router.refresh();
    }
  };

  // Delete a recommendation
  const handleDelete = async () => {
    if (!activeDeleteId) return;
    setIsCalculating(true);
    
    const res = await deleteRecommendation(activeDeleteId);
    setIsCalculating(false);
    setActiveDeleteId(null);

    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Rekomendasi jurusan berhasil dihapus!", "success");
      router.refresh();
    }
  };

  const handleResetWizard = () => {
    setSelectedSiswaId("");
    setStudentFound(null);
    setCalcResult(null);
    setFormError("");
    setMode("list");
  };

  return (
    <div className="space-y-6 pb-12 animate-in-fade">
      {/* Toast Notification */}
      {toast && createPortal(
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl px-5 py-4 rounded-2xl animate-toast-slide min-w-[320px]">
          {toast.type === "success" ? (
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-500 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Inferensi Cerdas BK</h4>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{toast.message}</p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-2xl animate-toast-timer" />
        </div>,
        document.body
      )}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100/50 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
            <Compass className="h-6 w-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Rekomendasi Jurusan</h1>
            <p className="text-slate-500 mt-0.5 text-xs font-semibold">
              Kalkulasi rekomendasi penjurusan SMA/SMK berbasis algoritma Decision Tree & Naive Bayes.
            </p>
          </div>
        </div>

        {mode === "list" ? (
          <Button 
            onClick={() => setMode("generate")} 
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 px-5 text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0 flex items-center gap-2"
          >
            <Compass className="h-4 w-4" />
            Mulai Kalkulasi AI
          </Button>
        ) : (
          <Button 
            variant="ghost"
            onClick={handleResetWizard} 
            className="text-slate-600 hover:text-slate-900 flex items-center gap-2 hover:bg-slate-100/80 rounded-xl cursor-pointer py-2 pl-3 pr-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Kembali</span>
          </Button>
        )}
      </div>

      {mode === "list" ? (
        // ==========================================
        // 📋 VIEW 1: REKAPITULASI LAPORAN
        // ==========================================
        <>
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 gap-3 w-full sm:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Cari nama atau NIS siswa..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-500 rounded-lg shadow-none focus-visible:outline-none focus-visible:ring-0"
                />
              </div>
              
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm outline-none cursor-pointer font-medium text-slate-600 transition-all shrink-0"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recommendations Table */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 w-16 text-center">No</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6">Siswa</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 text-center w-40">Decision Tree</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 text-center w-40">Naive Bayes</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 text-center w-44">Rekomendasi Utama</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 text-center w-44">Rekomendasi Alternatif</TableHead>
                    <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 text-center w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {filteredRecs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        Belum ada laporan rekomendasi yang dicatat atau data tidak ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecs.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-none group">
                        <TableCell className="text-center text-xs font-semibold text-slate-400 px-6 py-4">{idx + 1}</TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800 leading-tight">{item.siswa.nama}</div>
                          <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                            NIS: {item.siswa.nis} • Kelas {item.siswa.kelas || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center px-6 py-4 text-xs font-semibold text-slate-600">
                          {item.hasil_decision_tree}
                        </TableCell>
                        <TableCell className="text-center px-6 py-4 text-xs font-semibold text-slate-600">
                          {item.hasil_naive_bayes}
                        </TableCell>
                        <TableCell className="text-center px-6 py-4">
                          <span className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs">
                            {item.rekomendasi_akhir}
                          </span>
                        </TableCell>
                        <TableCell className="text-center px-6 py-4">
                          {getAlternative(item) !== "-" ? (
                            <span className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs">
                              {getAlternative(item)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setActiveDetail(item)}
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" 
                              title="Lihat Analisis Detail"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setActiveDeleteId(item.id)}
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="Hapus Rekomendasi"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        // ==========================================
        // 🔮 VIEW 2: SMART CALCULATION WIZARD
        // ==========================================
        <div className="space-y-6">
          {/* Step 1: Select Student */}
          <Card className="border border-slate-200/60 shadow-xl shadow-slate-100/50 rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-5 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100/30 text-blue-600 flex items-center justify-center shrink-0">
                  <UserCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-800">Langkah 1: Pilih Siswa Aktif</CardTitle>
                  <CardDescription className="text-[11px] text-slate-400 font-semibold mt-0.5">Siswa harus memiliki data Nilai Akademik dan Minat Bakat yang lengkap.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-3 animate-in-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <select
                    value={selectedSiswaId}
                    onChange={(e) => {
                      setSelectedSiswaId(e.target.value);
                      setStudentFound(null);
                      setCalcResult(null);
                      setFormError("");
                    }}
                    className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs outline-none cursor-pointer font-bold text-slate-700 transition-all"
                  >
                    <option value="" disabled>-- Pilih Siswa --</option>
                    {sortedStudents.map(s => {
                      const isComplete = s.minatBakat.length > 0 && s.nilaiAkademik.length > 0;
                      const alreadyHasRec = recommendations.some(r => r.siswaId === s.id);
                      return (
                        <option key={s.id} value={s.id} disabled={alreadyHasRec}>
                          {s.nama} ({s.nis}) - Kelas {s.kelas || "-"} {alreadyHasRec ? "🔒 (Rekomendasi Sudah Ada)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <Button
                  onClick={handleStudentSearch}
                  disabled={!selectedSiswaId || isSearchingSiswa || isCalculating}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 px-6 text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all border-0 shrink-0"
                >
                  {isSearchingSiswa ? "Memuat Data..." : "Load Data Profil"}
                </Button>
              </div>

              {/* Student Found Profile Summary */}
              {studentFound && (
                <div className="mt-4 p-5 bg-slate-50/80 border border-slate-100 rounded-xl space-y-4 animate-in-fade">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200/50">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{studentFound.nama}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        NIS: {studentFound.nis} • Kelas: {studentFound.kelas || "-"} • Gender: {studentFound.gender}
                      </p>
                    </div>
                    {studentFound.hasGrades !== undefined && (!studentFound.hasGrades || !studentFound.hasMinatBakat) ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200/50 shadow-2xs">
                        Incomplete Data
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100/60 shadow-2xs">
                        Ready For Classification
                      </span>
                    )}
                  </div>

                  {studentFound.hasGrades !== undefined && (!studentFound.hasGrades || !studentFound.hasMinatBakat) ? (
                    <div className="p-4 bg-amber-50/40 border border-amber-200/50 rounded-xl space-y-3.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Persyaratan Data Belum Lengkap</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Sistem membutuhkan seluruh berkas pendukung berikut untuk dapat memproses kalkulasi inferensi secara akurat:</p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        <div className={`p-3 rounded-xl border flex flex-col justify-between gap-3 ${studentFound.hasGrades ? 'bg-emerald-50/30 border-emerald-100/30' : 'bg-rose-50/30 border-rose-100/30'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${studentFound.hasGrades ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Data Nilai Rapor (11 Mapel)</span>
                          </div>
                          {studentFound.hasGrades ? (
                            <span className="text-[10px] font-bold text-emerald-600">✓ Sudah lengkap terinput</span>
                          ) : (
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-rose-500 block">❌ Belum diisi</span>
                              <a href="/dashboard/bk/nilai-akademik" className="inline-flex items-center text-[10px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline gap-1 bg-white border border-slate-100 px-3 py-1.5 rounded-lg shadow-2xs">
                                <span>Input Nilai Sekarang</span>
                                <ArrowRight className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className={`p-3 rounded-xl border flex flex-col justify-between gap-3 ${studentFound.hasMinatBakat ? 'bg-emerald-50/30 border-emerald-100/30' : 'bg-rose-50/30 border-rose-100/30'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${studentFound.hasMinatBakat ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Evaluasi Minat & Bakat</span>
                          </div>
                          {studentFound.hasMinatBakat ? (
                            <span className="text-[10px] font-bold text-emerald-600">✓ Sudah lengkap terinput</span>
                          ) : (
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-rose-500 block">❌ Belum diisi</span>
                              <a href="/dashboard/bk/minat-bakat" className="inline-flex items-center text-[10px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline gap-1 bg-white border border-slate-100 px-3 py-1.5 rounded-lg shadow-2xs">
                                <span>Input Minat & Bakat</span>
                                <ArrowRight className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs cursor-help hover:border-blue-300 transition-all duration-300">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Rerata STEM</span>
                                <span className="font-extrabold text-sm text-slate-700">{studentFound.stemAvg}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg shadow-xl">
                              <p className="text-[10px] font-extrabold text-blue-400 mb-0.5">Sains, Teknologi, Teknik & Matematika</p>
                              <p className="text-[9px] text-slate-300 leading-normal font-semibold">Rerata nilai mata pelajaran: Matematika, IPA, dan Informatika.</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs cursor-help hover:border-blue-300 transition-all duration-300">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Rerata Sosial</span>
                                <span className="font-extrabold text-sm text-slate-700">{studentFound.sosialAvg}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg shadow-xl">
                              <p className="text-[10px] font-extrabold text-amber-400 mb-0.5">Ilmu Pengetahuan Sosial</p>
                              <p className="text-[9px] text-slate-300 leading-normal font-semibold">Rerata nilai mata pelajaran: IPS, Pendidikan Pancasila, dan PAI.</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs cursor-help hover:border-blue-300 transition-all duration-300">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Rerata Bahasa</span>
                                <span className="font-extrabold text-sm text-slate-700">{studentFound.bahasaAvg}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-lg shadow-xl">
                              <p className="text-[10px] font-extrabold text-emerald-400 mb-0.5">Ilmu Bahasa & Budaya</p>
                              <p className="text-[9px] text-slate-300 leading-normal font-semibold">Rerata nilai mata pelajaran: Bahasa Indonesia, Inggris, dan Sunda.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Minat Utama</span>
                          <span className="font-extrabold text-sm text-blue-600">{studentFound.minat}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Bakat Dominan</span>
                          <span className="font-extrabold text-sm text-indigo-600">{studentFound.bakat}</span>
                        </div>
                      </div>

                      {!calcResult && (
                        <div className="pt-2 flex justify-end">
                          <Button
                            onClick={handleRunAlgorithms}
                            disabled={isCalculating}
                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg h-10 px-6 text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all border-0 flex items-center gap-2"
                          >
                            <BrainCircuit className="h-4 w-4" />
                            Jalankan Klasifikasi AI
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loader calculating */}
          {isCalculating && (
            <div className="flex flex-col items-center justify-center py-12 bg-white border border-slate-100 shadow-xs rounded-2xl space-y-3 animate-in-fade">
              <div className="relative flex items-center justify-center">
                <div className="h-10 w-10 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                <Sparkles className="absolute h-4 w-4 text-blue-500 animate-pulse" />
              </div>
              <div className="text-center">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Matriks Probabilitas Inferensi</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Mengukur Entropy Split & Bayesian Prior Likelihoods...</p>
              </div>
            </div>
          )}

          {/* Step 2: Display Side by Side Mathematical Outputs */}
          {calcResult && !isCalculating && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Decision Tree Split Details */}
                <Card className="border border-slate-200/60 shadow-md rounded-2xl bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <BrainCircuit className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-bold text-slate-800">1. Algoritma Decision Tree</CardTitle>
                        <CardDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Classification Split-Path</CardDescription>
                      </div>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100/30">
                      Akurasi {calcResult.decisionTree.confidence}
                    </span>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Prediksi Pohon Keputusan:</span>
                      <span className="font-extrabold text-sm text-indigo-700 mt-1 block">{calcResult.decisionTree.prediction}</span>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Node Split Traversal:</span>
                      <div className="space-y-1.5">
                        {calcResult.decisionTree.nodes.map((node: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-white border border-slate-100 rounded-lg shadow-2xs">
                            <span className="text-slate-500 font-semibold">{node.parameter}</span>
                            <span className="font-extrabold text-slate-700">{node.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Naive Bayes Probabilities Details */}
                <Card className="border border-slate-200/60 shadow-md rounded-2xl bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100/50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <Database className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-bold text-slate-800">2. Algoritma Naive Bayes</CardTitle>
                        <CardDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Posterior Probabilities Matrix</CardDescription>
                      </div>
                    </div>
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100/30">
                      Akurasi {calcResult.naiveBayes.confidence}
                    </span>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Prediksi Bayes Terbesar:</span>
                      <span className="font-extrabold text-sm text-amber-700 mt-1 block">{calcResult.naiveBayes.prediction}</span>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Distribusi Probabilitas Kelas:</span>
                      <div className="space-y-1.5">
                        {calcResult.naiveBayes.probabilities.map((prob: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-white border border-slate-100 rounded-lg shadow-2xs">
                            <span className="text-slate-600 font-semibold">{prob.className}</span>
                            <span className="font-extrabold text-slate-700 bg-slate-50 px-2 py-0.5 border border-slate-100 rounded">{prob.prob}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step 3: Final Decision Card */}
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-6 md:p-8 shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Compass className="w-48 h-48 text-blue-600" />
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                      <Award className="h-5.5 w-5.5 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-800">Rekomendasi Penjurusan Final</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Consensus Engine Output</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-2 space-y-5">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Jurusan Direkomendasikan:</span>
                          <span className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-md font-extrabold text-sm tracking-wide">
                            {calcResult.final.prediction}
                          </span>
                        </div>
                        {calcResult.final.alternativePrediction && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Rekomendasi Alternatif:</span>
                            <span className="inline-block bg-amber-50/80 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl font-extrabold text-sm shadow-2xs">
                              {calcResult.final.alternativePrediction} ({calcResult.final.alternativeConfidence})
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Tingkat Keyakinan:</span>
                          <span className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl font-extrabold text-sm shadow-2xs">
                            {calcResult.final.confidence} Confidence
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Dasar Keputusan AI:</span>
                        <p 
                          className="text-xs text-slate-600 bg-white/70 p-4 rounded-xl border border-slate-100 leading-relaxed font-medium"
                          dangerouslySetInnerHTML={{ __html: formatReason(calcResult.final.reason) }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleSaveResult}
                        disabled={isCalculating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 text-xs font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all border-0 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="h-4 w-4" />
                        Simpan Rekomendasi
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetWizard}
                        className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg h-11 text-xs font-bold cursor-pointer"
                      >
                        Reset / Batalkan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {activeDeleteId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in-fade">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm overflow-hidden animate-in-scale">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Hapus Rekomendasi</h3>
                <p className="text-slate-500 text-[11px] font-semibold px-4 leading-relaxed mt-1">
                  Apakah Anda yakin ingin menghapus data rekomendasi ini? Tindakan ini bersifat permanen.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveDeleteId(null)}
                className="rounded-lg h-9 text-slate-600 shadow-none hover:bg-slate-100 cursor-pointer w-24 text-xs font-bold"
              >
                Batal
              </Button>
              <Button 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-9 px-4 cursor-pointer w-24 text-xs font-bold"
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- DETAIL MODAL DRAWER --- */}
      {activeDetail && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in-fade">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-in-scale flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Detail Rekomendasi Jurusan</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setActiveDetail(null)}
                className="h-8 w-8 hover:bg-slate-200/50 rounded-lg cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeDetail.detail_persentase?.alternative?.prediction ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4 pb-4 border-b border-slate-100`}>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Siswa</span>
                  <span className="font-extrabold text-xs text-slate-700 block mt-0.5">{activeDetail.siswa.nama}</span>
                  <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">NIS: {activeDetail.siswa.nis} • Kelas {activeDetail.siswa.kelas || "-"}</span>
                </div>
                <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/20">
                  <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider block">Rekomendasi Akhir</span>
                  <span className="font-extrabold text-xs text-blue-700 block mt-0.5">{activeDetail.rekomendasi_akhir}</span>
                </div>
                {activeDetail.detail_persentase?.alternative?.prediction && (
                  <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-100/20">
                    <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider block">Rekomendasi Alternatif</span>
                    <span className="font-extrabold text-xs text-amber-700 block mt-0.5">
                      {activeDetail.detail_persentase.alternative.prediction} ({activeDetail.detail_persentase.alternative.confidence})
                    </span>
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tanggal Dibuat</span>
                  <span className="font-extrabold text-xs text-slate-600 block mt-0.5">
                    {new Date(activeDetail.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </div>

              {/* Custom detailed metadata */}
              {activeDetail.detail_persentase && (
                <div className="space-y-5">
                  <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-100 rounded-2xl space-y-2.5">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Dasar Rekomendasi / Keterangan:</span>
                    <p 
                      className="text-xs text-slate-600 leading-relaxed font-medium"
                      dangerouslySetInnerHTML={{ __html: formatReason(activeDetail.detail_persentase.reason) }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Decision Tree Card */}
                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-2xs space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                          <BrainCircuit className="h-3.5 w-3.5" />
                          Decision Tree
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{activeDetail.detail_persentase.dt?.confidence || "92%"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">Hasil Prediksi:</span>
                        <span className="text-xs font-extrabold text-slate-700 block mt-0.5">{activeDetail.detail_persentase.dt?.prediction}</span>
                      </div>
                      <div className="space-y-1 mt-2">
                        <span className="text-[9px] text-slate-400 font-bold block">Keputusan Cabang:</span>
                        {activeDetail.detail_persentase.dt?.nodes?.map((node: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-[10px] p-1.5 bg-slate-50 rounded border border-slate-100">
                            <span className="text-slate-500 font-semibold">{node.parameter}</span>
                            <span className="font-extrabold text-slate-700">{node.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Naive Bayes Card */}
                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-2xs space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Database className="h-3.5 w-3.5" />
                          Naive Bayes
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{activeDetail.detail_persentase.nb?.confidence || "88%"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">Hasil Prediksi:</span>
                        <span className="text-xs font-extrabold text-slate-700 block mt-0.5">{activeDetail.detail_persentase.nb?.prediction}</span>
                      </div>
                      <div className="space-y-1 mt-2">
                        <span className="text-[9px] text-slate-400 font-bold block">Distribusi Probabilitas Teratas:</span>
                        {activeDetail.detail_persentase.nb?.probabilities?.map((prob: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-[10px] p-1.5 bg-slate-50 rounded border border-slate-100">
                            <span className="text-slate-500 font-semibold truncate max-w-[150px]">{prob.className}</span>
                            <span className="font-extrabold text-slate-700">{prob.prob}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <Button 
                onClick={() => setActiveDetail(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 px-5 cursor-pointer text-xs font-bold"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
