"use client";

import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportItem {
  id: string;
  isoDate: string;
  date: string;
  name: string;
  type: string;
  kategori: "KONSELING" | "PELANGGARAN";
  desc: string;
  status: string;
}

interface ReportTableProps {
  reportsToRender: ReportItem[];
  filteredReports: ReportItem[];
  selectedIds: Set<string>;
  handleSelectAll: () => void;
  handleSelectRow: (id: string) => void;
}

export function ReportTable({
  reportsToRender,
  filteredReports,
  selectedIds,
  handleSelectAll,
  handleSelectRow,
}: ReportTableProps) {
  return (
    <div className="rounded-xl border border-blue-50 bg-white shadow-none overflow-hidden print:border-slate-300 print:rounded-none">
      <div className="overflow-x-auto print:overflow-visible">
        <Table className="w-full md:min-w-[900px] print:min-w-0 print:w-full print:text-slate-900 print:text-[9px]">
          <TableHeader className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border-b border-blue-100 print:bg-none print:border-b-2 print:border-slate-800">
            <TableRow className="hover:bg-transparent">
              {/* Checkbox Column (Web only) */}
              <TableHead className="w-12 px-4 text-center print:hidden">
                <input
                  type="checkbox"
                  checked={filteredReports.length > 0 && filteredReports.every(r => selectedIds.has(r.id))}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </TableHead>
              <TableHead className="font-semibold text-slate-700 h-12 w-16 px-6 text-center print:text-slate-900 print:font-black print:border-r print:border-slate-300 print:w-[5%] print:h-8 print:px-2 print:text-[10px]">No.</TableHead>
              <TableHead className="font-semibold text-slate-700 w-36 px-6 print:text-slate-900 print:font-black print:border-r print:border-slate-300 print:w-[15%] print:px-2 print:text-[10px]">Tanggal</TableHead>
              <TableHead className="font-semibold text-slate-700 w-48 px-6 print:text-slate-900 print:font-black print:border-r print:border-slate-300 print:w-[20%] print:px-2 print:text-[10px]">Nama Siswa</TableHead>
              <TableHead className="font-semibold text-slate-700 w-36 px-6 print:text-slate-900 print:font-black print:border-r print:border-slate-300 print:w-[13%] print:px-2 print:text-[10px]">Kategori</TableHead>
              <TableHead className="font-semibold text-slate-700 w-48 px-6 print:text-slate-900 print:font-black print:border-r print:border-slate-300 print:w-[17%] print:px-2 print:text-[10px]">Jenis Layanan / Kasus</TableHead>
              <TableHead className="font-semibold text-slate-700 px-6 print:text-slate-900 print:font-black print:w-[30%] print:px-2 print:text-[10px]">Keterangan / Catatan Konseling</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-blue-50/50 print:divide-slate-200">
            {reportsToRender.length > 0 ? (
              reportsToRender.map((report, index) => (
                <TableRow key={report.id} className="hover:bg-blue-50/30 transition-colors print:hover:bg-transparent">
                  {/* Checkbox Column (Web only) */}
                  <TableCell className="w-12 px-4 text-center print:hidden">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(report.id)}
                      onChange={() => handleSelectRow(report.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-slate-500 py-4 px-6 text-center print:text-slate-800 print:border-r print:border-slate-300 print:py-1.5 print:px-2 print:text-[9px]">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 py-4 px-6 print:text-slate-800 print:border-r print:border-slate-300 print:py-1.5 print:px-2 print:text-[9px]">
                    {report.date}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 py-4 px-6 print:text-slate-950 print:border-r print:border-slate-300 print:py-1.5 print:px-2 print:text-[9px]">
                    {report.name}
                  </TableCell>
                  <TableCell className="py-4 px-6 print:border-r print:border-slate-300 print:py-1.5 print:px-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border print:border-none print:px-0 print:font-black print:text-[8px] ${report.kategori === "PELANGGARAN"
                        ? "bg-rose-50 text-rose-600 border-rose-100 print:text-rose-700"
                        : "bg-blue-50 text-blue-600 border-blue-100 print:text-blue-700"
                      }`}>
                      {report.kategori}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 py-4 px-6 print:text-slate-800 print:border-r print:border-slate-300 print:py-1.5 print:px-2 print:text-[9px]">
                    {report.type}
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs leading-relaxed py-4 px-6 print:text-slate-800 print:py-1.5 print:px-2 print:text-[8px] print:leading-normal">
                    {report.desc}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center print:border-none">
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
  );
}
