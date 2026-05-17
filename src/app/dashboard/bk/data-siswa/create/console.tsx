"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  GraduationCap, 
  User, 
  Users, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Save, 
  X,
  UserPlus,
  FileSpreadsheet,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSiswa, updateSiswa, bulkCreateSiswa } from "@/actions/siswa";
import { Siswa } from "@/types";
import * as XLSX from "xlsx";

interface StudentConsoleProps {
  initialStudent: Siswa | null;
  initialSiswaId: string;
}

interface BulkStudentRow {
  id: string; // for React key
  nis: string;
  nama: string;
  jenis_kelamin: "Laki-laki" | "Perempuan";
  kelas?: string;
}

export function StudentConsole({
  initialStudent,
  initialSiswaId,
}: StudentConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode Switcher
  const [entryMode, setEntryMode] = useState<"single" | "bulk">("single");

  // Single Form States
  const [inputNis, setInputNis] = useState(initialStudent?.nis || "");
  const [inputNama, setInputNama] = useState(initialStudent?.nama || "");
  const [inputKelas, setInputKelas] = useState(initialStudent?.kelas || "");
  const [inputGender, setInputGender] = useState<"Laki-laki" | "Perempuan">(
    (initialStudent?.jenis_kelamin as any) || "Laki-laki"
  );

  // Bulk Form States
  const [bulkKelas, setBulkKelas] = useState("");
  const [bulkStudents, setBulkStudents] = useState<BulkStudentRow[]>([
    { id: "1", nis: "", nama: "", jenis_kelamin: "Laki-laki" },
    { id: "2", nis: "", nama: "", jenis_kelamin: "Laki-laki" },
    { id: "3", nis: "", nama: "", jenis_kelamin: "Laki-laki" },
    { id: "4", nis: "", nama: "", jenis_kelamin: "Laki-laki" },
    { id: "5", nis: "", nama: "", jenis_kelamin: "Laki-laki" },
  ]);

  // Global Page UI States
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto focus and layout settings
  useEffect(() => {
    if (initialSiswaId && initialStudent) {
      setInputNis(initialStudent.nis);
      setInputNama(initialStudent.nama);
      setInputKelas(initialStudent.kelas || "");
      setInputGender(initialStudent.jenis_kelamin as any);
    }
  }, [initialSiswaId, initialStudent]);

  // Toast auto dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // Excel File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse as array of arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length <= 1) {
          setFormError("Berkas Excel kosong atau tidak memiliki baris data!");
          return;
        }

        const parsedRows: BulkStudentRow[] = [];
        let loadedCount = 0;

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const nisVal = String(row[0] || "").trim();
          const namaVal = String(row[1] || "").trim();
          const genderVal = String(row[2] || "").trim().toLowerCase();
          const kelasVal = String(row[3] || "").trim();

          if (!nisVal && !namaVal) continue; // Skip empty lines

          let normalizedGender: "Laki-laki" | "Perempuan" = "Laki-laki";
          if (
            genderVal.startsWith("p") || 
            genderVal.includes("fem") || 
            genderVal === "perempuan" ||
            genderVal.startsWith("w") // wanita
          ) {
            normalizedGender = "Perempuan";
          }

          parsedRows.push({
            id: (100 + i).toString(),
            nis: nisVal,
            nama: namaVal,
            jenis_kelamin: normalizedGender,
            kelas: kelasVal || undefined,
          });
          loadedCount++;
        }

        if (loadedCount > 0) {
          setBulkStudents(parsedRows);
          showToast(`Sukses memuat ${loadedCount} data siswa dari berkas Excel!`, "success");
        } else {
          setFormError("Tidak menemukan data siswa yang valid di berkas Anda. Kolom 1 harus NIS, Kolom 2 Nama, Kolom 3 Jenis Kelamin.");
        }
      } catch (err: any) {
        setFormError("Gagal memproses berkas Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit single student (Add / Edit)
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNis.trim() || !inputNama.trim()) {
      setFormError("NIS dan Nama Lengkap wajib diisi!");
      return;
    }

    setFormError("");
    setFormLoading(true);

    try {
      if (initialSiswaId) {
        // Edit Mode
        const res = await updateSiswa(initialSiswaId, {
          nis: inputNis.trim(),
          nama: inputNama.trim(),
          kelas: inputKelas || null,
          jenis_kelamin: inputGender,
        });

        if (res.error) {
          setFormError(res.error);
          showToast(res.error, "error");
        } else {
          showToast("Data profil siswa berhasil diperbarui!", "success");
          startTransition(() => {
            router.push("/dashboard/bk/data-siswa");
            router.refresh();
          });
        }
      } else {
        // Create Mode
        const res = await createSiswa({
          nis: inputNis.trim(),
          nama: inputNama.trim(),
          kelas: inputKelas || null,
          jenis_kelamin: inputGender,
        });

        if (res.error) {
          setFormError(res.error);
          showToast(res.error, "error");
        } else {
          showToast("Siswa baru berhasil didaftarkan!", "success");
          startTransition(() => {
            router.push("/dashboard/bk/data-siswa");
            router.refresh();
          });
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setFormLoading(false);
    }
  };

  // Bulk input handlers
  const handleBulkRowChange = (id: string, field: keyof BulkStudentRow, value: string) => {
    setBulkStudents(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const addBulkRow = () => {
    const newId = (Math.max(...bulkStudents.map(s => parseInt(s.id) || 0)) + 1).toString();
    setBulkStudents(prev => [...prev, { id: newId, nis: "", nama: "", jenis_kelamin: "Laki-laki" }]);
  };

  const removeBulkRow = (id: string) => {
    if (bulkStudents.length <= 1) {
      showToast("Minimal harus menyisakan 1 baris input!", "error");
      return;
    }
    setBulkStudents(prev => prev.filter(row => row.id !== id));
  };

  // Submit bulk students
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filledStudents = bulkStudents.filter(
      s => s.nis.trim() !== "" || s.nama.trim() !== ""
    );

    if (filledStudents.length === 0) {
      setFormError("Silakan isi minimal satu baris data siswa (NIS & Nama)!");
      return;
    }

    // Periksa apakah baris yang diisi ada yang setengah-setengah
    const incompleteRow = filledStudents.some(
      s => s.nis.trim() === "" || s.nama.trim() === ""
    );

    if (incompleteRow) {
      setFormError("Setiap baris yang diisi harus memiliki NIS dan Nama lengkap!");
      return;
    }

    setFormError("");
    setFormLoading(true);

    try {
      const res = await bulkCreateSiswa({
        kelas: bulkKelas || null,
        students: filledStudents.map(s => ({
          nis: s.nis,
          nama: s.nama,
          jenis_kelamin: s.jenis_kelamin,
          kelas: s.kelas || null,
        })),
      });

      if (res.error) {
        setFormError(res.error);
        showToast(res.error, "error");
      } else {
        const kelasMsg = bulkKelas ? ` di kelas ${bulkKelas}` : "";
        showToast(`Sukses mendaftarkan ${res.count} siswa sekaligus${kelasMsg}!`, "success");
        startTransition(() => {
          router.push("/dashboard/bk/data-siswa");
          router.refresh();
        });
      }
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan transaksi.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6 pb-12 animate-in-fade">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.push("/dashboard/bk/data-siswa")}
            variant="ghost"
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Kembali ke Daftar</span>
          </Button>
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/40">
            Modul Admin BK
          </div>
        </div>

        {/* Main Workspace Card */}
        <Card className="border border-slate-200/60 shadow-xl shadow-slate-100/50 rounded-2xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-6 px-8 pt-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100/40 text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-extrabold tracking-tight text-slate-800">
                  {initialSiswaId ? "Edit Profil Siswa" : "Input & Registrasi Siswa Baru"}
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs font-semibold mt-1">
                  {initialSiswaId 
                    ? "Sunting rincian informasi data induk untuk siswa terpilih."
                    : "Daftarkan siswa baru ke sistem secara tunggal atau massal per kelas."}
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

            <Tabs value={entryMode} onValueChange={(val) => setEntryMode(val as "single" | "bulk")} className="w-full">
              {!initialSiswaId && (
                <div className="border-b pb-2 border-slate-200 mb-6">
                  <TabsList variant="line" className="w-full sm:w-auto justify-start gap-6 h-auto rounded-none bg-transparent p-0">
                    <TabsTrigger 
                      value="single" 
                      className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
                    >
                      <User className="h-4 w-4" />
                      Registrasi Per Siswa
                    </TabsTrigger>
                    <TabsTrigger 
                      value="bulk" 
                      className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
                    >
                      <Users className="h-4 w-4" />
                      Registrasi Sekaligus (Kelas)
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}

              {/* TABS CONTENT: SINGLE ENTRY & EDIT MODE */}
              <TabsContent value="single" className="animate-in-fade focus-visible:outline-none">
                <form onSubmit={handleSingleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                    
                    {/* NIS */}
                    <div className="space-y-1.5">
                      <Label htmlFor="single-nis" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Nomor Induk Siswa (NIS)
                      </Label>
                      <Input
                        id="single-nis"
                        placeholder="Masukkan NIS unik..."
                        value={inputNis}
                        onChange={(e) => setInputNis(e.target.value)}
                        required
                        disabled={!!initialSiswaId}
                        className="h-11 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Nama Lengkap */}
                    <div className="space-y-1.5">
                      <Label htmlFor="single-nama" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Nama Lengkap Siswa
                      </Label>
                      <Input
                        id="single-nama"
                        placeholder="Masukkan nama lengkap siswa..."
                        value={inputNama}
                        onChange={(e) => setInputNama(e.target.value)}
                        required
                        className="h-11 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold transition-all"
                      />
                    </div>

                    {/* Kelas */}
                    <div className="space-y-1.5">
                      <Label htmlFor="single-kelas" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Rombongan Belajar (Kelas)
                      </Label>
                      <select
                        id="single-kelas"
                        value={inputKelas}
                        onChange={(e) => setInputKelas(e.target.value)}
                        className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold outline-none cursor-pointer text-slate-700 transition-all"
                      >
                        <option value="">Tanpa Kelas (Belum Ada)</option>
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

                    {/* Jenis Kelamin */}
                    <div className="space-y-1.5">
                      <Label htmlFor="single-gender" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Jenis Kelamin
                      </Label>
                      <select
                        id="single-gender"
                        value={inputGender}
                        onChange={(e) => setInputGender(e.target.value as any)}
                        required
                        className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold outline-none cursor-pointer text-slate-700 transition-all"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  {/* Informational Banner */}
                  {!initialSiswaId && (
                    <div className="bg-blue-50/60 border border-blue-100/50 rounded-2xl p-5 flex gap-4 text-xs leading-relaxed text-blue-800 font-semibold shadow-xs">
                      <div className="shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-bold block text-blue-900 mb-0.5">Penerbitan Akun Otomatis</span>
                        <span>Sistem secara otomatis akan menerbitkan akun login siswa dengan <strong>Username = NIS</strong> dan password default <strong>"123"</strong> agar siswa dapat langsung mengakses rapor minat bakat & nilai akademik mereka.</span>
                      </div>
                    </div>
                  )}

                  {/* Single Action Row */}
                  <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/bk/data-siswa")}
                      className="rounded-lg h-11 px-6 text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading || isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 px-8 cursor-pointer font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      {formLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {initialSiswaId ? "Simpan Perubahan" : "Daftarkan Siswa"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* TABS CONTENT: BULK (CLASS SPREADSHEET) ENTRY */}
              <TabsContent value="bulk" className="animate-in-fade focus-visible:outline-none">
                <form onSubmit={handleBulkSubmit} className="space-y-6">
                  
                  {/* Select Target Class for Bulk Registration */}
                  <div className="p-5 bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 w-full md:max-w-xs">
                      <Label htmlFor="bulk-kelas-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Pilih Target Kelas Rombel
                      </Label>
                      <select
                        id="bulk-kelas-select"
                        value={bulkKelas}
                        onChange={(e) => setBulkKelas(e.target.value)}
                        className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold outline-none cursor-pointer text-slate-700 transition-all"
                      >
                        <option value="">Tanpa Kelas (Ditentukan Individual)</option>
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

                    <div className="text-right text-slate-500 text-xs font-medium max-w-md">
                      Pilih rombongan belajar di samping untuk menetapkan kelas seluruh baris siswa di bawah secara kolektif.
                    </div>
                  </div>

                  {/* Excel/CSV File Upload Dropzone */}
                  <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-slate-100/50 hover:border-blue-500/50 transition-all cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mt-3 group-hover:text-blue-600 transition-colors">Unggah Berkas Excel / CSV Siswa</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Dukung file .xlsx, .xls, .csv. Sistem akan otomatis memetakan kolom: 1=NIS, 2=Nama, 3=Jenis Kelamin, 4=Kelas (Opsional)</p>
                  </div>

                  {/* Spreadsheet Spreadsheet-like Student Input Table */}
                  <div className="border border-slate-200/70 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 text-center">No</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-40">NIS</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Lengkap Siswa</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-36">Jenis Kelamin</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-36">Kelas</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-16 text-center">Hapus</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bulkStudents.map((row, index) => (
                            <tr key={row.id} className="hover:bg-slate-50/20 transition-colors">
                              <td className="p-3 text-center text-xs font-bold text-slate-400">{index + 1}</td>
                              
                              {/* NIS Row Column */}
                              <td className="p-2">
                                <Input
                                  placeholder="Contoh: 20260101"
                                  value={row.nis}
                                  onChange={(e) => handleBulkRowChange(row.id, "nis", e.target.value)}
                                  className="h-10 bg-white border-slate-200/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-xs font-semibold px-3 shadow-none transition-all"
                                />
                              </td>

                              {/* Nama Lengkap Row Column */}
                              <td className="p-2">
                                <Input
                                  placeholder="Nama Lengkap Siswa..."
                                  value={row.nama}
                                  onChange={(e) => handleBulkRowChange(row.id, "nama", e.target.value)}
                                  className="h-10 bg-white border-slate-200/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-xs font-semibold px-3 shadow-none transition-all"
                                />
                              </td>

                              {/* Gender Row Column */}
                              <td className="p-2">
                                <select
                                  value={row.jenis_kelamin}
                                  onChange={(e) => handleBulkRowChange(row.id, "jenis_kelamin", e.target.value as any)}
                                  className="h-10 w-full px-3 bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-xs font-semibold outline-none cursor-pointer text-slate-700 transition-all"
                                >
                                  <option value="Laki-laki">Laki-laki</option>
                                  <option value="Perempuan">Perempuan</option>
                                </select>
                              </td>

                              {/* Kelas Row Column */}
                              <td className="p-2">
                                <select
                                  value={row.kelas || ""}
                                  onChange={(e) => handleBulkRowChange(row.id, "kelas", e.target.value)}
                                  className="h-10 w-full px-3 bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 rounded-lg text-xs font-semibold outline-none cursor-pointer text-slate-700 transition-all"
                                >
                                  <option value="">Tanpa Kelas</option>
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
                              </td>

                              {/* Actions Column */}
                              <td className="p-2 text-center">
                                <Button
                                  type="button"
                                  onClick={() => removeBulkRow(row.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Toolbar / Add Row Button */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                      <Button
                        type="button"
                        onClick={addBulkRow}
                        variant="outline"
                        className="h-9 px-4 text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer rounded-lg font-bold text-xs transition-all flex items-center gap-2"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                        Tambah Baris Baru
                      </Button>
                      
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Baris: {bulkStudents.length} baris
                      </div>
                    </div>
                  </div>

                  {/* Informational Banner */}
                  <div className="bg-blue-50/60 border border-blue-100/50 rounded-2xl p-5 flex gap-4 text-xs leading-relaxed text-blue-800 font-semibold shadow-xs">
                    <div className="shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold block text-blue-900 mb-0.5">Pengisian Cepat</span>
                      <span>Formulir di atas bersifat fleksibel. Anda dapat mengisi beberapa baris saja. Baris kosong akan otomatis dilewati oleh sistem tanpa memicu error penyimpanan! Akun login dengan password default <strong>"123"</strong> juga otomatis dibuat untuk setiap siswa baru.</span>
                    </div>
                  </div>

                  {/* Bulk Action Buttons */}
                  <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/bk/data-siswa")}
                      className="rounded-lg h-11 px-6 text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={formLoading || isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 px-8 cursor-pointer font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      {formLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Menyimpan Kelas...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Simpan Registrasi Kelas
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Global Toast Portal */}
      {toast && createPortal(
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
              <CheckCircle className="h-5 w-5 stroke-[2.5]" />
            ) : (
              <AlertCircle className="h-5 w-5 stroke-[2.5]" />
            )}
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
          
          <div className={`absolute bottom-0 left-0 h-[3px] animate-toast-progress ${
            toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
          }`} />
        </div>,
        document.body
      )}
    </>
  );
}
