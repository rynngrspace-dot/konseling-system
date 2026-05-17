"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  ChevronLeft, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  AlertCircle,
  Users,
  User,
  Search,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { upsertNilai, bulkUpsertNilai } from "@/actions/nilai";
import { SiswaWithNilai } from "@/types";

// Helpers
function getPredikat(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
}

function getGradeColor(predikat: string) {
  switch (predikat) {
    case "A": return "text-emerald-600 bg-emerald-50 border-emerald-100/50";
    case "B": return "text-blue-600 bg-blue-50 border-blue-100/50";
    case "C": return "text-amber-600 bg-amber-50 border-amber-100/50";
    default: return "text-rose-600 bg-rose-50 border-rose-100/50";
  }
}

interface NilaiConsoleProps {
  allStudents: SiswaWithNilai[];
  initialSiswaId: string;
  initialSemester: number;
}

export function NilaiConsole({
  allStudents,
  initialSiswaId,
  initialSemester,
}: NilaiConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode Switcher
  const [entryMode, setEntryMode] = useState<"single" | "class">("single");

  // Extracted unique classes
  const classes = Array.from(new Set(allStudents.map(s => s.kelas))).filter((k): k is string => k !== null).sort();

  // Single Student selection state
  const [selectedSiswaId, setSelectedSiswaId] = useState(initialSiswaId);
  const [semester, setSemester] = useState(initialSemester);

  // Class selection state
  const [selectedKelas, setSelectedKelas] = useState(classes[0] || "");
  const [classSearchQuery, setClassSearchQuery] = useState("");

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Score states for single mode
  const [math, setMath] = useState("");
  const [indonesian, setIndonesian] = useState("");
  const [english, setEnglish] = useState("");
  const [science, setScience] = useState("");
  const [social, setSocial] = useState("");

  // Scores state for class mode
  const [classScores, setClassScores] = useState<Record<string, {
    math: string;
    indonesian: string;
    english: string;
    science: string;
    social: string;
  }>>({});

  const currentStudent = allStudents.find(s => s.id === selectedSiswaId);
  const classStudents = allStudents.filter(s => s.kelas === selectedKelas);
  const filteredClassStudents = classStudents.filter(s => 
    s.nama.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
    s.nis.toLowerCase().includes(classSearchQuery.toLowerCase())
  );

  // Helper to extract student scores for a given semester
  const loadStudentScores = (student: SiswaWithNilai, sem: number) => {
    const mathRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "Matematika");
    const indonesianRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "Bahasa Indonesia");
    const englishRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "Bahasa Inggris");
    const scienceRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "IPA");
    const socialRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "IPS");

    setMath(mathRecord !== undefined ? mathRecord.nilai.toString() : "");
    setIndonesian(indonesianRecord !== undefined ? indonesianRecord.nilai.toString() : "");
    setEnglish(englishRecord !== undefined ? englishRecord.nilai.toString() : "");
    setScience(scienceRecord !== undefined ? scienceRecord.nilai.toString() : "");
    setSocial(socialRecord !== undefined ? socialRecord.nilai.toString() : "");
  };

  // Load scores when student or semester changes
  useEffect(() => {
    if (currentStudent) {
      loadStudentScores(currentStudent, semester);
    } else {
      setMath("");
      setIndonesian("");
      setEnglish("");
      setScience("");
      setSocial("");
    }
    setFormError("");
  }, [selectedSiswaId, semester]);

  // Load scores for all students in class mode when class or semester changes
  useEffect(() => {
    if (entryMode === "class" && selectedKelas) {
      const initialScores: typeof classScores = {};
      const filtered = allStudents.filter(s => s.kelas === selectedKelas);
      filtered.forEach(s => {
        const mathRecord = s.nilaiAkademik.find(n => n.semester === semester && n.mata_pelajaran === "Matematika");
        const indonesianRecord = s.nilaiAkademik.find(n => n.semester === semester && n.mata_pelajaran === "Bahasa Indonesia");
        const englishRecord = s.nilaiAkademik.find(n => n.semester === semester && n.mata_pelajaran === "Bahasa Inggris");
        const scienceRecord = s.nilaiAkademik.find(n => n.semester === semester && n.mata_pelajaran === "IPA");
        const socialRecord = s.nilaiAkademik.find(n => n.semester === semester && n.mata_pelajaran === "IPS");

        initialScores[s.id] = {
          math: mathRecord !== undefined ? mathRecord.nilai.toString() : "",
          indonesian: indonesianRecord !== undefined ? indonesianRecord.nilai.toString() : "",
          english: englishRecord !== undefined ? englishRecord.nilai.toString() : "",
          science: scienceRecord !== undefined ? scienceRecord.nilai.toString() : "",
          social: socialRecord !== undefined ? socialRecord.nilai.toString() : "",
        };
      });
      setClassScores(initialScores);
    }
    setFormError("");
  }, [selectedKelas, semester, entryMode, allStudents]);

  // Live calculated average for single mode
  const mathVal = math.trim() === "" ? null : parseFloat(math);
  const indonesianVal = indonesian.trim() === "" ? null : parseFloat(indonesian);
  const englishVal = english.trim() === "" ? null : parseFloat(english);
  const scienceVal = science.trim() === "" ? null : parseFloat(science);
  const socialVal = social.trim() === "" ? null : parseFloat(social);

  const filledScores = [mathVal, indonesianVal, englishVal, scienceVal, socialVal].filter((v): v is number => v !== null);
  const hasFilledScores = filledScores.length > 0;
  const rawAverage = hasFilledScores ? (filledScores.reduce((a, b) => a + b, 0) / 5) : 0;
  const average = Number(rawAverage.toFixed(1));

  // Show Toast helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Single submit handler
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaId) {
      setFormError("Silakan pilih siswa terlebih dahulu.");
      return;
    }

    setFormError("");
    setFormLoading(true);

    const scores = {
      matematika: math.trim() === "" ? null : parseFloat(math),
      indonesian: indonesian.trim() === "" ? null : parseFloat(indonesian),
      english: english.trim() === "" ? null : parseFloat(english),
      science: science.trim() === "" ? null : parseFloat(science),
      social: social.trim() === "" ? null : parseFloat(social),
    };

    // Score range validation
    const checkedValues = Object.values(scores).filter((v): v is number => v !== null);
    if (checkedValues.some(v => v < 0 || v > 100)) {
      setFormError("Rentang nilai harus berkisar dari 0 sampai 100!");
      setFormLoading(false);
      return;
    }

    const res = await upsertNilai(selectedSiswaId, semester, scores);
    setFormLoading(false);

    if (res.error) {
      setFormError(res.error);
      showToast(res.error, "error");
    } else {
      showToast("Nilai akademik berhasil disimpan!", "success");
      setTimeout(() => {
        router.push("/dashboard/bk/nilai-akademik");
        router.refresh();
      }, 800);
    }
  };

  // Class submit handler
  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKelas) {
      setFormError("Silakan pilih kelas terlebih dahulu.");
      return;
    }

    setFormError("");
    setFormLoading(true);

    const updates = classStudents.map(student => {
      const sScores = classScores[student.id] || { math: "", indonesian: "", english: "", science: "", social: "" };
      return {
        siswaId: student.id,
        semester,
        scores: {
          matematika: sScores.math.trim() === "" ? null : parseFloat(sScores.math),
          indonesian: sScores.indonesian.trim() === "" ? null : parseFloat(sScores.indonesian),
          english: sScores.english.trim() === "" ? null : parseFloat(sScores.english),
          science: sScores.science.trim() === "" ? null : parseFloat(sScores.science),
          social: sScores.social.trim() === "" ? null : parseFloat(sScores.social),
        }
      };
    });

    // Score range validation
    for (const update of updates) {
      const vals = Object.values(update.scores).filter((v): v is number => v !== null);
      if (vals.some(v => v < 0 || v > 100)) {
         setFormError("Rentang nilai seluruh siswa harus berkisar dari 0 sampai 100!");
         setFormLoading(false);
         return;
      }
    }

    const res = await bulkUpsertNilai(updates);
    setFormLoading(false);

    if (res.error) {
      setFormError(res.error);
      showToast(res.error, "error");
    } else {
      showToast(`Seluruh nilai akademik Kelas ${selectedKelas} berhasil disimpan!`, "success");
      setTimeout(() => {
        router.push("/dashboard/bk/nilai-akademik");
        router.refresh();
      }, 800);
    }
  };

  const handleClassScoreChange = (siswaId: string, field: "math" | "indonesian" | "english" | "science" | "social", val: string) => {
    setClassScores(prev => ({
      ...prev,
      [siswaId]: {
        ...(prev[siswaId] || { math: "", indonesian: "", english: "", science: "", social: "" }),
        [field]: val
      }
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in-fade">
      {/* Toast Portal */}
      {toast && createPortal(
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl px-5 py-4 rounded-2xl animate-toast-slide min-w-[320px]">
          {toast.type === "success" ? (
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-500 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Evaluasi Belajar</h4>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{toast.message}</p>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-2xl animate-toast-timer" />
        </div>,
        document.body
      )}

      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/dashboard/bk/nilai-akademik")}
          className="text-slate-600 hover:text-slate-900 flex items-center gap-2 hover:bg-slate-100/80 rounded-xl cursor-pointer py-2 pl-3 pr-4"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Kembali</span>
        </Button>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
          Workspace Nilai
        </span>
      </div>

      {/* Main Form Card */}
      <Card className="border border-slate-200/60 shadow-xl shadow-slate-100/50 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-6 px-8 pt-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100/40 text-blue-600 flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-extrabold tracking-tight text-slate-800">
                {initialSiswaId ? "Edit Nilai Rapor Siswa" : "Input & Edit Nilai Rapor Siswa"}
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs font-semibold mt-1">
                {initialSiswaId 
                  ? "Sunting nilai evaluasi belajar semesteran untuk siswa terpilih."
                  : "Masukkan nilai evaluasi belajar semesteran secara terarah per siswa atau massal per kelas."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {formError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-3 animate-in-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Tabs value={entryMode} onValueChange={(val) => setEntryMode(val as "single" | "class")} className="w-full">
            {!initialSiswaId && (
              <div className="border-b pb-2 border-slate-200 mb-6">
                <TabsList variant="line" className="w-full sm:w-auto justify-start gap-6 h-auto rounded-none bg-transparent p-0">
                  <TabsTrigger 
                    value="single" 
                    className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
                  >
                    <User className="h-4 w-4" />
                    Input Per Siswa
                  </TabsTrigger>
                  <TabsTrigger 
                    value="class" 
                    className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
                  >
                    <Users className="h-4 w-4" />
                    Input Sekaligus (Kelas)
                  </TabsTrigger>
                </TabsList>
              </div>
            )}

            <TabsContent value="single" className="animate-in-fade focus-visible:outline-none">
              <form onSubmit={handleSingleSubmit} className="space-y-6">
                {/* Siswa & Semester Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                  <div className="space-y-1.5">
                    <Label htmlFor="siswa-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pilih Siswa
                    </Label>
                    <select
                      id="siswa-select"
                      value={selectedSiswaId}
                      onChange={(e) => setSelectedSiswaId(e.target.value)}
                      required
                      disabled={!!initialSiswaId}
                      className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs outline-none cursor-pointer font-bold text-slate-700 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>-- Pilih Siswa Aktif --</option>
                      {allStudents.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nama} ({s.nis}) - Kelas {s.kelas}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="semester-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Semester Evaluasi
                    </Label>
                    <select
                      id="semester-select"
                      value={semester}
                      onChange={(e) => setSemester(parseInt(e.target.value))}
                      required
                      disabled={!!initialSiswaId}
                      className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs outline-none cursor-pointer font-bold text-slate-700 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {[1, 2, 3, 4, 5, 6].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  {currentStudent && (
                    <div className="md:col-span-2 pt-3 border-t border-slate-200/40 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Nama: <strong className="text-slate-600">{currentStudent.nama}</strong></span>
                      <span>NIS: <strong className="text-slate-600">{currentStudent.nis}</strong> • Kelas: <strong className="text-slate-600">{currentStudent.kelas}</strong></span>
                    </div>
                  )}
                </div>

                {/* Input Nilai Mata Pelajaran (Spreadsheet-like Horizontal Layout) */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block pb-1 border-b border-slate-100">
                    Nilai Mata Pelajaran (Rentang 0 - 100)
                  </span>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Matematika */}
                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/20 transition-all flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="math" className="text-xs font-bold text-slate-600 block">Matematika</Label>
                        <Input
                          id="math"
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          placeholder="0.00"
                          value={math}
                          onChange={(e) => setMath(e.target.value)}
                          disabled={!selectedSiswaId}
                          className="h-10 px-3 bg-slate-50/50 focus:bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs outline-none font-bold disabled:opacity-50 mt-1"
                        />
                      </div>
                      {mathVal !== null && (
                        <span className={`px-2 py-0.5 mt-1 text-[9px] font-bold border rounded-md text-center ${getGradeColor(getPredikat(mathVal))}`}>
                          Predikat {getPredikat(mathVal)}
                        </span>
                      )}
                    </div>

                    {/* Bahasa Indonesia */}
                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/20 transition-all flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="indonesian" className="text-xs font-bold text-slate-600 block">B. Indonesia</Label>
                        <Input
                          id="indonesian"
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          placeholder="0.00"
                          value={indonesian}
                          onChange={(e) => setIndonesian(e.target.value)}
                          disabled={!selectedSiswaId}
                          className="h-10 px-3 bg-slate-50/50 focus:bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs outline-none font-bold disabled:opacity-50 mt-1"
                        />
                      </div>
                      {indonesianVal !== null && (
                        <span className={`px-2 py-0.5 mt-1 text-[9px] font-bold border rounded-md text-center ${getGradeColor(getPredikat(indonesianVal))}`}>
                          Predikat {getPredikat(indonesianVal)}
                        </span>
                      )}
                    </div>

                    {/* Bahasa Inggris */}
                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/20 transition-all flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="english" className="text-xs font-bold text-slate-600 block">B. Inggris</Label>
                        <Input
                          id="english"
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          placeholder="0.00"
                          value={english}
                          onChange={(e) => setEnglish(e.target.value)}
                          disabled={!selectedSiswaId}
                          className="h-10 px-3 bg-slate-50/50 focus:bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs outline-none font-bold disabled:opacity-50 mt-1"
                        />
                      </div>
                      {englishVal !== null && (
                        <span className={`px-2 py-0.5 mt-1 text-[9px] font-bold border rounded-md text-center ${getGradeColor(getPredikat(englishVal))}`}>
                          Predikat {getPredikat(englishVal)}
                        </span>
                      )}
                    </div>

                    {/* IPA */}
                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/20 transition-all flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="science" className="text-xs font-bold text-slate-600 block">IPA</Label>
                        <Input
                          id="science"
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          placeholder="0.00"
                          value={science}
                          onChange={(e) => setScience(e.target.value)}
                          disabled={!selectedSiswaId}
                          className="h-10 px-3 bg-slate-50/50 focus:bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs outline-none font-bold disabled:opacity-50 mt-1"
                        />
                      </div>
                      {scienceVal !== null && (
                        <span className={`px-2 py-0.5 mt-1 text-[9px] font-bold border rounded-md text-center ${getGradeColor(getPredikat(scienceVal))}`}>
                          Predikat {getPredikat(scienceVal)}
                        </span>
                      )}
                    </div>

                    {/* IPS */}
                    <div className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/20 transition-all flex flex-col justify-between col-span-2 md:col-span-1">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="social" className="text-xs font-bold text-slate-600 block">IPS</Label>
                        <Input
                          id="social"
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          placeholder="0.00"
                          value={social}
                          onChange={(e) => setSocial(e.target.value)}
                          disabled={!selectedSiswaId}
                          className="h-10 px-3 bg-slate-50/50 focus:bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs outline-none font-bold disabled:opacity-50 mt-1"
                        />
                      </div>
                      {socialVal !== null && (
                        <span className={`px-2 py-0.5 mt-1 text-[9px] font-bold border rounded-md text-center ${getGradeColor(getPredikat(socialVal))}`}>
                          Predikat {getPredikat(socialVal)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Rerata & Submit Panel */}
                <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-blue-50/50 border border-blue-100/30 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Rata-rata Semester</span>
                      {hasFilledScores ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-extrabold text-base text-blue-700 bg-blue-50/80 px-2 rounded-md border border-blue-100/50">
                            {average}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${getGradeColor(getPredikat(average))}`}>
                            Predikat {getPredikat(average)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold mt-0.5 block">- Belum Ada Nilai -</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/bk/nilai-akademik")}
                      className="h-11 rounded-lg px-5 text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-bold tracking-wide flex-1 md:flex-initial"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading || !selectedSiswaId}
                      className="h-11 rounded-lg px-6 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs font-bold tracking-wide shadow-md shadow-blue-500/10 flex-1 md:flex-initial"
                    >
                      {formLoading ? "Menyimpan..." : "Simpan Nilai Rapor"}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="class" className="animate-in-fade focus-visible:outline-none">
              <form onSubmit={handleClassSubmit} className="space-y-6 animate-in-fade">
                {/* Class & Semester Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-slate-50/80 border border-slate-100 rounded-2xl items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor="class-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pilih Kelas
                    </Label>
                    <select
                      id="class-select"
                      value={selectedKelas}
                      onChange={(e) => setSelectedKelas(e.target.value)}
                      required
                      className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs outline-none cursor-pointer font-bold text-slate-700 transition-all"
                    >
                      {classes.map(k => (
                        <option key={k} value={k}>Kelas {k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="class-semester-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Semester Evaluasi
                    </Label>
                    <select
                      id="class-semester-select"
                      value={semester}
                      onChange={(e) => setSemester(parseInt(e.target.value))}
                      required
                      className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs outline-none cursor-pointer font-bold text-slate-700 transition-all"
                    >
                      {[1, 2, 3, 4, 5, 6].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Instant Student Filter Search */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Cari siswa di kelas..."
                      value={classSearchQuery}
                      onChange={(e) => setClassSearchQuery(e.target.value)}
                      className="h-11 pl-10 pr-4 bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* Spreadsheet bulk table container */}
                <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-inner bg-slate-50/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-5 py-4 text-center w-12">No</th>
                          <th className="px-5 py-4 min-w-[200px]">Siswa</th>
                          <th className="px-4 py-4 text-center">Matematika</th>
                          <th className="px-4 py-4 text-center">B. Indonesia</th>
                          <th className="px-4 py-4 text-center">B. Inggris</th>
                          <th className="px-4 py-4 text-center">IPA</th>
                          <th className="px-4 py-4 text-center">IPS</th>
                          <th className="px-5 py-4 text-center w-24">Rata-rata</th>
                          <th className="px-5 py-4 text-center w-20">Predikat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredClassStudents.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-5 py-12 text-center text-slate-400 text-xs font-semibold">
                              Tidak ada siswa yang ditemukan di kelas ini.
                            </td>
                          </tr>
                        ) : (
                          filteredClassStudents.map((student, idx) => {
                            const sScores = classScores[student.id] || { math: "", indonesian: "", english: "", science: "", social: "" };
                            
                            // Compute average live
                            const m = sScores.math.trim() === "" ? null : parseFloat(sScores.math);
                            const ind = sScores.indonesian.trim() === "" ? null : parseFloat(sScores.indonesian);
                            const eng = sScores.english.trim() === "" ? null : parseFloat(sScores.english);
                            const sci = sScores.science.trim() === "" ? null : parseFloat(sScores.science);
                            const soc = sScores.social.trim() === "" ? null : parseFloat(sScores.social);

                            const values = [m, ind, eng, sci, soc].filter((v): v is number => v !== null);
                            const hasVals = values.length > 0;
                            const avgVal = hasVals ? Number((values.reduce((a, b) => a + b, 0) / 5).toFixed(1)) : 0;

                            return (
                              <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="px-5 py-3 text-center text-xs font-semibold text-slate-400">{idx + 1}</td>
                                <td className="px-5 py-3">
                                  <div className="text-xs font-bold text-slate-800 leading-tight">{student.nama}</div>
                                  <div className="text-[10px] font-semibold text-slate-400 mt-0.5">NIS: {student.nis}</div>
                                </td>
                                
                                {/* Math */}
                                <td className="px-4 py-3 text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="-"
                                    value={sScores.math}
                                    onChange={(e) => handleClassScoreChange(student.id, "math", e.target.value)}
                                    className="h-9 w-20 text-center mx-auto bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs font-bold"
                                  />
                                </td>
                                
                                {/* Indonesian */}
                                <td className="px-4 py-3 text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="-"
                                    value={sScores.indonesian}
                                    onChange={(e) => handleClassScoreChange(student.id, "indonesian", e.target.value)}
                                    className="h-9 w-20 text-center mx-auto bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs font-bold"
                                  />
                                </td>

                                {/* English */}
                                <td className="px-4 py-3 text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="-"
                                    value={sScores.english}
                                    onChange={(e) => handleClassScoreChange(student.id, "english", e.target.value)}
                                    className="h-9 w-20 text-center mx-auto bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs font-bold"
                                  />
                                </td>

                                {/* Science */}
                                <td className="px-4 py-3 text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="-"
                                    value={sScores.science}
                                    onChange={(e) => handleClassScoreChange(student.id, "science", e.target.value)}
                                    className="h-9 w-20 text-center mx-auto bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs font-bold"
                                  />
                                </td>

                                {/* Social */}
                                <td className="px-4 py-3 text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="-"
                                    value={sScores.social}
                                    onChange={(e) => handleClassScoreChange(student.id, "social", e.target.value)}
                                    className="h-9 w-20 text-center mx-auto bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs font-bold"
                                  />
                                </td>

                                {/* Live Average */}
                                <td className="px-5 py-3 text-center">
                                  {hasVals ? (
                                    <span className="font-extrabold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100/50">
                                      {avgVal}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-xs font-semibold">-</span>
                                  )}
                                </td>

                                {/* Live Predicate */}
                                <td className="px-5 py-3 text-center">
                                  {hasVals ? (
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${getGradeColor(getPredikat(avgVal))}`}>
                                      {getPredikat(avgVal)}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-xs font-semibold">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons Panel */}
                <div className="border-t border-slate-100 pt-6 mt-6 flex items-center justify-between gap-4">
                  <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
                    * Ketikkan nilai (0 - 100) langsung ke baris siswa yang bersangkutan. Klik simpan untuk merekam perubahan massal.
                  </p>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/bk/nilai-akademik")}
                      className="h-11 rounded-lg px-5 text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-bold tracking-wide flex-1 sm:flex-initial"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading || classStudents.length === 0}
                      className="h-11 rounded-lg px-6 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs font-bold tracking-wide shadow-md shadow-blue-500/10 flex-1 sm:flex-initial"
                    >
                      {formLoading ? "Menyimpan Massal..." : `Simpan Nilai Kelas ${selectedKelas}`}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
