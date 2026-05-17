"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  Search, 
  Plus, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  X,
  BookOpen,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteRiwayatKasus } from "@/actions/riwayat-kasus";
import { SiswaOption, RiwayatKasusWithSiswa as CaseItem } from "@/types";

interface ClientProps {
  allStudents: SiswaOption[];
  initialCases: any[];
  activeUserId: string;
}

export function RiwayatKasusClient({ allStudents, initialCases, activeUserId }: ClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // States
  const [cases, setCases] = useState<CaseItem[]>(initialCases);
  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modal States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Active Selected Item for Action
  const [activeCase, setActiveCase] = useState<CaseItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync cases state when initialCases change
  useEffect(() => {
    setCases(initialCases);
  }, [initialCases]);

  // Filter Logic
  const filteredCases = cases.filter((c) => {
    const matchesSearch = 
      c.siswa.nama.toLowerCase().includes(search.toLowerCase()) ||
      c.siswa.nis.includes(search) ||
      c.jenis_kasus.toLowerCase().includes(search.toLowerCase()) ||
      c.keterangan.toLowerCase().includes(search.toLowerCase());

    const matchesKategori = selectedKategori === "ALL" || c.kategori === selectedKategori;
    const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;

    return matchesSearch && matchesKategori && matchesStatus;
  });

  // Open Create Route
  const handleOpenCreate = () => {
    router.push("/dashboard/bk/riwayat-kasus/create");
  };

  // Open Edit Route
  const handleOpenEdit = (kasus: CaseItem) => {
    router.push(`/dashboard/bk/riwayat-kasus/edit?kasusId=${kasus.id}`);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (kasus: CaseItem) => {
    setActiveCase(kasus);
    setIsDeleteOpen(true);
  };

  // Delete Action Handler
  const handleDeleteSubmit = async () => {
    if (!activeCase) return;
    setFormLoading(true);
    
    const res = await deleteRiwayatKasus(activeCase.id);
    setFormLoading(false);

    if (res.error) {
      setToast({ message: res.error, type: "error" });
    } else {
      setToast({ message: "Catatan kasus berhasil dihapus!", type: "success" });
      setIsDeleteOpen(false);
      router.refresh();
    }
  };

  const formatDate = (dateInput: Date) => {
    return new Date(dateInput).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-in-fade">
      {/* ── Header Row ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Riwayat Kasus & Sesi Konseling</h1>
          <p className="text-slate-500 mt-1 text-sm font-semibold">
            Kelola, catat, dan pantau seluruh sesi bimbingan konseling dan penanganan pelanggaran siswa.
          </p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 px-5 font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Catat Kasus Baru
        </Button>
      </div>

      {/* ── Search & Filter Controls ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xs">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari nama, NIS, jenis kasus, atau keterangan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white border-slate-200/80 focus:border-blue-500 rounded-lg shadow-none font-semibold text-xs transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Filter Kategori */}
          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="pl-9 pr-3 h-10 w-full bg-white border border-slate-200/80 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="KONSELING">Konseling</option>
              <option value="PELANGGARAN">Pelanggaran</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="relative w-full sm:w-44">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-9 pr-3 h-10 w-full bg-white border border-slate-200/80 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DIPROSES">Diproses</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table Container ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xs overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[900px]">
            <TableHeader className="bg-slate-50/60 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-500 h-11 px-6 w-16 text-center text-xs uppercase tracking-wider">No</TableHead>
                <TableHead className="font-bold text-slate-500 h-11 px-6 text-xs uppercase tracking-wider">Tanggal Sesi</TableHead>
                <TableHead className="font-bold text-slate-500 h-11 px-6 text-xs uppercase tracking-wider">Nama Siswa</TableHead>
                <TableHead className="font-bold text-slate-500 h-11 px-6 text-xs uppercase tracking-wider">Rombel/Kelas</TableHead>
                <TableHead className="font-bold text-slate-500 h-11 px-6 text-xs uppercase tracking-wider">Kategori</TableHead>
                <TableHead className="font-bold text-slate-500 h-11 px-6 text-xs uppercase tracking-wider">Kasus / Judul</TableHead>
                <TableHead className="font-bold text-slate-500 h-11 px-6 text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="font-bold text-slate-500 text-right h-11 px-6 text-xs uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-slate-400 font-bold text-sm bg-white">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText className="h-10 w-10 text-slate-300" />
                      <span>Tidak ada riwayat kasus yang cocok ditemukan</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((kasus, index) => (
                  <TableRow key={kasus.id} className="hover:bg-slate-50/40 transition-colors">
                    <TableCell className="text-center text-xs font-bold text-slate-400 py-3.5 px-6">{index + 1}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600 py-3.5 px-6">{formatDate(kasus.tanggal)}</TableCell>
                    <TableCell className="py-3.5 px-6">
                      <div className="font-bold text-slate-800 text-xs">{kasus.siswa.nama}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">NIS: {kasus.siswa.nis}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/40">
                        {kasus.siswa.kelas || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span className={`inline-flex text-[9px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                        kasus.kategori === 'KONSELING' 
                          ? 'text-blue-600 bg-blue-50 border-blue-100/50' 
                          : 'text-amber-600 bg-amber-50 border-amber-100/50'
                      }`}>
                        {kasus.kategori}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <div className="text-xs font-bold text-slate-700 max-w-[220px] truncate" title={kasus.jenis_kasus}>
                        {kasus.jenis_kasus}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase ${
                        kasus.status === 'SELESAI' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/40' : 
                        kasus.status === 'DIPROSES' ? 'bg-blue-50 text-blue-600 border border-blue-100/40' : 
                        'bg-amber-50 text-amber-600 border border-amber-100/40'
                      }`}>
                        {kasus.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          onClick={() => router.push(`/dashboard/bk/riwayat-kasus/details?kasusId=${kasus.id}`)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-500 rounded-lg hover:bg-blue-50 cursor-pointer" 
                          title="Lihat Rincian"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleOpenEdit(kasus)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-emerald-500 rounded-lg hover:bg-emerald-50 cursor-pointer" 
                          title="Edit Catatan"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleOpenDelete(kasus)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-rose-500 rounded-lg hover:bg-rose-50 cursor-pointer" 
                          title="Hapus Kasus"
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
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ──────────────────────────────────── */}
      {isDeleteOpen && activeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in-fade">
          <div className="bg-white/95 border border-white/20 shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden animate-in-scale relative">
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto shadow-xs">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">Hapus Catatan Kasus?</h3>
                <p className="text-xs font-semibold text-slate-500 leading-normal">
                  Apakah Anda yakin ingin menghapus sesi bimbingan <strong className="text-slate-700 font-extrabold">"{activeCase.jenis_kasus}"</strong> untuk siswa <strong className="text-slate-700 font-extrabold">{activeCase.siswa.nama}</strong>? Tindakan ini bersifat permanen.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button 
                  onClick={() => setIsDeleteOpen(false)}
                  variant="outline"
                  className="w-full h-10 rounded-lg text-slate-600 border-slate-200 cursor-pointer font-bold text-xs"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleDeleteSubmit}
                  disabled={formLoading}
                  className="w-full h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer font-bold text-xs"
                >
                  {formLoading ? "Menghapus..." : "Hapus Kasus"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST PORTAL NOTIFICATION ──────────────────────────────────── */}
      {mounted && toast && createPortal(
        <div 
          className="fixed top-6 right-6 z-100 max-w-sm w-full bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 text-slate-800 animate-toast-in relative overflow-hidden"
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
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-snug">{toast.message}</p>
          </div>
          <div className="absolute bottom-0 left-0 h-[3px] bg-linear-to-r animate-toast-timer from-emerald-500 to-teal-400" />
        </div>,
        document.body
      )}
    </div>
  );
}
