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

export const SUBJECTS = [
  { dbKey: "PAI", label: "PAI" },
  { dbKey: "Indonesia", label: "B. Indonesia" },
  { dbKey: "Matematika", label: "Matematika" },
  { dbKey: "Pendidikan Pancasila", label: "Pancasila" },
  { dbKey: "IPS", label: "IPS" },
  { dbKey: "IPA", label: "IPA" },
  { dbKey: "Inggris", label: "B. Inggris" },
  { dbKey: "Informatika", label: "Informatika" },
  { dbKey: "Sunda", label: "B. Sunda" },
  { dbKey: "Penjaskes", label: "Penjaskes" },
  { dbKey: "Prakarya", label: "Prakarya" }
];

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

  // Dynamic scores state for single mode (dbKey -> scoreString)
  const [singleScores, setSingleScores] = useState<Record<string, string>>({});

  // Dynamic scores state for class mode (studentId -> dbKey -> scoreString)
  const [classScores, setClassScores] = useState<Record<string, Record<string, string>>>({});

  const currentStudent = allStudents.find(s => s.id === selectedSiswaId);
  const classStudents = allStudents.filter(s => s.kelas === selectedKelas);
  const filteredClassStudents = classStudents.filter(s => 
    s.nama.toLowerCase().includes(classSearchQuery.toLowerCase()) ||
    s.nis.toLowerCase().includes(classSearchQuery.toLowerCase())
  );

  // Helper to extract student scores for a given semester
  const loadStudentScores = (student: SiswaWithNilai, sem: number) => {
    const loaded: Record<string, string> = {};
    SUBJECTS.forEach(subj => {
      const rec = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === subj.dbKey);
      loaded[subj.dbKey] = rec !== undefined ? rec.nilai.toString() : "";
    });
    setSingleScores(loaded);
  };

  // Load scores when student or semester changes
  useEffect(() => {
    if (currentStudent) {
      loadStudentScores(currentStudent, semester);
    } else {
      const empty: Record<string, string> = {};
      SUBJECTS.forEach(subj => { empty[subj.dbKey] = ""; });
      setSingleScores(empty);
    }
    setFormError("");
  }, [selectedSiswaId, semester]);

  // Load scores for all students in class mode when class or semester changes
  useEffect(() => {
    if (entryMode === "class" && selectedKelas) {
      const loadedClass: Record<string, Record<string, string>> = {};
      const filtered = allStudents.filter(s => s.kelas === selectedKelas);
      filtered.forEach(s => {
        loadedClass[s.id] = {};
        SUBJECTS.forEach(subj => {
          const rec = s.nilaiAkademik.find(n => n.semester === semester && n.mata_pelajaran === subj.dbKey);
          loadedClass[s.id][subj.dbKey] = rec !== undefined ? rec.nilai.toString() : "";
        });
      });
      setClassScores(loadedClass);
    }
    setFormError("");
  }, [selectedKelas, semester, entryMode, allStudents]);

  // Live calculated average for single mode
  const parsedScores = SUBJECTS.map(subj => {
    const val = singleScores[subj.dbKey] || "";
    return val.trim() === "" ? null : parseFloat(val);
  });
  const filledScores = parsedScores.filter((v): v is number => v !== null);
  const hasFilledScores = filledScores.length > 0;
  const rawAverage = hasFilledScores ? (filledScores.reduce((a, b) => a + b, 0) / filledScores.length) : 0;
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

    const payload: Record<string, number | null> = {};
    let hasInvalidRange = false;

    SUBJECTS.forEach(subj => {
      const val = singleScores[subj.dbKey] || "";
      if (val.trim() === "") {
        payload[subj.dbKey] = null;
      } else {
        const num = parseFloat(val);
        if (num < 0 || num > 100) {
          hasInvalidRange = true;
        }
        payload[subj.dbKey] = num;
      }
    });

    if (hasInvalidRange) {
      setFormError("Rentang nilai harus berkisar dari 0 sampai 100!");
      setFormLoading(false);
      return;
    }

    const res = await upsertNilai(selectedSiswaId, semester, payload);
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

    let hasInvalidRange = false;

    const updates = classStudents.map(student => {
      const sScores = classScores[student.id] || {};
      const payload: Record<string, number | null> = {};

      SUBJECTS.forEach(subj => {
        const val = sScores[subj.dbKey] || "";
        if (val.trim() === "") {
          payload[subj.dbKey] = null;
        } else {
          const num = parseFloat(val);
          if (num < 0 || num > 100) {
            hasInvalidRange = true;
          }
          payload[subj.dbKey] = num;
        }
      });

      return {
        siswaId: student.id,
        semester,
        scores: payload,
      };
    });

    if (hasInvalidRange) {
      setFormError("Rentang nilai seluruh siswa harus berkisar dari 0 sampai 100!");
      setFormLoading(false);
      return;
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

  const handleScoreChange = (dbKey: string, val: string) => {
    setSingleScores(prev => ({
      ...prev,
      [dbKey]: val
    }));
  };

  const handleClassScoreChange = (studentId: string, dbKey: string, val: string) => {
    setClassScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [dbKey]: val
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
                          {s.nama} ({s.nis}) - Kelas {s.kelas || "-"}
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
                      <span>NIS: <strong className="text-slate-600">{currentStudent.nis}</strong> • Kelas: <strong className="text-slate-600">{currentStudent.kelas || "-"}</strong></span>
                    </div>
                  )}
                </div>

                {/* Input Nilai Mata Pelajaran (Dynamic Grid for 11 Subjects) */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block pb-1 border-b border-slate-100">
                    Nilai Mata Pelajaran (Rentang 0 - 100)
                  </span>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {SUBJECTS.map((subj) => {
                      const scoreStr = singleScores[subj.dbKey] || "";
                      const valNum = scoreStr.trim() === "" ? null : parseFloat(scoreStr);
                      return (
                        <div key={subj.dbKey} className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/20 transition-all flex flex-col justify-between">
                          <div className="flex flex-col gap-1">
                            <Label htmlFor={subj.dbKey} className="text-xs font-bold text-slate-600 block">{subj.label}</Label>
                            <Input
                              id={subj.dbKey}
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              placeholder="0.00"
                              value={scoreStr}
                              onChange={(e) => handleScoreChange(subj.dbKey, e.target.value)}
                              disabled={!selectedSiswaId}
                              className="h-10 px-3 bg-slate-50/50 focus:bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs outline-none font-bold disabled:opacity-50 mt-1 shadow-none"
                            />
                          </div>
                          {valNum !== null && (
                            <span className={`px-2 py-0.5 mt-1 text-[9px] font-bold border rounded-md text-center ${getGradeColor(getPredikat(valNum))}`}>
                              Predikat {getPredikat(valNum)}
                            </span>
                          )}
                        </div>
                      );
                    })}
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
                      className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs outline-none cursor-pointer font-bold text-slate-700 hover:border-slate-300 transition-colors"
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
                      className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-xs outline-none cursor-pointer font-bold text-slate-700 hover:border-slate-300 transition-colors"
                    >
                      {[1, 2, 3, 4, 5, 6].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Cari siswa di kelas..."
                      value={classSearchQuery}
                      onChange={(e) => setClassSearchQuery(e.target.value)}
                      className="pl-9 h-11 bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs font-semibold shadow-none"
                    />
                  </div>
                </div>

                {/* Batch Spreadsheet Table (Dynamic for 11 subjects) */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1400px] border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50/70 border-b border-slate-200/60">
                          <th className="px-5 py-4 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider w-16">No</th>
                          <th className="px-5 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider w-56">Siswa</th>
                          
                          {/* 11 Subjects Column Headers */}
                          {SUBJECTS.map(subj => (
                            <th key={subj.dbKey} className="px-4 py-4 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider w-24">
                              {subj.label}
                            </th>
                          ))}

                          <th className="px-5 py-4 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider w-28">Rata-rata</th>
                          <th className="px-5 py-4 text-center font-bold text-slate-500 text-[10px] uppercase tracking-wider w-28">Predikat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classStudents.length === 0 ? (
                          <tr>
                            <td colSpan={SUBJECTS.length + 4} className="text-center py-10 text-slate-400 font-bold text-xs">
                              Tidak ada siswa terdaftar di kelas {selectedKelas}.
                            </td>
                          </tr>
                        ) : (
                          filteredClassStudents.map((student, idx) => {
                            const sScores = classScores[student.id] || {};
                            
                            // Calculate live student average
                            const sParsed = SUBJECTS.map(subj => {
                              const v = sScores[subj.dbKey] || "";
                              return v.trim() === "" ? null : parseFloat(v);
                            });
                            const sFilled = sParsed.filter((v): v is number => v !== null);
                            const hasVals = sFilled.length > 0;
                            const sAvgRaw = hasVals ? (sFilled.reduce((a, b) => a + b, 0) / sFilled.length) : 0;
                            const avgVal = Number(sAvgRaw.toFixed(1));

                            return (
                              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors border-none group">
                                <td className="px-5 py-3 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                                <td className="px-5 py-3">
                                  <div className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{student.nama}</div>
                                  <div className="text-[9px] text-slate-400 font-semibold mt-0.5">NIS: {student.nis}</div>
                                </td>

                                {/* 11 Subjects Inputs */}
                                {SUBJECTS.map(subj => (
                                  <td key={subj.dbKey} className="px-4 py-3 text-center">
                                    <Input 
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="any"
                                      placeholder="-"
                                      value={sScores[subj.dbKey] || ""}
                                      onChange={(e) => handleClassScoreChange(student.id, subj.dbKey, e.target.value)}
                                      className="h-9 w-16 text-center mx-auto bg-white border-slate-200 focus:border-blue-500 rounded-lg text-xs font-bold shadow-none px-1"
                                    />
                                  </td>
                                ))}

                                {/* Live Average */}
                                <td className="px-5 py-3 text-center">
                                  {hasVals ? (
                                    <span className="font-extrabold text-[10px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100/50">
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
