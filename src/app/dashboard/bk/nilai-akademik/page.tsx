"use client";

import { useState } from "react";
import { Search, Filter, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, BookOpen, GraduationCap, Award, Users, UserSearch, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const mockScores = [
  { 
    id: 1, nisn: "0012345678", name: "Andi Pratama", class: "9A", 
    subjects: { math: 85, indonesian: 88, english: 82, science: 90, social: 86 },
    average: 86.2, trend: "up" 
  },
  { 
    id: 2, nisn: "0012345679", name: "Budi Santoso", class: "9B", 
    subjects: { math: 75, indonesian: 80, english: 78, science: 72, social: 75 },
    average: 76.0, trend: "down" 
  },
  { 
    id: 3, nisn: "0012345680", name: "Citra Lestari", class: "9A", 
    subjects: { math: 92, indonesian: 90, english: 95, science: 88, social: 90 },
    average: 91.0, trend: "up" 
  },
  { 
    id: 4, nisn: "0012345681", name: "Dewi Anggraini", class: "8C", 
    subjects: { math: 80, indonesian: 85, english: 82, science: 84, social: 88 },
    average: 83.8, trend: "stable" 
  },
  { 
    id: 5, nisn: "0012345682", name: "Eko Prasetyo", class: "7B", 
    subjects: { math: 68, indonesian: 75, english: 70, science: 65, social: 72 },
    average: 70.0, trend: "down" 
  },
];

// Helper to get letter grade
function getPredikat(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
}

// Helper to color grade
function getGradeColor(predikat: string) {
  switch (predikat) {
    case "A": return "text-emerald-600 bg-emerald-50";
    case "B": return "text-blue-600 bg-blue-50";
    case "C": return "text-amber-600 bg-amber-50";
    default: return "text-rose-600 bg-rose-50";
  }
}

export default function NilaiAkademikPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Find selected student based on search query
  const selectedStudent = searchQuery.trim() !== "" 
    ? mockScores.find(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
    : null;

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Nilai Akademik</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Pemantauan prestasi dan hasil evaluasi belajar siswa.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-linear-to-r cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 px-5 font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0">
            <BookOpen className="mr-2 h-4 w-4" />
            Input Nilai
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rekap" className="w-full">
        <TabsList variant="line" className="w-full justify-start border-b border-slate-200 mb-6 gap-6 h-auto rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="rekap" 
            className="text-sm font-medium text-slate-500 cursor-pointer data-[state=active]:font-bold border-0 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Rekap Keseluruhan
          </TabsTrigger>
          <TabsTrigger 
            value="individu" 
            className="text-sm font-medium text-slate-500 cursor-pointer data-[state=active]:font-bold border-0 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Rapor Individu
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: REKAP KESELURUHAN */}
        <TabsContent value="rekap" className="space-y-4 animate-in-fade">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input 
                placeholder="Cari NISN atau Nama..." 
                className="pl-9 h-10 bg-white border-blue-100 rounded-lg shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-400"
              />
            </div>
            <Button variant="outline" className="h-10 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full sm:w-auto font-medium shadow-none transition-colors">
              <Filter className="mr-2 h-4 w-4" />
              Filter Semester
            </Button>
          </div>

          <div className="rounded-lg border border-blue-50 bg-white shadow-none overflow-hidden transition-all duration-300">
            <Table>
              <TableHeader className="bg-linear-to-r from-blue-50/50 to-cyan-50/50 border-b border-blue-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-700 h-12 px-6 w-16 text-center">No</TableHead>
                  <TableHead className="font-semibold text-slate-700 h-12 px-6">Siswa</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center h-12 px-6">MTK</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center h-12 px-6">B. Indo</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center h-12 px-6">B. Ing</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center h-12 px-6">IPA</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center h-12 px-6">IPS</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center h-12 px-6">Rata-rata</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center h-12 px-6">Tren</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center h-12 px-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-blue-50/50">
                {mockScores.map((score, index) => (
                  <TableRow key={score.id} className="hover:bg-blue-50/30 transition-colors border-none group">
                    <TableCell className="text-center text-sm text-slate-400 px-6 py-4">{index + 1}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{score.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{score.nisn} • {score.class}</div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-slate-600 px-6 py-4">{score.subjects.math}</TableCell>
                    <TableCell className="text-center text-sm text-slate-600 px-6 py-4">{score.subjects.indonesian}</TableCell>
                    <TableCell className="text-center text-sm text-slate-600 px-6 py-4">{score.subjects.english}</TableCell>
                    <TableCell className="text-center text-sm text-slate-600 px-6 py-4">{score.subjects.science}</TableCell>
                    <TableCell className="text-center text-sm text-slate-600 px-6 py-4">{score.subjects.social}</TableCell>
                    <TableCell className="text-center px-6 py-4">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">{score.average}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-center">
                        {score.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                        {score.trend === 'down' && <TrendingDown className="h-4 w-4 text-rose-500" />}
                        {score.trend === 'stable' && <Minus className="h-4 w-4 text-slate-400" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Detail">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination Footer */}
            <div className="p-4 border-t border-blue-50 bg-blue-50/30 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Menampilkan 1-5 dari 1,284 data</span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 border-slate-200 shadow-none rounded-lg" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 min-w-[32px] bg-blue-50 text-blue-600 border-blue-200 shadow-none rounded-lg">1</Button>
                <Button variant="ghost" size="sm" className="h-8 min-w-[32px] text-slate-600 hover:bg-slate-100 rounded-lg">2</Button>
                <span className="px-1 text-slate-400">...</span>
                <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 border-slate-200 shadow-none hover:bg-slate-50 rounded-lg">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: RAPOR INDIVIDU */}
        <TabsContent value="individu" className="space-y-6 animate-in-fade">
          {/* Search Box */}
          <Card className="border-blue-50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-slate-800">Cari Data Siswa</CardTitle>
              <CardDescription className="text-slate-500">Masukkan nama atau NISN untuk melihat detail rapor nilai akademik.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                <Input 
                  placeholder="Ketik nama siswa (contoh: Andi)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white border-blue-100 rounded-lg text-base shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Result / Empty State */}
          {!searchQuery ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="text-base font-semibold text-slate-700">Mulai Pencarian</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Ketikkan nama atau NISN pada kolom di atas untuk menampilkan detail nilai akademik.</p>
            </div>
          ) : !selectedStudent ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-base font-semibold text-slate-700">Siswa Tidak Ditemukan</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Pastikan ejaan nama atau NISN sudah benar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in-slide-up">
              {/* Profile Card */}
              <Card className="border-blue-50 shadow-sm hover:shadow-md transition-all duration-300 md:col-span-1 h-fit">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-inner">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedStudent.name}</h2>
                    <p className="text-slate-500 text-sm font-medium mb-4">NISN: {selectedStudent.nisn}</p>
                    
                    <div className="grid grid-cols-2 w-full gap-2 border-t border-slate-100 pt-4">
                      <div className="flex flex-col items-center p-2 bg-blue-50/50 rounded-lg">
                        <span className="text-xs text-slate-500 font-medium mb-1">Kelas</span>
                        <span className="font-bold text-slate-700">{selectedStudent.class}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-blue-50/50 rounded-lg">
                        <span className="text-xs text-slate-500 font-medium mb-1">Rata-rata</span>
                        <span className="font-bold text-blue-600">{selectedStudent.average}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grades Table */}
              <Card className="border-blue-50 shadow-none transition-all duration-300 md:col-span-2 overflow-hidden">
                <CardHeader className="border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 pb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base text-slate-800">Detail Nilai Mata Pelajaran</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white">
                      <TableRow className="border-b border-slate-100 hover:bg-transparent">
                        <TableHead className="font-semibold text-slate-700 h-11 px-6">Mata Pelajaran</TableHead>
                        <TableHead className="font-semibold text-slate-700 h-11 text-center w-32">Nilai Angka</TableHead>
                        <TableHead className="font-semibold text-slate-700 h-11 text-center w-32">Predikat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-50">
                      {[
                        { name: "Matematika", score: selectedStudent.subjects.math },
                        { name: "Bahasa Indonesia", score: selectedStudent.subjects.indonesian },
                        { name: "Bahasa Inggris", score: selectedStudent.subjects.english },
                        { name: "Ilmu Pengetahuan Alam (IPA)", score: selectedStudent.subjects.science },
                        { name: "Ilmu Pengetahuan Sosial (IPS)", score: selectedStudent.subjects.social },
                      ].map((subject, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors border-none">
                          <TableCell className="font-medium text-slate-700 px-6 py-4">{subject.name}</TableCell>
                          <TableCell className="text-center font-bold text-slate-700 py-4">{subject.score}</TableCell>
                          <TableCell className="text-center py-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getGradeColor(getPredikat(subject.score))}`}>
                              {getPredikat(subject.score)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
