"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { upsertNilai, deleteNilai } from "@/actions/nilai";
import { NilaiAkademikRecord, SiswaWithNilai, NilaiClientProps } from "@/types";

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

export function NilaiClient({
  students,
  allStudents,
  totalCount,
  currentPage,
  pageSize,
  initialQuery,
  initialKelas,
  initialSemester,
}: NilaiClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [search, setSearch] = useState(initialQuery);
  const [selectedKelas, setSelectedKelas] = useState(initialKelas);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);

  // Stacking context portal control
  const [mounted, setMounted] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Modal States
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SiswaWithNilai | null>(null);

  // Form Inputs
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [inputSemester, setInputSemester] = useState(selectedSemester);
  const [inputMath, setInputMath] = useState("");
  const [inputIndonesian, setInputIndonesian] = useState("");
  const [inputEnglish, setInputEnglish] = useState("");
  const [inputScience, setInputScience] = useState("");
  const [inputSocial, setInputSocial] = useState("");

  // Individual Search State for Rapor Individu tab
  const [individualSearch, setIndividualSearch] = useState("");
  const [viewedStudent, setViewedStudent] = useState<SiswaWithNilai | null>(null);

  // Debounced Filter Handler
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      
      if (search) params.set("q", search);
      else params.delete("q");

      if (selectedKelas && selectedKelas !== "all") params.set("kelas", selectedKelas);
      else params.delete("kelas");

      if (selectedSemester) params.set("semester", selectedSemester.toString());
      else params.delete("semester");

      params.set("page", "1"); // Reset ke halaman 1 saat filter berubah
      
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    }, 450);

    return () => clearTimeout(handler);
  }, [search, selectedKelas, selectedSemester]);

  // Pagination Handler
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  // Helper to extract student scores for a given semester
  const getStudentScores = (student: SiswaWithNilai, sem: number) => {
    const mathRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "Matematika");
    const indonesianRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "Bahasa Indonesia");
    const englishRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "Bahasa Inggris");
    const scienceRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "IPA");
    const socialRecord = student.nilaiAkademik.find(n => n.semester === sem && n.mata_pelajaran === "IPS");

    const math = mathRecord !== undefined ? mathRecord.nilai : null;
    const indonesian = indonesianRecord !== undefined ? indonesianRecord.nilai : null;
    const english = englishRecord !== undefined ? englishRecord.nilai : null;
    const science = scienceRecord !== undefined ? scienceRecord.nilai : null;
    const social = socialRecord !== undefined ? socialRecord.nilai : null;

    const list = [math, indonesian, english, science, social];
    const filledList = list.filter((s): s is number => s !== null);
    const filledCount = filledList.length;
    const average = filledCount > 0 ? Number((filledList.reduce((a, b) => a + b, 0) / 5).toFixed(1)) : 0;

    return { math, indonesian, english, science, social, average, isFilled: filledCount > 0 };
  };

  // Open input modal with existing score data prefilled if available
  const handleOpenInput = (student: SiswaWithNilai) => {
    setSelectedStudent(student);
    setInputSemester(selectedSemester);
    
    const scores = getStudentScores(student, selectedSemester);
    setInputMath(scores.math !== null ? scores.math.toString() : "");
    setInputIndonesian(scores.indonesian !== null ? scores.indonesian.toString() : "");
    setInputEnglish(scores.english !== null ? scores.english.toString() : "");
    setInputScience(scores.science !== null ? scores.science.toString() : "");
    setInputSocial(scores.social !== null ? scores.social.toString() : "");
    
    setFormError("");
    setIsInputOpen(true);
  };

  const handleOpenNewInput = () => {
    setSelectedStudent(null);
    setInputSemester(selectedSemester);
    setInputMath("");
    setInputIndonesian("");
    setInputEnglish("");
    setInputScience("");
    setInputSocial("");
    setFormError("");
    setIsInputOpen(true);
  };

  // Keep inputs updated when inputSemester changes inside the modal
  useEffect(() => {
    if (selectedStudent && isInputOpen) {
      const scores = getStudentScores(selectedStudent, inputSemester);
      setInputMath(scores.math !== null ? scores.math.toString() : "");
      setInputIndonesian(scores.indonesian !== null ? scores.indonesian.toString() : "");
      setInputEnglish(scores.english !== null ? scores.english.toString() : "");
      setInputScience(scores.science !== null ? scores.science.toString() : "");
      setInputSocial(scores.social !== null ? scores.social.toString() : "");
    }
  }, [inputSemester]);

  // Submit Handler for upserting scores
  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFormError("");
    setFormLoading(true);

    const scores = {
      matematika: inputMath.trim() === "" ? null : parseFloat(inputMath),
      indonesian: inputIndonesian.trim() === "" ? null : parseFloat(inputIndonesian),
      english: inputEnglish.trim() === "" ? null : parseFloat(inputEnglish),
      science: inputScience.trim() === "" ? null : parseFloat(inputScience),
      social: inputSocial.trim() === "" ? null : parseFloat(inputSocial),
    };

    // Validasi range nilai
    const checkScores = Object.values(scores).filter((val): val is number => val !== null);
    if (checkScores.some(val => val < 0 || val > 100)) {
      setFormError("Rentang nilai harus berkisar dari 0 sampai 100!");
      setFormLoading(false);
      return;
    }

    const res = await upsertNilai(selectedStudent.id, inputSemester, scores);
    setFormLoading(false);
    
    if (res.error) {
      setFormError(res.error);
    } else {
      setIsInputOpen(false);
      setSelectedStudent(null);
      showToast("Nilai akademik berhasil disimpan ke database!", "success");
      
      // Update individual view state if it is currently viewing this student
      if (viewedStudent && viewedStudent.id === selectedStudent.id) {
        const updatedRecords = viewedStudent.nilaiAkademik.filter(n => n.semester !== inputSemester);
        
        if (scores.matematika !== null) updatedRecords.push({ id: "temp", siswaId: viewedStudent.id, semester: inputSemester, mata_pelajaran: "Matematika", nilai: scores.matematika });
        if (scores.indonesian !== null) updatedRecords.push({ id: "temp", siswaId: viewedStudent.id, semester: inputSemester, mata_pelajaran: "Bahasa Indonesia", nilai: scores.indonesian });
        if (scores.english !== null) updatedRecords.push({ id: "temp", siswaId: viewedStudent.id, semester: inputSemester, mata_pelajaran: "Bahasa Inggris", nilai: scores.english });
        if (scores.science !== null) updatedRecords.push({ id: "temp", siswaId: viewedStudent.id, semester: inputSemester, mata_pelajaran: "IPA", nilai: scores.science });
        if (scores.social !== null) updatedRecords.push({ id: "temp", siswaId: viewedStudent.id, semester: inputSemester, mata_pelajaran: "IPS", nilai: scores.social });
        
        setViewedStudent({
          ...viewedStudent,
          nilaiAkademik: updatedRecords
        });
      }
      
      router.refresh();
    }
  };

  // Open Delete modal
  const handleOpenDelete = (student: SiswaWithNilai) => {
    setSelectedStudent(student);
    setFormError("");
    setIsDeleteOpen(true);
  };

  // Submit Delete scores
  const handleDeleteSubmit = async () => {
    if (!selectedStudent) return;
    setFormLoading(true);
    setFormError("");

    const res = await deleteNilai(selectedStudent.id, selectedSemester);
    setFormLoading(false);

    if (res.error) {
      setFormError(res.error);
    } else {
      setIsDeleteOpen(false);
      setSelectedStudent(null);
      showToast(`Seluruh nilai semester ${selectedSemester} berhasil dihapus!`, "success");
      
      if (viewedStudent && viewedStudent.id === selectedStudent.id) {
        setViewedStudent({
          ...viewedStudent,
          nilaiAkademik: viewedStudent.nilaiAkademik.filter(n => n.semester !== selectedSemester)
        });
      }
      
      router.refresh();
    }
  };

  // Individual Search logic
  const handleIndividualSearchChange = (val: string) => {
    setIndividualSearch(val);
    if (!val.trim()) {
      setViewedStudent(null);
      return;
    }
    
    // Find matching student
    const match = students.find(s => 
      s.nama.toLowerCase().includes(val.toLowerCase()) || 
      s.nis.includes(val)
    );
    setViewedStudent(match || null);
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  return (
    <>
      <div className="space-y-6 animate-in-fade">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">Nilai Akademik</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Pemantauan prestasi dan hasil evaluasi belajar siswa SMP Bina Karya Ngamprah.
            </p>
          </div>
            <Button 
              onClick={() => {
                if (allStudents.length > 0) {
                  handleOpenNewInput();
                } else {
                  showToast("Daftarkan siswa terlebih dahulu di menu Data Siswa!", "error");
                }
              }}
              className="bg-linear-to-r cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-10 px-5 font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0 flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Input Nilai Rapor
            </Button>
        </div>

        <Tabs defaultValue="rekap" className="w-full">
          <TabsList variant="line" className="w-full justify-start border-b border-slate-200 mb-6 gap-6 h-auto rounded-none bg-transparent p-0">
            <TabsTrigger 
              value="rekap" 
              className="text-sm font-semibold text-slate-500 cursor-pointer data-[state=active]:font-bold border-0 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Rekap Keseluruhan
            </TabsTrigger>
            <TabsTrigger 
              value="individu" 
              className="text-sm font-semibold text-slate-500 cursor-pointer data-[state=active]:font-bold border-0 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Rapor Individu
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: REKAP KESELURUHAN */}
          <TabsContent value="rekap" className="space-y-4 animate-in-fade">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-1 gap-3 w-full sm:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Cari NIS atau Nama..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-500 rounded-xl shadow-none focus-visible:outline-none focus-visible:ring-0"
                  />
                </div>
                
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="h-11 px-4 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm outline-none cursor-pointer font-medium text-slate-600 transition-all shrink-0"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="7A">Kelas 7A</option>
                  <option value="7B">Kelas 7B</option>
                  <option value="7C">Kelas 7C</option>
                  <option value="8A">Kelas 8A</option>
                  <option value="8B">Kelas 8B</option>
                  <option value="8C">Kelas 8C</option>
                  <option value="9A">Kelas 9A</option>
                  <option value="9B">Kelas 9B</option>
                  <option value="9C">Kelas 9C</option>
                </select>
              </div>

              {/* Semester Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200/50">
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`h-9 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSemester === sem
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Sem {sem}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden transition-all duration-300">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/70 border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 w-16 text-center">No</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6">Siswa</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center h-12 px-6">MTK</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center h-12 px-6">B. Indo</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center h-12 px-6">B. Ing</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center h-12 px-6">IPA</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center h-12 px-6">IPS</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center h-12 px-6">Rata-rata</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center h-12 px-6">Status</TableHead>
                      <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center h-12 px-6">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-slate-400 font-medium">
                          Data siswa atau nilai tidak ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student, index) => {
                        const scores = getStudentScores(student, selectedSemester);
                        const listIndex = startIdx + index;
                        return (
                          <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors border-none group">
                            <TableCell className="text-center text-xs font-semibold text-slate-400 px-6 py-4">{listIndex}</TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="text-sm font-bold text-slate-800 leading-tight">{student.nama}</div>
                              <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                                NIS: {student.nis} • Kelas {student.kelas}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs font-bold text-slate-600 px-6 py-4">
                              {scores.math !== null ? scores.math : "-"}
                            </TableCell>
                            <TableCell className="text-center text-xs font-bold text-slate-600 px-6 py-4">
                              {scores.indonesian !== null ? scores.indonesian : "-"}
                            </TableCell>
                            <TableCell className="text-center text-xs font-bold text-slate-600 px-6 py-4">
                              {scores.english !== null ? scores.english : "-"}
                            </TableCell>
                            <TableCell className="text-center text-xs font-bold text-slate-600 px-6 py-4">
                              {scores.science !== null ? scores.science : "-"}
                            </TableCell>
                            <TableCell className="text-center text-xs font-bold text-slate-600 px-6 py-4">
                              {scores.social !== null ? scores.social : "-"}
                            </TableCell>
                            <TableCell className="text-center px-6 py-4">
                              {scores.isFilled ? (
                                <span className="font-extrabold text-[11px] text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100/50">
                                  {scores.average}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs font-semibold">-</span>
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex justify-center">
                                {scores.isFilled ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                                    Sudah Diisi
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100/60">
                                    Belum Diisi
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center px-6 py-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleOpenInput(student)}
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" 
                                  title="Input/Edit Nilai"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                {scores.isFilled && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleOpenDelete(student)}
                                    className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                    title="Hapus Nilai"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Menampilkan {startIdx}-{endIdx} dari {totalCount} data</span>
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-8 w-8 text-slate-600 border-slate-200 shadow-none hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(i + 1)}
                        className={`h-8 min-w-[32px] rounded-lg cursor-pointer ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white border-0 shadow-xs"
                            : "text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="h-8 w-8 text-slate-600 border-slate-200 shadow-none hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: RAPOR INDIVIDU */}
          <TabsContent value="individu" className="space-y-6 animate-in-fade">
            {/* Search Box */}
            <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white/70 backdrop-blur-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-slate-800">Cari Data Siswa</CardTitle>
                <CardDescription className="text-slate-500 text-xs font-medium">Masukkan nama atau NIS siswa untuk melihat detail rapor nilai akademik seluruh semester.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full max-w-xl">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    placeholder="Masukkan nama siswa (contoh: Andi)..." 
                    value={individualSearch}
                    onChange={(e) => handleIndividualSearchChange(e.target.value)}
                    className="pl-11 h-12 bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl text-sm shadow-none focus-visible:outline-none focus-visible:ring-0 focus:bg-white transition-all"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Result / Empty State */}
            {!individualSearch.trim() ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                <div className="h-16 w-16 bg-blue-50/50 border border-blue-100/50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Mulai Pencarian Rapor</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs font-semibold">Ketikkan nama atau NIS pada kolom pencarian di atas untuk menampilkan detail nilai akademik secara terperinci.</p>
              </div>
            ) : !viewedStudent ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Siswa Tidak Ditemukan</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs font-semibold">Pastikan ejaan nama atau nomor induk siswa (NIS) sudah sesuai.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in-fade">
                {/* Profile Card */}
                <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white md:col-span-1 h-fit">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-20 w-20 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/40 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-4 shadow-xs">
                        {viewedStudent.nama.charAt(0)}
                      </div>
                      <h2 className="text-base font-bold text-slate-800 leading-tight">{viewedStudent.nama}</h2>
                      <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">NIS: {viewedStudent.nis}</p>
                      
                      <div className="grid grid-cols-2 w-full gap-2 border-t border-slate-100 mt-5 pt-4">
                        <div className="flex flex-col items-center p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Kelas</span>
                          <span className="font-extrabold text-sm text-slate-700">{viewedStudent.kelas}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-blue-50/30 rounded-xl border border-blue-100/20">
                          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Semester</span>
                          <span className="font-extrabold text-sm text-blue-700">{selectedSemester}</span>
                        </div>
                      </div>

                      {/* Average Score Badge */}
                      <div className="w-full mt-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">RATA-RATA RAPOR:</span>
                        <span className="font-extrabold text-sm text-blue-600">
                          {getStudentScores(viewedStudent, selectedSemester).average}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Grades Table */}
                <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white md:col-span-2">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/70 pb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-sm font-bold text-slate-800">Detail Nilai Mata Pelajaran</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-white">
                        <TableRow className="border-b border-slate-100 hover:bg-transparent">
                          <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-11 px-6">Mata Pelajaran</TableHead>
                          <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-11 text-center w-32">Nilai Angka</TableHead>
                          <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-11 text-center w-32">Predikat</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-50">
                        {(() => {
                          const scores = getStudentScores(viewedStudent, selectedSemester);
                          return [
                            { name: "Matematika", score: scores.math },
                            { name: "Bahasa Indonesia", score: scores.indonesian },
                            { name: "Bahasa Inggris", score: scores.english },
                            { name: "Ilmu Pengetahuan Alam (IPA)", score: scores.science },
                            { name: "Ilmu Pengetahuan Sosial (IPS)", score: scores.social },
                          ].map((subject, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50/30 transition-colors border-none">
                              <TableCell className="font-bold text-slate-700 px-6 py-4 text-xs">{subject.name}</TableCell>
                              <TableCell className="text-center font-extrabold text-slate-800 text-xs py-4">
                                {subject.score !== null ? subject.score : "-"}
                              </TableCell>
                              <TableCell className="text-center py-4">
                                {subject.score !== null ? (
                                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${getGradeColor(getPredikat(subject.score))}`}>
                                    {getPredikat(subject.score)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold text-xs">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ));
                        })()}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals outside the animated container to prevent stacking-context confinement */}
      
      {/* --- INPUT/EDIT GRADES MODAL --- */}
      {isInputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300 animate-in-fade">
          <div className="bg-white/95 border border-white/20 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in-scale relative">
            
            {/* Header */}
            <div className="px-8 pt-8 pb-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100/50 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 leading-tight">
                    Input Nilai Rapor
                  </h2>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    Isi formulir nilai rapor akademik siswa untuk semester terpilih.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsInputOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Student Search & Select Dropdown */}
            <div className="mx-8 p-4 bg-slate-50/80 border border-slate-100 rounded-2xl space-y-3">
              <div>
                <Label htmlFor="modal-student-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Pilih Siswa
                </Label>
                <select
                  id="modal-student-select"
                  value={selectedStudent?.id || ""}
                  onChange={(e) => {
                    const matched = allStudents.find(s => s.id === e.target.value);
                    if (matched) {
                      setSelectedStudent(matched);
                      const scores = getStudentScores(matched, inputSemester);
                      setInputMath(scores.math !== null ? scores.math.toString() : "");
                      setInputIndonesian(scores.indonesian !== null ? scores.indonesian.toString() : "");
                      setInputEnglish(scores.english !== null ? scores.english.toString() : "");
                      setInputScience(scores.science !== null ? scores.science.toString() : "");
                      setInputSocial(scores.social !== null ? scores.social.toString() : "");
                    }
                  }}
                  className="h-10 w-full px-3 bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none cursor-pointer font-bold text-slate-700 transition-all"
                >
                  <option value="" disabled>-- Cari/Pilih Siswa --</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama} (NIS: {s.nis}) - Kelas {s.kelas}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedStudent && (
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-200/40">
                  <span>Nama: <strong className="text-slate-700">{selectedStudent.nama}</strong></span>
                  <span>NIS: <strong className="text-slate-700">{selectedStudent.nis}</strong> • Kelas: <strong className="text-slate-700">{selectedStudent.kelas}</strong></span>
                </div>
              )}
            </div>

            <form onSubmit={handleInputSubmit}>
              <div className="p-8 space-y-5 max-h-[55vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-2 animate-in-shake">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Input Semester */}
                <div className="space-y-1.5">
                  <Label htmlFor="input-semester" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Semester Evaluasi
                  </Label>
                  <select
                    id="input-semester"
                    value={inputSemester}
                    onChange={(e) => setInputSemester(parseInt(e.target.value))}
                    required
                    className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm outline-none cursor-pointer font-bold text-slate-700 transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-4">Nilai Mata Pelajaran (Rentang 0 - 100)</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Math */}
                    <div className="space-y-1.5">
                      <Label htmlFor="input-math" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Matematika</Label>
                      <Input
                        id="input-math"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="0.00"
                        value={inputMath}
                        onChange={(e) => setInputMath(e.target.value)}
                        disabled={!selectedStudent}
                        className="h-11 px-4 bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl text-sm outline-none font-bold disabled:opacity-50"
                      />
                    </div>
                    {/* Indonesian */}
                    <div className="space-y-1.5">
                      <Label htmlFor="input-indonesian" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Bahasa Indonesia</Label>
                      <Input
                        id="input-indonesian"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="0.00"
                        value={inputIndonesian}
                        onChange={(e) => setInputIndonesian(e.target.value)}
                        disabled={!selectedStudent}
                        className="h-11 px-4 bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl text-sm outline-none font-bold disabled:opacity-50"
                      />
                    </div>
                    {/* English */}
                    <div className="space-y-1.5">
                      <Label htmlFor="input-english" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Bahasa Inggris</Label>
                      <Input
                        id="input-english"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="0.00"
                        value={inputEnglish}
                        onChange={(e) => setInputEnglish(e.target.value)}
                        disabled={!selectedStudent}
                        className="h-11 px-4 bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl text-sm outline-none font-bold disabled:opacity-50"
                      />
                    </div>
                    {/* Science */}
                    <div className="space-y-1.5">
                      <Label htmlFor="input-science" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">IPA</Label>
                      <Input
                        id="input-science"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="0.00"
                        value={inputScience}
                        onChange={(e) => setInputScience(e.target.value)}
                        disabled={!selectedStudent}
                        className="h-11 px-4 bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl text-sm outline-none font-bold disabled:opacity-50"
                      />
                    </div>
                    {/* Social */}
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="input-social" className="text-[9px] font-bold uppercase tracking-wider text-slate-400">IPS</Label>
                      <Input
                        id="input-social"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="0.00"
                        value={inputSocial}
                        onChange={(e) => setInputSocial(e.target.value)}
                        disabled={!selectedStudent}
                        className="h-11 px-4 bg-slate-50/50 border-slate-200 focus:border-blue-500 rounded-xl text-sm outline-none font-bold disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100/80 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsInputOpen(false)}
                  className="rounded-xl h-10 px-5 text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-semibold text-sm transition-all"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={formLoading || !selectedStudent}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 cursor-pointer font-semibold text-sm shadow-sm shadow-blue-500/10 hover:shadow-md hover:shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : "Simpan Nilai"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {isDeleteOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in-fade">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm overflow-hidden animate-in-scale">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Hapus Nilai Rapor</h3>
                <p className="text-slate-500 text-xs font-semibold px-4">
                  Apakah Anda yakin ingin menghapus seluruh nilai akademik <strong>{selectedStudent.nama}</strong> untuk <strong>Semester {selectedSemester}</strong>? Tindakan ini bersifat permanen.
                </p>
              </div>
              {formError && (
                <div className="bg-red-50 text-red-600 text-xs font-semibold p-2.5 rounded-lg border border-red-100/40">
                  {formError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg h-9 text-slate-600 shadow-none hover:bg-slate-100 cursor-pointer w-24"
              >
                Batal
              </Button>
              <Button 
                onClick={handleDeleteSubmit}
                disabled={formLoading}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-9 px-4 cursor-pointer w-24"
              >
                {formLoading ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification - Rendered via React Portal in document.body to fully escape layout containers */}
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
            {toast.type === "success" && <CheckCircle className="h-5 w-5 stroke-[2.5]" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5 stroke-[2.5]" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800 leading-tight">
              {toast.type === "success" ? "Berhasil!" : "Gagal!"}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>
          
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Progress bar */}
          <div className={`absolute bottom-0 left-0 h-[3px] animate-toast-progress ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`} />
        </div>,
        document.body
      )}
    </>
  );
}
