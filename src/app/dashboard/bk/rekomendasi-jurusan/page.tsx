"use client";

import { useState } from "react";
import { Search, Compass, CheckCircle2, ChevronLeft, ArrowRight, BrainCircuit, Activity, Database, Save, UserCheck, Eye, Edit, Trash2, ChevronRight } from "lucide-react";
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

const mockRecommendations = [
  { id: 1, name: "Andi Pratama", class: "9A", rec: "SMA - MIPA", confidence: "94%", reason: "Nilai rata-rata Sains 90 dan minat dominan di bidang Teknologi." },
  { id: 2, name: "Budi Santoso", class: "9B", rec: "SMK - Multimedia", confidence: "88%", reason: "Bakat linguistik verbal tinggi dan minat pada Seni/Kreatif." },
  { id: 3, name: "Citra Lestari", class: "9A", rec: "SMA - IPS", confidence: "91%", reason: "Nilai Bahasa stabil dan unggul di komunikasi interpersonal." },
];

export default function RekomendasiJurusanBKPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [studentFound, setStudentFound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setStudentFound(false);
    setTimeout(() => {
      setIsSearching(false);
      setStudentFound(true);
    }, 1500);
  };

  const handleProcess = () => {
    setIsProcessing(true);
    // Simulate AI processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setHasResult(true);
    }, 2500);
  };

  const handleReset = () => {
    setIsGenerating(false);
    setHasResult(false);
    setIsProcessing(false);
    setIsSearching(false);
    setStudentFound(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Rekomendasi Jurusan</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Sistem pakar rekomendasi jurusan berdasarkan data terintegrasi.
          </p>
        </div>
        {!isGenerating ? (
          <Button onClick={() => setIsGenerating(true)} className="cursor-pointer bg-blue-500 hover:bg-blue-600 hover:to-blue-600 text-white rounded-sm h-10 px-5 font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0">
            <Compass className="mr-2 h-4 w-4" />
            Generate Rekomendasi
          </Button>
        ) : (
          <Button variant="outline" onClick={handleReset} className="border-blue-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-sm h-10 px-4 font-medium shadow-sm transition-all duration-300">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        )}
      </div>

      {!isGenerating ? (
        // MASTER LIST VIEW
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input 
                placeholder="Cari nama siswa..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white border-blue-100 rounded-lg shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-100"
              />
            </div>
          </div>
          
          <div className="rounded-xl border border-blue-50 bg-white shadow-none overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[900px]">
              <TableHeader className="bg-linear-to-r from-blue-50/50 to-cyan-50/50 border-b border-blue-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700 h-12 px-6 w-16 text-center">No</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6">Siswa</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6">Hasil Rekomendasi</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6 text-center">Akurasi</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6">Analisis Singkat</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-blue-50/50">
                {mockRecommendations.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/30 transition-colors border-none group">
                    <TableCell className="text-center text-sm text-slate-400 px-6 py-4">{index + 1}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{item.name}</div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">Kelas {item.class}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                        {item.rec}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-6 py-4">
                      <span className="flex justify-center items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-1 rounded-md w-fit mx-auto">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[11px] font-bold">{item.confidence}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600 px-6 py-4 max-w-[250px] truncate">
                      {item.reason}
                    </TableCell>
                    <TableCell className="text-center px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Detail">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Edit Data">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Hapus Data">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {mockRecommendations.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      Siswa tidak ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination Footer */}
            <div className="p-4 border-t border-blue-50 bg-blue-50/30 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Menampilkan 1-3 dari 3 data</span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 border-slate-200 shadow-none rounded-lg" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 min-w-[32px] bg-blue-50 text-blue-600 border-blue-200 shadow-none rounded-lg">1</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 border-slate-200 shadow-none rounded-lg" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        </>
      ) : (
        // GENERATOR MODE
        <div className="space-y-6">
          {/* Form Selection & Student Preview */}
          <div className="rounded-2xl border border-blue-50 bg-white p-6">
             <h2 className="text-lg font-semibold text-slate-800 mb-4">Pilih Siswa</h2>
             <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                 <Input 
                   placeholder="Masukkan NISN atau Nama Siswa (Contoh: Andi)..." 
                   value={searchQuery}
                   onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setStudentFound(false);
                     setHasResult(false);
                   }}
                   className="pl-9 h-11 bg-white border-blue-100 rounded-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-100"
                   disabled={isProcessing || hasResult}
                 />
               </div>
               <Button 
                 onClick={handleSearch}
                 disabled={!searchQuery || studentFound || isProcessing || isSearching}
                 className="cursor-pointer bg-blue-500 hover:bg-blue-600 hover:to-blue-600 text-white rounded-lg h-11 px-6 font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0"
               >
                 {isSearching ? (
                   <span className="flex items-center">
                     <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                     Mencari...
                   </span>
                 ) : (
                   <span className="flex items-center">
                     <UserCheck className="mr-2 h-4 w-4" />
                     Cari Data Siswa
                   </span>
                 )}
               </Button>
             </div>

             {/* Student Data Preview */}
             {studentFound && (
               <div className="mt-6 p-6 border border-blue-100/50 bg-gradient-to-br from-blue-50/50 to-white rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="font-bold text-slate-800 text-lg">Andi Pratama</h3>
                     <p className="text-sm text-slate-500">NISN: 0012345678 • Kelas 9A</p>
                   </div>
                   <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wide">
                     Data Lengkap & Siap
                   </span>
                 </div>
                 
                 <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-white p-3 rounded-lg border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Rata-rata Nilai</p>
                     <p className="font-semibold text-slate-700">88.5</p>
                   </div>
                   <div className="bg-white p-3 rounded-lg border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Minat Utama</p>
                     <p className="font-semibold text-slate-700">Teknologi</p>
                   </div>
                   <div className="bg-white p-3 rounded-lg border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Bakat Dominan</p>
                     <p className="font-semibold text-slate-700">Logika Analitik</p>
                   </div>
                   <div className="bg-white p-3 rounded-lg border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Kepribadian</p>
                     <p className="font-semibold text-slate-700">INTJ</p>
                   </div>
                 </div>

                 {!hasResult && (
                   <div className="mt-6 pt-6 border-t border-blue-100/50 flex justify-end">
                     <Button 
                       onClick={handleProcess}
                       disabled={isProcessing}
                       className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg h-11 px-8 font-medium shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-300 border-0"
                     >
                       {isProcessing ? "Memproses Kalkulasi AI..." : "Mulai Kalkulasi Algoritma"}
                       {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
                     </Button>
                   </div>
                 )}
               </div>
             )}
          </div>

          {/* SKELETON LOADER */}
          {isProcessing && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="grid md:grid-cols-2 gap-6">
                  {/* Skeleton Card 1 */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 h-[200px] flex flex-col gap-4">
                     <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse"></div>
                        <div className="space-y-2">
                           <div className="w-32 h-4 bg-slate-100 rounded animate-pulse"></div>
                           <div className="w-24 h-3 bg-slate-50 rounded animate-pulse"></div>
                        </div>
                     </div>
                     <div className="w-full h-12 bg-slate-50 rounded-lg animate-pulse mt-4"></div>
                     <div className="w-3/4 h-3 bg-slate-50 rounded animate-pulse"></div>
                  </div>
                  {/* Skeleton Card 2 */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 h-[200px] flex flex-col gap-4">
                     <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse"></div>
                        <div className="space-y-2">
                           <div className="w-32 h-4 bg-slate-100 rounded animate-pulse"></div>
                           <div className="w-24 h-3 bg-slate-50 rounded animate-pulse"></div>
                        </div>
                     </div>
                     <div className="w-full h-12 bg-slate-50 rounded-lg animate-pulse mt-4"></div>
                     <div className="w-3/4 h-3 bg-slate-50 rounded animate-pulse"></div>
                  </div>
               </div>
               {/* Skeleton Final */}
               <div className="rounded-2xl border border-slate-200 bg-white p-8 h-[250px] flex flex-col gap-6">
                  <div className="w-48 h-6 bg-slate-100 rounded animate-pulse"></div>
                  <div className="w-full h-24 bg-slate-50 rounded-xl animate-pulse"></div>
                  <div className="w-32 h-10 bg-slate-100 rounded-lg animate-pulse ml-auto mt-auto"></div>
               </div>
            </div>
          )}

          {/* RESULTS */}
          {hasResult && !isProcessing && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               {/* Algorithm Comparison */}
               <div className="grid md:grid-cols-2 gap-6">
                 {/* Decision Tree Card */}
                 <div className="rounded-2xl border border-blue-50 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                         <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shadow-sm">
                           <BrainCircuit className="h-5 w-5" />
                         </div>
                         <div>
                           <h3 className="font-semibold text-slate-800">Decision Tree</h3>
                           <p className="text-[11px] text-slate-500 font-medium">Tingkat Akurasi: 92%</p>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-5 flex-1">
                       <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Faktor Penentu (Node Pembagi)</p>
                         <ul className="space-y-2.5">
                           <li className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                             <span className="text-slate-500 font-medium">Nilai Tertinggi</span>
                             <span className="font-bold text-slate-700">Matematika (92)</span>
                           </li>
                           <li className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                             <span className="text-slate-500 font-medium">Minat Utama</span>
                             <span className="font-bold text-slate-700">Teknologi</span>
                           </li>
                           <li className="flex justify-between items-center text-xs">
                             <span className="text-slate-500 font-medium">Bakat Dominan</span>
                             <span className="font-bold text-slate-700">Logika Analitik</span>
                           </li>
                         </ul>
                       </div>
                    </div>
                 </div>

                 {/* Naive Bayes Card */}
                 <div className="rounded-2xl border border-blue-50 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                         <div className="bg-amber-50 p-3 rounded-xl text-amber-600 shadow-sm">
                           <Database className="h-5 w-5" />
                         </div>
                         <div>
                           <h3 className="font-semibold text-slate-800">Naive Bayes</h3>
                           <p className="text-[11px] text-slate-500 font-medium">Tingkat Akurasi: 88%</p>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-5 flex-1">
                       <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Distribusi Probabilitas (Atribut Nilai)</p>
                         <div className="grid grid-cols-2 gap-2 text-xs">
                           <div className="flex justify-between bg-white p-2 rounded-md border border-slate-100 shadow-sm">
                             <span className="text-slate-500 font-medium">Matematika</span><span className="font-bold text-slate-700">92</span>
                           </div>
                           <div className="flex justify-between bg-white p-2 rounded-md border border-slate-100 shadow-sm">
                             <span className="text-slate-500 font-medium">IPA</span><span className="font-bold text-slate-700">89</span>
                           </div>
                           <div className="flex justify-between bg-white p-2 rounded-md border border-slate-100 shadow-sm">
                             <span className="text-slate-500 font-medium">B. Indonesia</span><span className="font-bold text-slate-700">85</span>
                           </div>
                           <div className="flex justify-between bg-white p-2 rounded-md border border-slate-100 shadow-sm">
                             <span className="text-slate-500 font-medium">B. Inggris</span><span className="font-bold text-slate-700">86</span>
                           </div>
                           <div className="flex justify-between bg-white p-2 rounded-md border border-slate-100 shadow-sm col-span-2">
                             <span className="text-slate-500 font-medium">IPS</span><span className="font-bold text-slate-700">80</span>
                           </div>
                         </div>
                       </div>
                    </div>
                 </div>
               </div>

               {/* Final Recommendation Card */}
               <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/50 p-8 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Compass className="w-48 h-48 text-blue-600" />
                 </div>
                 
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-6">
                     <Activity className="h-5 w-5 text-blue-600" />
                     <h2 className="text-xl font-bold text-slate-800">Rekomendasi Final</h2>
                   </div>

                   <div className="grid md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-6">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                          <div>
                            <p className="text-sm font-semibold text-slate-500 mb-2">Kesimpulan Sistem</p>
                            <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md">
                              <span className="text-lg font-bold tracking-wide">SMA - MIPA</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-500 mb-2">Keterangan Jurusan</p>
                            <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                              Jurusan Matematika dan Ilmu Pengetahuan Alam (MIPA) mempersiapkan siswa untuk karir di bidang Sains, Teknologi, Teknik, dan Kesehatan (STEM).
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-semibold text-slate-500 mb-2">Analisis Konselor (Otomatis)</p>
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                            Kedua algoritma (Decision Tree dan Naive Bayes) menunjukkan konvergensi hasil yang kuat menuju jurusan <strong>SMA - MIPA</strong>. Hal ini sangat didukung oleh konsistensi nilai akademik sains siswa dan tes probabilitas minat karir. Direkomendasikan untuk menindaklanjuti dengan wawancara pemantapan minat.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-end">
                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-sm h-12 font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0 flex items-center justify-center gap-2">
                          <Save className="h-5 w-5" />
                          Simpan Rekomendasi
                        </Button>
                      </div>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
