"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  BrainCircuit, 
  Target, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Sparkles,
  Award
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
import { upsertMinatBakat, deleteMinatBakat } from "@/actions/minat-bakat";
import { SiswaWithMinatBakat, MinatBakatClientProps } from "@/types";

// Central options and types imported from global modules

export function MinatBakatClient({
  students,
  allStudents,
  totalCount,
  currentPage,
  pageSize,
  initialQuery,
  initialKelas,
}: MinatBakatClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [search, setSearch] = useState(initialQuery);
  const [selectedKelas, setSelectedKelas] = useState(initialKelas);

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

  // Modal & Popup States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SiswaWithMinatBakat | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Helpers to get interest & talent data
  const getStudentMinatBakat = (student: SiswaWithMinatBakat) => {
    const record = student.minatBakat && student.minatBakat.length > 0 ? student.minatBakat[0] : null;
    if (!record) return null;

    const detail = typeof record.detailTes === "string" 
      ? JSON.parse(record.detailTes) 
      : record.detailTes;

    return {
      id: record.id,
      minat: record.minat,
      bakat: record.bakat,
      dominan: detail?.dominan || "Belum Terdefinisi",
      mbti: detail?.mbti || "Belum Diuji",
      date: new Date(record.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };
  };

  // Helper to breakdown MBTI letters
  const getMbtiBreakdown = (mbti: string) => {
    if (!mbti || mbti.length !== 4 || mbti === "Belum Diuji") return "";
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

  // Open details modal
  const handleOpenDetail = (student: SiswaWithMinatBakat) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  // Open delete confirmation modal
  const handleOpenDelete = (student: SiswaWithMinatBakat) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  // Submit Handler for deleting interest & talent data
  const handleDeleteSubmit = async () => {
    if (!selectedStudent || !selectedStudent.minatBakat || selectedStudent.minatBakat.length === 0) return;
    setFormLoading(true);

    const res = await deleteMinatBakat(selectedStudent.minatBakat[0].id);
    setFormLoading(false);

    if (res.error) {
      showToast(res.error, "error");
    } else {
      setIsDeleteOpen(false);
      setSelectedStudent(null);
      showToast("Data minat & bakat siswa berhasil dihapus!", "success");
      router.refresh();
    }
  };

  // Trigger filtering route updates
  const updateFilters = (newSearch: string, newKelas: string) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (newSearch) params.set("q", newSearch);
      if (newKelas && newKelas !== "all") params.set("kelas", newKelas);
      params.set("page", "1"); // Reset to page 1 on filter change
      router.push(`/dashboard/bk/minat-bakat?${params.toString()}`);
    });
  };

  // Handle pagination triggers
  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (selectedKelas && selectedKelas !== "all") params.set("kelas", selectedKelas);
      params.set("page", newPage.toString());
      router.push(`/dashboard/bk/minat-bakat?${params.toString()}`);
    });
  };

  // Debounce/Trigger search filter
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search !== initialQuery) {
        updateFilters(search, selectedKelas);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  // Index references for item numbers in table
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);
  const totalPages = Math.ceil(totalCount / pageSize);

  // Auto advisory preview helper

  // Generate detailed counseling guidance analysis recommendation (wow factor)
  const getAIAnalysis = (mbti: string, dominan: string, minat: string) => {
    if (!mbti || mbti === "Belum Diuji") {
      return "Silakan lengkapi data asesmen psikologi terlebih dahulu untuk mendapatkan analisis lengkap.";
    }

    const mbtiBrief = {
      INTJ: "Arsitek (Fokus strategis, logis, menyukai efisiensi tinggi)",
      INTP: "Logikawan (Kreatif secara teoretis, analisis mendalam, pemecah masalah alami)",
      INFJ: "Advokat (Idealis penuh integritas, analitis, peka secara emosional)",
      INFP: "Mediator (Penuh empati, kreatif, idealis, berjiwa kemanusiaan)",
      ENTJ: "Komandan (Pemimpin karismatik, pembuat keputusan berani, efisien)",
      ENTP: "Debat (Cerdas, senang mendiskusikan gagasan abstrak, inovator ulung)",
      ENFJ: "Protagonis (Pemimpin empatik, komunikator ulung, penggerak sosial)",
      ENFP: "Juru Kampanye (Kreatif, penuh antusiasme, bersosialisasi tinggi)",
      ISTJ: "Logistikus (Sangat praktis, andal, teratur, menghormati fakta)",
      ISFJ: "Pembela (Sangat setia, pelindung berdedikasi tinggi, penuh kehangatan)",
      ESTJ: "Eksekutif (Pengelola andal, menyukai ketertiban dan keteraturan operasional)",
      ESFJ: "Konsul (Sangat peduli, populer di lingkungan sosial, senang membantu)",
      ISTP: "Pengrajin (Eksperimentator berani, menguasai berbagai alat kerja fisik)",
      ESTP: "Pengusaha (Cerdas, energik, senang mengambil risiko pragmatis)",
      ISFP: "Petualang (Seniman fleksibel, menyukai harmoni estetika, artistik)",
      ESFP: "Penghibur (Spontan, energik, antusias, membuat suasana menyenangkan)"
    }[mbti] || "Tipe Kepribadian Unik";

    return `Siswa memiliki tipe kepribadian ${mbtiBrief} dikombinasikan dengan kecerdasan dominan ${dominan}. Kombinasi ini sangat harmonis dengan minat karir di bidang ${minat}. Disarankan untuk membimbing siswa menuju program peminatan yang menuntut eksplorasi logika mandiri serta pemecahan masalah inovatif secara berkelanjutan.`;
  };

  return (
    <>
      <div className="space-y-6 animate-in-fade">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">Minat dan Bakat</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Hasil asesmen psikologi dan pemetaan potensi siswa SMP Bina Karya Ngamprah.
            </p>
          </div>
          <Button 
            onClick={() => {
              if (allStudents.length > 0) {
                router.push("/dashboard/bk/minat-bakat/create");
              } else {
                showToast("Daftarkan siswa terlebih dahulu di menu Data Siswa!", "error");
              }
            }}
            className="bg-linear-to-r cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-10 px-5 font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Input Minat & Bakat
          </Button>
        </div>

        <Tabs defaultValue="card" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b pb-2 border-slate-200">
            <TabsList variant="line" className="w-full sm:w-auto justify-start gap-6 h-auto rounded-none bg-transparent p-0">
              <TabsTrigger 
                value="card" 
                className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
              >
                Tampilan Kartu
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
              >
                Tampilan Tabel
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Kelas Filter Dropdown */}
              <div className="relative shrink-0 w-32 sm:w-40">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedKelas}
                  onChange={(e) => {
                    setSelectedKelas(e.target.value);
                    updateFilters(search, e.target.value);
                  }}
                  className="pl-9 pr-3 h-10 w-full bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors"
                >
                  <option value="all">Semua Kelas</option>
                  <option value="7">Kelas 7</option>
                  <option value="8">Kelas 8</option>
                  <option value="9">Kelas 9</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Cari nama atau NIS..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 bg-white border-slate-200/80 focus:border-blue-500 rounded-xl shadow-none font-medium text-xs transition-all"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: CARD VIEW */}
          <TabsContent value="card" className="animate-in-fade focus-visible:outline-none">
            {students.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100/80 text-slate-400 font-bold text-sm shadow-xs flex flex-col items-center justify-center gap-3">
                <BrainCircuit className="h-10 w-10 text-slate-300" />
                <span>Belum ada data minat & bakat terdaftar untuk kriteria ini.</span>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {students.map((student) => {
                  const data = getStudentMinatBakat(student);
                  return (
                    <div 
                      key={student.id} 
                      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{student.nama}</h3>
                            <p className="text-[11px] text-slate-500 font-bold mt-1">NIS: {student.nis} • Kelas {student.kelas}</p>
                          </div>
                          {data ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 rounded-lg uppercase tracking-wider shadow-xs shrink-0">
                              {data.mbti}
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold px-2.5 py-1 bg-slate-50 border border-slate-200/60 text-slate-400 rounded-lg uppercase tracking-wider shrink-0">
                              Belum Tes
                            </span>
                          )}
                        </div>

                        {data ? (
                          <div className="space-y-3.5 mt-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 bg-indigo-50 p-1.5 rounded-lg text-indigo-500 shrink-0">
                                <BrainCircuit className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Kecerdasan Dominan</p>
                                <p className="text-xs font-semibold text-slate-700">{data.dominan}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 bg-amber-50 p-1.5 rounded-lg text-amber-500 shrink-0">
                                <Target className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Minat Karir</p>
                                <p className="text-xs font-semibold text-slate-700">{data.minat}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 flex flex-col items-center justify-center border border-dashed border-slate-100 rounded-xl bg-slate-50/50 mt-4">
                            <p className="text-[10px] text-slate-400 font-bold">Data asesmen kosong</p>
                            <Button 
                              onClick={() => router.push(`/dashboard/bk/minat-bakat/create?siswaId=${student.id}`)}
                              variant="link" 
                              className="text-xs font-extrabold text-blue-600 h-auto p-0 mt-1 cursor-pointer hover:underline"
                            >
                              Isi Minat Bakat
                            </Button>
                          </div>
                        )}
                      </div>

                      {data && (
                        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Diuji: {data.date}</span>
                          <div className="flex items-center gap-1">
                            <Button 
                              onClick={() => handleOpenDetail(student)}
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 font-extrabold text-[11px] h-8 rounded-lg px-2.5 cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                              Lihat Detail
                            </Button>
                            <Button 
                              onClick={() => router.push(`/dashboard/bk/minat-bakat/create?siswaId=${student.id}`)}
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-500 rounded-lg hover:bg-emerald-50 cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              onClick={() => handleOpenDelete(student)}
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 rounded-lg hover:bg-rose-50 cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: TABLE VIEW */}
          <TabsContent value="table" className="animate-in-fade focus-visible:outline-none">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden">
              <Table>
                <TableHeader className="bg-linear-to-r from-blue-50/20 to-cyan-50/20 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400 h-12 px-6 w-16 text-center">No</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400 h-12 px-6">Siswa</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400 h-12 px-6">Kecerdasan Dominan</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400 h-12 px-6 text-center">MBTI</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400 h-12 px-6">Minat Karir</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400 h-12 px-6">Tgl Asesmen</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400 h-12 px-6 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100/60">
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-slate-400 font-bold text-xs">
                        Belum ada data minat & bakat terdaftar untuk kriteria ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student, index) => {
                      const data = getStudentMinatBakat(student);
                      return (
                        <TableRow key={student.id} className="hover:bg-slate-50/40 transition-colors border-none group">
                          <TableCell className="text-center text-xs font-bold text-slate-400 px-6 py-4">{startIdx + index}</TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="text-xs font-bold text-slate-800 leading-none">{student.nama}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1">{student.nis} • Kelas {student.kelas}</div>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-700 px-6 py-4">
                            {data ? (
                              <div className="flex items-center gap-2">
                                <BrainCircuit className="h-4 w-4 text-indigo-500 shrink-0" />
                                <span>{data.dominan}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center px-6 py-4">
                            {data ? (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md uppercase tracking-wider shadow-xs">
                                {data.mbti}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-700 px-6 py-4">
                            {data ? (
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-amber-500 shrink-0" />
                                <span>{data.minat}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-400 px-6 py-4">{data ? data.date : "-"}</TableCell>
                          <TableCell className="text-center px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              {data ? (
                                <>
                                  <Button 
                                    onClick={() => handleOpenDetail(student)}
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-blue-500 rounded-lg hover:bg-blue-50 cursor-pointer" 
                                    title="Lihat Analisis Detail"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    onClick={() => router.push(`/dashboard/bk/minat-bakat/create?siswaId=${student.id}`)}
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-emerald-500 rounded-lg hover:bg-emerald-50 cursor-pointer" 
                                    title="Edit Data"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    onClick={() => handleOpenDelete(student)}
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-rose-500 rounded-lg hover:bg-rose-50 cursor-pointer" 
                                    title="Hapus Data"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  onClick={() => router.push(`/dashboard/bk/minat-bakat/create?siswaId=${student.id}`)}
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 border-slate-200 text-slate-600 rounded-xl px-3 font-semibold text-[11px] cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                  Isi Data
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

              {/* Pagination Footer */}
              {totalCount > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Menampilkan {startIdx}-{endIdx} dari {totalCount} data</span>
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || isPending}
                      className="h-8 w-8 text-slate-400 border-slate-200 shadow-none rounded-lg cursor-pointer hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      if (totalPages > 5 && Math.abs(p - currentPage) > 1 && p !== 1 && p !== totalPages) {
                        if (p === 2 || p === totalPages - 1) {
                          return <span key={p} className="px-1 text-slate-300">...</span>;
                        }
                        return null;
                      }
                      
                      return (
                        <Button 
                          key={p} 
                          variant={currentPage === p ? "outline" : "ghost"} 
                          size="sm" 
                          onClick={() => handlePageChange(p)}
                          disabled={isPending}
                          className={`h-8 min-w-[32px] rounded-lg font-bold transition-all cursor-pointer ${
                            currentPage === p 
                              ? "bg-blue-50 text-blue-600 border-blue-200" 
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </Button>
                      );
                    })}

                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || isPending}
                      className="h-8 w-8 text-slate-400 border-slate-200 shadow-none rounded-lg cursor-pointer hover:bg-slate-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* --- MODALS RENDERED IN PORTALS --- */}
      
      {/* DETAIL VIEW MODAL (WOW FACTOR) */}
      {isDetailOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in-fade">
          <div className="bg-white/95 border border-white/20 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in-scale relative">
            
            {/* Header banner decoration */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-full" />
            
            {/* Header */}
            <div className="px-8 pt-8 pb-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 leading-tight">
                    Analisis Minat & Bakat
                  </h2>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    Profil pemetaan kepribadian dan potensi karir masa depan siswa.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Brief */}
            <div className="mx-8 p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">Siswa Teranalisis</span>
                <span className="text-sm font-extrabold text-indigo-900 leading-tight">{selectedStudent.nama}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">Identitas Siswa</span>
                <span className="text-xs font-extrabold text-indigo-700">NIS: {selectedStudent.nis} • Kelas {selectedStudent.kelas}</span>
              </div>
            </div>

            {/* Detailed Content */}
            <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto">
              {(() => {
                const data = getStudentMinatBakat(selectedStudent);
                if (!data) return <p className="text-center py-6 text-slate-400 font-bold text-xs">Belum ada data asesmen tersedia.</p>;

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Dominan */}
                      <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Kecerdasan Dominan</span>
                        <div className="flex items-center gap-2 mt-1">
                          <BrainCircuit className="h-5 w-5 text-indigo-500 shrink-0" />
                          <span className="text-sm font-extrabold text-slate-800 leading-tight">{data.dominan}</span>
                        </div>
                      </div>

                      {/* MBTI */}
                      <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Kepribadian MBTI</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Award className="h-5 w-5 text-blue-500 shrink-0" />
                          <span className="text-sm font-extrabold text-blue-700 bg-blue-50/60 px-2 py-0.5 rounded-lg uppercase tracking-wider border border-blue-100">{data.mbti}</span>
                        </div>
                        {data.mbti && data.mbti !== "Belum Diuji" && (
                          <div className="text-[8px] font-extrabold text-blue-600/90 uppercase tracking-wider mt-2 border-t border-slate-200/50 pt-1.5 leading-relaxed">
                            {getMbtiBreakdown(data.mbti)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Minat & Bakat details */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Minat Karir Utama</span>
                        <p className="text-xs font-bold text-slate-800">{data.minat}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Bakat / Keahlian Khusus</span>
                        <p className="text-xs font-bold text-slate-800">{data.bakat}</p>
                      </div>
                    </div>

                    {/* Counseling Guidance recommendations (Wow factor) */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-700">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">Rekomendasi Bimbingan Konseling (BK)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed font-bold text-slate-600">
                        {getAIAnalysis(data.mbti, data.dominan, data.minat)}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
              <Button 
                onClick={() => setIsDetailOpen(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl h-10 px-6 cursor-pointer font-semibold text-sm shadow-xs"
              >
                Tutup Analisis
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in-fade">
          <div className="bg-white/95 border border-white/20 shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden animate-in-scale relative">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto shadow-xs">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">Hapus Asesmen Minat Bakat?</h3>
                <p className="text-xs font-semibold text-slate-500 leading-normal">
                  Apakah Anda yakin ingin menghapus data minat & bakat untuk <strong className="text-slate-700 font-extrabold">{selectedStudent.nama}</strong>? Tindakan ini permanen.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button 
                  onClick={() => setIsDeleteOpen(false)}
                  variant="outline"
                  className="w-full h-10 rounded-xl text-slate-600 border-slate-200 cursor-pointer font-semibold text-xs"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleDeleteSubmit}
                  disabled={formLoading}
                  className="w-full h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white cursor-pointer font-semibold text-xs"
                >
                  {formLoading ? "Menghapus..." : "Hapus Data"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST PORTAL */}
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
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {toast.type === "success" ? "Berhasil" : "Kesalahan"}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>
          {/* Subtle loading line animation */}
          <div className={`absolute bottom-0 left-0 h-[3px] bg-linear-to-r animate-toast-timer ${
            toast.type === "success" 
              ? "from-emerald-500 to-teal-400" 
              : "from-red-500 to-rose-400"
          }`} />
        </div>,
        document.body
      )}
    </>
  );
}
