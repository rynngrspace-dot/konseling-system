"use client";

import { useState } from "react";
import { Printer, Search, FileText, Calendar } from "lucide-react";
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

const mockReports = [
  { id: 1, isoDate: "2026-05-15", date: "15 Mei 2026", name: "Andi Pratama", type: "Indisipliner", desc: "Sering terlambat masuk jam pertama tanpa keterangan yang jelas." },
  { id: 2, isoDate: "2026-05-12", date: "12 Mei 2026", name: "Budi Santoso", type: "Akademik", desc: "Penurunan nilai drastis di mapel Sains dan kesulitan fokus belajar." },
  { id: 3, isoDate: "2026-05-10", date: "10 Mei 2026", name: "Andi Pratama", type: "Sosial", desc: "Terlibat perselisihan ringan dengan teman sebaya saat jam istirahat." },
  { id: 4, isoDate: "2026-05-05", date: "05 Mei 2026", name: "Citra Lestari", type: "Karir", desc: "Konsultasi pemilihan jurusan SMA untuk persiapan masuk PTN." },
  { id: 5, isoDate: "2026-05-02", date: "02 Mei 2026", name: "Andi Pratama", type: "Akademik", desc: "Konsultasi lanjutan mengenai pemantapan minat bakat bidang teknologi." },
];

export default function LaporanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredReports = mockReports.filter(report => {
    // Text Search Logic
    const matchSearch = 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.date.toLowerCase().includes(searchQuery.toLowerCase());

    // Date Filtering Logic
    let matchDate = true;
    if (startDate) matchDate = matchDate && report.isoDate >= startDate;
    if (endDate) matchDate = matchDate && report.isoDate <= endDate;

    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-6 animate-in-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Laporan Bimbingan Konseling</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Rekapitulasi catatan kasus dan layanan spesifik per siswa.
          </p>
        </div>
        <Button className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 px-5 font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0">
          <Printer className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input 
                placeholder="Cari siswa atau kasus..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white border-blue-100 rounded-lg shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-100"
              />
            </div>

            {/* Date Picker (Range) */}
            <div className="flex items-center gap-2 w-full sm:w-auto bg-white border border-blue-100 rounded-lg px-3 py-1 shadow-none transition-all duration-200">
              <Calendar className="h-4 w-4 text-blue-400" />
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 border-none shadow-none focus-visible:ring-0 px-1 text-sm text-slate-600 bg-transparent w-full sm:w-32 cursor-pointer"
              />
              <span className="text-slate-300 font-medium">-</span>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 border-none shadow-none focus-visible:ring-0 px-1 text-sm text-slate-600 bg-transparent w-full sm:w-32 cursor-pointer"
              />
            </div>
          </div>
          
          <div className="w-full xl:w-auto flex items-center justify-between xl:justify-end gap-3 text-sm text-blue-600 font-medium bg-blue-50/50 px-4 py-2.5 rounded-lg border border-blue-100 shadow-sm">
            <FileText className="h-4 w-4 text-blue-500" />
            <span>Total: <strong>{filteredReports.length}</strong> Laporan</span>
          </div>
        </div>

        {/* Table Area */}
        <div className="rounded-xl border border-blue-50 bg-white shadow-none overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[900px]">
              <TableHeader className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border-b border-blue-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 h-12 w-16 px-6 text-center">No.</TableHead>
                <TableHead className="font-semibold text-slate-700 w-36 px-6">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-700 w-48 px-6">Nama Siswa</TableHead>
                <TableHead className="font-semibold text-slate-700 w-40 px-6">Jenis Kasus</TableHead>
                <TableHead className="font-semibold text-slate-700 px-6">Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-blue-50/50">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <TableRow key={report.id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell className="font-medium text-slate-500 py-4 px-6 text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 py-4 px-6">{report.date}</TableCell>
                    <TableCell className="font-bold text-slate-800 py-4 px-6">{report.name}</TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 border border-blue-100">
                        {report.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm leading-relaxed py-4 px-6">
                      {report.desc}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
                      <div className="bg-slate-50 p-4 rounded-full border border-slate-100">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="font-medium text-sm">Tidak ada catatan laporan untuk filter tersebut.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
