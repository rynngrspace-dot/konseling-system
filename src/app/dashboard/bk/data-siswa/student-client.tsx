"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Edit, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createSiswa, updateSiswa, deleteSiswa } from "@/actions/siswa";
import { Siswa, StudentClientProps } from "@/types";

export default function StudentClient({
  students,
  totalCount,
  currentPage,
  pageSize,
  initialQuery,
  initialKelas,
}: StudentClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter States
  const [search, setSearch] = useState(initialQuery);
  const [selectedKelas, setSelectedKelas] = useState(initialKelas);

  // Stacking context portal control
  const [mounted, setMounted] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
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

  // Modals States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form States
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Siswa | null>(null);

  // Form Inputs
  const [inputNis, setInputNis] = useState("");
  const [inputNama, setInputNama] = useState("");
  const [inputKelas, setInputKelas] = useState("");
  const [inputGender, setInputGender] = useState("Laki-laki");

  // Debounced Search Handler
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (search) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      params.set("page", "1"); // Reset ke halaman 1 saat mencari
      router.push(`/dashboard/bk/data-siswa?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [search, router]);

  // Class Filter Handler
  const handleKelasChange = (value: string) => {
    setSelectedKelas(value);
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("kelas", value);
    } else {
      params.delete("kelas");
    }
    params.set("page", "1");
    router.push(`/dashboard/bk/data-siswa?${params.toString()}`);
  };

  // Pagination Handler
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`/dashboard/bk/data-siswa?${params.toString()}`);
  };

  // Open Edit Modal
  const openEditModal = (student: Siswa) => {
    setSelectedStudent(student);
    setInputNis(student.nis);
    setInputNama(student.nama);
    setInputKelas(student.kelas);
    setInputGender(student.jenis_kelamin);
    setFormError("");
    setIsEditOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (student: Siswa) => {
    setSelectedStudent(student);
    setFormError("");
    setIsDeleteOpen(true);
  };

  // Submit Add Student
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const res = await createSiswa({
      nis: inputNis,
      nama: inputNama,
      kelas: inputKelas,
      jenis_kelamin: inputGender,
    });

    setFormLoading(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      // Reset form
      setInputNis("");
      setInputNama("");
      setInputKelas("");
      setInputGender("Laki-laki");
      setIsAddOpen(false);
      showToast("Siswa baru berhasil didaftarkan!", "success");
      router.refresh();
    }
  };

  // Submit Edit Student
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFormError("");
    setFormLoading(true);

    const res = await updateSiswa(selectedStudent.id, {
      nis: inputNis,
      nama: inputNama,
      kelas: inputKelas,
      jenis_kelamin: inputGender,
    });

    setFormLoading(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setIsEditOpen(false);
      setSelectedStudent(null);
      showToast("Data profil siswa berhasil diperbarui!", "success");
      router.refresh();
    }
  };

  // Submit Delete Student
  const handleDeleteSubmit = async () => {
    if (!selectedStudent) return;
    setFormLoading(true);

    const res = await deleteSiswa(selectedStudent.id);

    setFormLoading(false);
    if (res.error) {
      setFormError(res.error);
    } else {
      setIsDeleteOpen(false);
      setSelectedStudent(null);
      showToast("Siswa berhasil dihapus dari sistem!", "success");
      router.refresh();
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  return (
    <>
      <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Data Siswa</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Kelola data induk siswa SMP Bina Karya Ngamprah.
          </p>
        </div>
        <Button 
          onClick={() => {
            setInputNis("");
            setInputNama("");
            setInputKelas("");
            setInputGender("Laki-laki");
            setFormError("");
            setIsAddOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white rounded-lg h-10 px-4 font-medium shadow-sm transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      <div className="space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input 
              placeholder="Cari NIS atau Nama..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white border-blue-100 focus:border-blue-300 rounded-lg text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-200"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-blue-400" />
            <select
              value={selectedKelas}
              onChange={(e) => handleKelasChange(e.target.value)}
              className="h-10 px-3 bg-white border border-blue-100 focus:border-blue-300 rounded-lg text-sm font-medium text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-blue-200"
            >
              <option value="">Semua Kelas</option>
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
        </div>

        {/* Table */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-none overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 h-11 px-4 w-12 text-center">No</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">NIS</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Nama Lengkap</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Kelas</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Jenis Kelamin</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium text-sm">
                    Tidak ada data siswa ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => (
                  <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors border-none group">
                    <TableCell className="text-center text-sm text-slate-400 px-4 py-3">
                      {startIdx + index}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 px-4 py-3">{student.nis}</TableCell>
                    <TableCell className="text-sm font-medium text-slate-700 px-4 py-3">{student.nama}</TableCell>
                    <TableCell className="text-sm text-slate-500 px-4 py-3">{student.kelas}</TableCell>
                    <TableCell className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                        student.jenis_kelamin === 'Laki-laki' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {student.jenis_kelamin}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          onClick={() => openEditModal(student)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => openDeleteModal(student)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Footer */}
          {totalCount > 0 && (
            <div className="p-4 border-t border-blue-50 bg-blue-50/30 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Menampilkan {startIdx}-{endIdx} dari {totalCount} data</span>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 text-slate-400 border-slate-200 shadow-none rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Tampilkan maksimal 5 page numbers agar tidak padat
                  if (totalPages > 5 && Math.abs(p - currentPage) > 1 && p !== 1 && p !== totalPages) {
                    if (p === 2 || p === totalPages - 1) {
                      return <span key={p} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  }

                  return (
                    <Button 
                      key={p}
                      onClick={() => handlePageChange(p)}
                      variant={currentPage === p ? "default" : "ghost"}
                      size="sm" 
                      className={`h-8 min-w-[32px] rounded-lg shadow-none cursor-pointer ${
                        currentPage === p ? "bg-blue-500 text-white hover:bg-blue-600" : "text-slate-600 hover:bg-slate-100"
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
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 text-slate-600 border-slate-200 shadow-none hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Modals outside the animated container to prevent stacking-context confinement */}
      {/* --- ADD MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300 animate-in-fade">
          <div className="bg-white/95 border border-white/20 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in-scale relative">
            
            {/* Header */}
            <div className="px-8 pt-8 pb-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 shadow-xs shrink-0">
                  <Plus className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 leading-tight">
                    Registrasi Siswa Baru
                  </h2>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    Lengkapi formulir di bawah untuk mendaftarkan siswa baru ke sistem.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit}>
              <div className="px-8 pb-6 space-y-5">
                {formError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3.5 rounded-xl animate-shake">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label htmlFor="nis" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    NIS (Nomor Induk Siswa)
                  </Label>
                  <Input 
                    id="nis" 
                    placeholder="Masukkan NIS unik siswa..." 
                    value={inputNis}
                    onChange={(e) => setInputNis(e.target.value)}
                    required
                    className="h-11 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 font-medium px-4 shadow-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nama" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Nama Lengkap Siswa
                  </Label>
                  <Input 
                    id="nama" 
                    placeholder="Masukkan nama lengkap sesuai absen..." 
                    value={inputNama}
                    onChange={(e) => setInputNama(e.target.value)}
                    required
                    className="h-11 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 font-medium px-4 shadow-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="kelas" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Kelas
                    </Label>
                    <select
                      id="kelas"
                      value={inputKelas}
                      onChange={(e) => setInputKelas(e.target.value)}
                      required
                      className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm outline-none cursor-pointer font-medium text-slate-700 transition-all"
                    >
                      <option value="">Pilih...</option>
                      <option value="7A">7A</option>
                      <option value="7B">7B</option>
                      <option value="7C">7C</option>
                      <option value="8A">8A</option>
                      <option value="8B">8B</option>
                      <option value="8C">8C</option>
                      <option value="9A">9A</option>
                      <option value="9B">9B</option>
                      <option value="9C">9C</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Jenis Kelamin
                    </Label>
                    <select
                      id="gender"
                      value={inputGender}
                      onChange={(e) => setInputGender(e.target.value)}
                      required
                      className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm outline-none cursor-pointer font-medium text-slate-700 transition-all"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Auto Account Creation Notice */}
                <div className="bg-blue-50/60 border border-blue-100/50 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-blue-800 font-medium">
                  <div className="shrink-0 mt-0.5">
                    <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p>
                    Sistem secara otomatis akan menerbitkan akun login siswa dengan <strong className="font-bold">Username = NIS</strong> dan password default <strong className="font-bold">"123"</strong>.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100/80 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl h-10 px-5 text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-semibold text-sm transition-all"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={formLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 cursor-pointer font-semibold text-sm shadow-sm shadow-blue-500/10 hover:shadow-md hover:shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : "Daftarkan Siswa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300 animate-in-fade">
          <div className="bg-white/95 border border-white/20 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in-scale relative">
            
            {/* Header */}
            <div className="px-8 pt-8 pb-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50 shadow-xs shrink-0">
                  <Edit className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800 leading-tight">
                    Edit Profil Siswa
                  </h2>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    Ubah informasi data induk untuk siswa: <strong className="text-slate-700 font-bold">{selectedStudent.nama}</strong>.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit}>
              <div className="px-8 pb-6 space-y-5">
                {formError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3.5 rounded-xl animate-shake">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label htmlFor="edit-nis" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    NIS (Nomor Induk Siswa)
                  </Label>
                  <Input 
                    id="edit-nis" 
                    placeholder="Masukkan NIS unik siswa..." 
                    value={inputNis}
                    onChange={(e) => setInputNis(e.target.value)}
                    required
                    className="h-11 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 font-medium px-4 shadow-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-nama" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Nama Lengkap Siswa
                  </Label>
                  <Input 
                    id="edit-nama" 
                    placeholder="Masukkan nama lengkap sesuai absen..." 
                    value={inputNama}
                    onChange={(e) => setInputNama(e.target.value)}
                    required
                    className="h-11 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 font-medium px-4 shadow-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-kelas" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Kelas
                    </Label>
                    <select
                      id="edit-kelas"
                      value={inputKelas}
                      onChange={(e) => setInputKelas(e.target.value)}
                      required
                      className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm outline-none cursor-pointer font-medium text-slate-700 transition-all"
                    >
                      <option value="">Pilih...</option>
                      <option value="7A">7A</option>
                      <option value="7B">7B</option>
                      <option value="7C">7C</option>
                      <option value="8A">8A</option>
                      <option value="8B">8B</option>
                      <option value="8C">8C</option>
                      <option value="9A">9A</option>
                      <option value="9B">9B</option>
                      <option value="9C">9C</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-gender" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Jenis Kelamin
                    </Label>
                    <select
                      id="edit-gender"
                      value={inputGender}
                      onChange={(e) => setInputGender(e.target.value)}
                      required
                      className="h-11 w-full px-4 bg-slate-50/50 border border-slate-200/80 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-sm outline-none cursor-pointer font-medium text-slate-700 transition-all"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100/80 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl h-10 px-5 text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-semibold text-sm transition-all"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={formLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 cursor-pointer font-semibold text-sm shadow-sm shadow-emerald-500/10 hover:shadow-md hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {isDeleteOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in-fade">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-sm overflow-hidden animate-in-scale">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Hapus Data Siswa</h3>
                <p className="text-slate-500 text-xs font-medium px-4">
                  Apakah Anda yakin ingin menghapus <strong>{selectedStudent.nama}</strong> (NIS: {selectedStudent.nis})? Tindakan ini permanen dan akan menghapus akun login-nya juga.
                </p>
              </div>
              {formError && (
                <div className="bg-red-50 text-red-600 text-xs font-medium p-2 rounded-lg">
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
              : toast.type === "error"
              ? "bg-red-50 text-red-600 border-red-100/50 shadow-xs"
              : "bg-blue-50 text-blue-600 border-blue-100/50 shadow-xs"
          }`}>
            {toast.type === "success" && <CheckCircle className="h-5 w-5 stroke-[2.5]" />}
            {toast.type === "error" && <AlertCircle className="h-5 w-5 stroke-[2.5]" />}
            {toast.type === "info" && <svg className="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800 leading-tight">
              {toast.type === "success" ? "Berhasil!" : toast.type === "error" ? "Gagal!" : "Informasi"}
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
            toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
          }`} />
        </div>,
        document.body
      )}
    </>
  );
}
