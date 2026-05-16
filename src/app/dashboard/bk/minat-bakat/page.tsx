"use client";

import { useState } from "react";
import { BrainCircuit, Target, UploadCloud, FileText, Search, LayoutGrid, List, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockMinatBakat = [
  { id: 1, nisn: "0012345678", name: "Andi Pratama", class: "9A", dominan: "Logika Matematika", mbti: "INTJ", minat: "Sains & Teknologi", date: "12 Okt 2025" },
  { id: 2, nisn: "0012345679", name: "Budi Santoso", class: "9B", dominan: "Linguistik Verbal", mbti: "ENFP", minat: "Seni & Jurnalistik", date: "12 Okt 2025" },
  { id: 3, nisn: "0012345680", name: "Citra Lestari", class: "9A", dominan: "Kinestetik", mbti: "ESTP", minat: "Olahraga & Fisik", date: "14 Okt 2025" },
  { id: 4, nisn: "0012345681", name: "Dewi Anggraini", class: "8C", dominan: "Interpersonal", mbti: "ESFJ", minat: "Pendidikan & Sosial", date: "15 Okt 2025" },
  { id: 5, nisn: "0012345682", name: "Eko Prasetyo", class: "7B", dominan: "Visual Spasial", mbti: "INTP", minat: "Desain & Arsitektur", date: "15 Okt 2025" },
];

export default function MinatBakatPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = mockMinatBakat.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.nisn.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Minat dan Bakat</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Hasil asesmen psikologi dan pemetaan potensi siswa.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-blue-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 bg-white rounded-lg h-10 px-4 font-medium shadow-sm transition-colors">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Hasil
          </Button>
          <Button className="cursor-pointer bg-blue-500 hover:bg-blue-600 hover:to-blue-600 text-white rounded-lg h-10 px-5 font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0">
            <FileText className="mr-2 h-4 w-4" />
            Mulai Asesmen
          </Button>
        </div>
      </div>

      <Tabs defaultValue="card" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b pb-2 border-slate-200">
          <TabsList variant="line" className="w-full sm:w-auto justify-start gap-6 h-auto rounded-none bg-transparent p-0">
            <TabsTrigger 
              value="card" 
              className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
            >
              <LayoutGrid className="h-4 w-4" />
              Tampilan Kartu
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
            >
              <List className="h-4 w-4" />
              Tampilan Tabel
            </TabsTrigger>
          </TabsList>
          
          <div className="relative w-full sm:w-64 mb-2 sm:mb-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input 
              placeholder="Cari siswa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-blue-100 rounded-lg shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-100"
            />
          </div>
        </div>

        {/* TAB 1: CARD VIEW */}
        <TabsContent value="card" className="animate-in-fade">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Siswa tidak ditemukan.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredData.map((item) => (
                <div key={item.id} className="rounded-2xl border border-blue-50 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">NISN: {item.nisn} • Kelas {item.class}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 rounded-md uppercase tracking-wider shadow-sm">
                      {item.mbti}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 bg-indigo-50 p-1.5 rounded-lg text-indigo-500">
                        <BrainCircuit className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kecerdasan Dominan</p>
                        <p className="text-sm font-medium text-slate-700">{item.dominan}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 bg-amber-50 p-1.5 rounded-lg text-amber-500">
                        <Target className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minat Karir</p>
                        <p className="text-sm font-medium text-slate-700">{item.minat}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Diuji: {item.date}</span>
                    <Button variant="link" className="text-blue-600 h-auto p-0 font-semibold text-xs group-hover:underline">
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: TABLE VIEW */}
        <TabsContent value="table" className="animate-in-fade">
          <div className="rounded-2xl border border-blue-50 bg-white shadow-none overflow-hidden transition-all duration-300">
            <Table>
              <TableHeader className="bg-linear-to-r from-blue-50/50 to-cyan-50/50 border-b border-blue-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700 h-12 px-6 w-16 text-center">No</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6">Siswa</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6">Kecerdasan Dominan</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6 text-center">MBTI</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6">Minat Karir</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6">Tgl Asesmen</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-blue-50/50">
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                      Siswa tidak ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-blue-50/30 transition-colors border-none group">
                      <TableCell className="text-center text-sm text-slate-400 px-6 py-4">{index + 1}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{item.name}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">{item.nisn} • {item.class}</div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-indigo-500" />
                          {item.dominan}
                        </div>
                      </TableCell>
                      <TableCell className="text-center px-6 py-4">
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 rounded-md uppercase tracking-wider shadow-sm">
                          {item.mbti}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-amber-500" />
                          {item.minat}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 px-6 py-4">{item.date}</TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-blue-50 bg-blue-50/30 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Menampilkan 1-5 dari 42 data</span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 border-slate-200 shadow-none rounded-lg" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 min-w-[32px] bg-blue-50 text-blue-600 border-blue-200 shadow-none rounded-lg">1</Button>
                <Button variant="ghost" size="sm" className="h-8 min-w-[32px] text-slate-600 hover:bg-slate-100 rounded-lg">2</Button>
                <Button variant="ghost" size="sm" className="h-8 min-w-[32px] text-slate-600 hover:bg-slate-100 rounded-lg">3</Button>
                <span className="px-1 text-slate-400">...</span>
                <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 border-slate-200 shadow-none hover:bg-slate-50 rounded-lg">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
