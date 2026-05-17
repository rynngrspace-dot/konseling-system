"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { 
  FileText, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Save, 
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createRiwayatKasus, updateRiwayatKasus } from "@/actions/riwayat-kasus";
import { KategoriKasus, StatusKasus } from "@prisma/client";
import { SiswaOption } from "@/types";

interface CaseConsoleProps {
  allStudents: SiswaOption[];
  initialCase: any | null;
  initialCaseId: string;
  activeUserId: string;
}

export function CaseConsole({
  allStudents,
  initialCase,
  initialCaseId,
  activeUserId,
}: CaseConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form Field States
  const [formSiswaId, setFormSiswaId] = useState(initialCase?.siswaId || "");
  const [formKategori, setFormKategori] = useState<KategoriKasus>(
    initialCase?.kategori || KategoriKasus.KONSELING
  );
  const [formJenisKasus, setFormJenisKasus] = useState(initialCase?.jenis_kasus || "");
  const [formKeterangan, setFormKeterangan] = useState(initialCase?.keterangan || "");
  const [formStatus, setFormStatus] = useState<StatusKasus>(
    initialCase?.status || StatusKasus.DIPROSES
  );
  const [formTanggal, setFormTanggal] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Set default or initial dates
  useEffect(() => {
    if (initialCaseId && initialCase) {
      setFormSiswaId(initialCase.siswaId);
      setFormKategori(initialCase.kategori);
      setFormJenisKasus(initialCase.jenis_kasus);
      setFormKeterangan(initialCase.keterangan);
      setFormStatus(initialCase.status);
      
      const dateStr = new Date(initialCase.tanggal).toISOString().substring(0, 10);
      setFormTanggal(dateStr);
    } else {
      const today = new Date().toISOString().substring(0, 10);
      setFormTanggal(today);
    }
  }, [initialCaseId, initialCase]);

  // Toast Auto Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiswaId) {
      setFormError("Pilih siswa terlebih dahulu!");
      return;
    }
    if (!formJenisKasus.trim()) {
      setFormError("Jenis kasus / judul singkat wajib diisi!");
      return;
    }
    if (!formKeterangan.trim()) {
      setFormError("Keterangan bimbingan/kasus wajib diisi!");
      return;
    }

    setFormError("");
    setFormLoading(true);

    const payload = {
      siswaId: formSiswaId,
      kategori: formKategori,
      jenis_kasus: formJenisKasus,
      keterangan: formKeterangan,
      status: formStatus,
      tanggal: formTanggal,
    };

    try {
      let res;
      if (initialCaseId) {
        res = await updateRiwayatKasus(initialCaseId, payload);
      } else {
        res = await createRiwayatKasus(activeUserId, payload);
      }

      if (res.error) {
        setFormError(res.error);
        showToast(res.error, "error");
      } else {
        showToast(
          initialCaseId 
            ? "Catatan kasus berhasil diperbarui!" 
            : "Catatan kasus baru berhasil disimpan!", 
          "success"
        );
        
        startTransition(() => {
          router.push("/dashboard/bk/riwayat-kasus");
          router.refresh();
        });
      }
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan sistem.");
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
            onClick={() => router.push("/dashboard/bk/riwayat-kasus")}
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
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-extrabold tracking-tight text-slate-800">
                  {initialCaseId ? "Edit Catatan Kasus Siswa" : "Catat Sesi Bimbingan & Kasus Baru"}
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs font-semibold mt-1">
                  {initialCaseId 
                    ? "Sunting kronologi, kategori, sanksi, atau status penyelesaian dari kasus terpilih."
                    : "Formulir pencatatan sesi bimbingan konseling pribadi, karir, akademik, atau penindakan pelanggaran siswa."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {formError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100 flex items-center gap-3 animate-in-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                
                {/* Siswa Option Selector */}
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="case-siswa" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Siswa Terkait
                  </Label>
                  <select
                    id="case-siswa"
                    value={formSiswaId}
                    onChange={(e) => setFormSiswaId(e.target.value)}
                    required
                    disabled={!!initialCaseId}
                    className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold outline-none cursor-pointer text-slate-700 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>-- Pilih Siswa --</option>
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.nis}) - Kelas {s.kelas || "-"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kategori Kasus */}
                <div className="space-y-1.5">
                  <Label htmlFor="case-kategori" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Kategori Kasus
                  </Label>
                  <select
                    id="case-kategori"
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as KategoriKasus)}
                    className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold outline-none cursor-pointer text-slate-700 transition-all"
                  >
                    <option value="KONSELING">KONSELING (Bimbingan Pribadi / Akademik)</option>
                    <option value="PELANGGARAN">PELANGGARAN (Kedisiplinan / Tata Tertib)</option>
                  </select>
                </div>

                {/* Status Kasus */}
                <div className="space-y-1.5">
                  <Label htmlFor="case-status" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Status Kasus
                  </Label>
                  <select
                    id="case-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as StatusKasus)}
                    className="h-11 w-full px-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold outline-none cursor-pointer text-slate-700 transition-all"
                  >
                    <option value="MENUNGGU">MENUNGGU (Belum Diproses)</option>
                    <option value="DIPROSES">DIPROSES (Sedang Berjalan/Bimbingan)</option>
                    <option value="SELESAI">SELESAI (Sudah Diselesaikan)</option>
                  </select>
                </div>

                {/* Judul/Jenis Kasus */}
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="case-jenis" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Judul Kasus / Deskripsi Pendek
                  </Label>
                  <Input
                    id="case-jenis"
                    placeholder="Masukkan Judul Kasus"
                    value={formJenisKasus}
                    onChange={(e) => setFormJenisKasus(e.target.value)}
                    required
                    className="h-11 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs transition-all"
                  />
                </div>

                {/* Tanggal Kasus */}
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="case-tanggal" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Tanggal Sesi / Kejadian
                  </Label>
                  <Input
                    id="case-tanggal"
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    required
                    className="h-11 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  />
                </div>

                {/* Keterangan Detail */}
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="case-keterangan" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Kronologi & Keterangan Bimbingan Detail
                  </Label>
                  <textarea
                    id="case-keterangan"
                    rows={6}
                    placeholder="Tuliskan latar belakang masalah, penyebab, proses pembimbingan yang diberikan, serta catatan kesepakatan tindak lanjut..."
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    required
                    className="w-full p-4 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-xs font-semibold outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/bk/riwayat-kasus")}
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
                      {initialCaseId ? "Simpan Perubahan" : "Simpan Sesi Kasus"}
                    </>
                  )}
                </Button>
              </div>
            </form>
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
