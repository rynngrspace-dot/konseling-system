"use client";

import { useState, useEffect } from "react";
import { Printer, Search, FileText, RotateCcw, Filter } from "lucide-react";
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

// Extracted Sub-Components for absolute modularity & reuse
import { PrintHeader } from "@/components/print/print-header";
import { PrintFooter } from "@/components/print/print-footer";
import { AdvancedFilters } from "@/components/advanced-filters";

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

interface LaporanClientProps {
  initialReports: ReportItem[];
}

export function LaporanClient({ initialReports }: LaporanClientProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "KONSELING" | "PELANGGARAN">("ALL");
  const [studentFilter, setStudentFilter] = useState("ALL");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selection for Custom Printing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPrintSelectedActive, setIsPrintSelectedActive] = useState(false);

  // Sync afterprint event to restore standard list view
  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrintSelectedActive(false);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  // Get unique student names who have records for the student-specific dropdown
  const uniqueStudents = Array.from(new Set(initialReports.map(r => r.name))).sort();

  // Check if any filters are currently active
  const isFilterActive = 
    searchQuery !== "" || 
    studentFilter !== "ALL" || 
    categoryFilter !== "ALL" || 
    startDate !== "" || 
    endDate !== "";

  // Reset all filters to default states
  const handleResetFilters = () => {
    setSearchQuery("");
    setStudentFilter("ALL");
    setCategoryFilter("ALL");
    setStartDate("");
    setEndDate("");
    setSelectedIds(new Set());
  };

  // Primary filtering logic
  const filteredReports = initialReports.filter(report => {
    // Text Search (searches within Student Name, Case Type, and Description)
    const matchSearch = 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.desc.toLowerCase().includes(searchQuery.toLowerCase());

    // Category Filter
    const matchCategory = categoryFilter === "ALL" || report.kategori === categoryFilter;

    // Student Filter
    const matchStudent = studentFilter === "ALL" || report.name === studentFilter;

    // Date Range Filter
    let matchDate = true;
    if (startDate) matchDate = matchDate && report.isoDate >= startDate;
    if (endDate) matchDate = matchDate && report.isoDate <= endDate;

    return matchSearch && matchCategory && matchStudent && matchDate;
  });

  // Determine what reports are actually rendered during print dialog
  const reportsToRender = isPrintSelectedActive 
    ? filteredReports.filter(r => selectedIds.has(r.id))
    : filteredReports;

  // Single context-aware print handler
  const handlePrint = () => {
    if (selectedIds.size > 0) {
      setIsPrintSelectedActive(true);
      setTimeout(() => {
        window.print();
      }, 80);
    } else {
      setIsPrintSelectedActive(false);
      setTimeout(() => {
        window.print();
      }, 50);
    }
  };

  // Checkbox row toggler
  const handleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Checkbox master toggler
  const handleSelectAll = () => {
    const allFilteredIds = filteredReports.map(r => r.id);
    const areAllSelected = allFilteredIds.every(id => selectedIds.has(id));

    const next = new Set(selectedIds);
    if (areAllSelected) {
      allFilteredIds.forEach(id => next.delete(id));
    } else {
      allFilteredIds.forEach(id => next.add(id));
    }
    setSelectedIds(next);
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-in-fade">
      {/* ── REUSABLE PRINT-ONLY LETTERHEAD & CONTEXT PANEL ──────────────────── */}
      <PrintHeader
        studentFilter={studentFilter}
        startDate={startDate}
        endDate={endDate}
        formatDateIndo={formatDateIndo}
      />

      {/* ── WEB-ONLY HEADER & PRINT CONTROLS ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Laporan Bimbingan Konseling</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Rekapitulasi catatan kasus dan layanan bimbingan aktif per siswa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={handlePrint}
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 px-4 font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-200 border-0"
          >
            <Printer className="mr-2 h-4 w-4" />
            Cetak Laporan {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </Button>
        </div>
      </div>

      {/* ── WEB-ONLY FILTER PANEL ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 print:hidden">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input 
              placeholder="Cari siswa atau kasus..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white border-blue-100 rounded-lg shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-100"
            />
          </div>

          {/* Filter Toggle Button */}
          <Button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`h-10 px-4 rounded-lg border flex items-center gap-2 cursor-pointer transition-all duration-300 font-semibold text-xs shrink-0 ${
              showAdvancedFilters 
                ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" 
                : "bg-white text-slate-600 border-blue-100 hover:bg-slate-50"
            }`}
          >
            <Filter className="h-4 w-4 shrink-0" />
            <span>Filter Lanjutan</span>
          </Button>

          {/* Reset Filter Button */}
          {isFilterActive && (
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="h-10 px-3 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 flex items-center gap-1.5 transition-all duration-200 cursor-pointer animate-in-fade"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Total Badge */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 text-sm text-blue-600 font-semibold bg-blue-50/50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Total: <strong>{filteredReports.length}</strong> Terfilter</span>
        </div>
      </div>

      {/* ── REUSABLE COLLAPSIBLE ADVANCED FILTERS PANEL ──────────────────────── */}
      <AdvancedFilters
        show={showAdvancedFilters}
        studentFilter={studentFilter}
        setStudentFilter={setStudentFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        uniqueStudents={uniqueStudents}
      />

      {/* ── TABLE AREA ──────────────────────────────────────────────────────── */}
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
                    <TableCell className="font-bold text-slate-800 py-4 px-6 print:text-slate-950 print:border-r print:border-slate-300 print:py-1.5 print:px-2 print:text-[9px]">
                      {report.name}
                    </TableCell>
                    <TableCell className="py-4 px-6 print:border-r print:border-slate-300 print:py-1.5 print:px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border print:border-none print:px-0 print:font-black print:text-[8px] ${
                        report.kategori === "PELANGGARAN"
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

      {/* ── REUSABLE PRINT-ONLY FOOTER SIGNATURES ────────────────────────────── */}
      <PrintFooter />
    </div>
  );
}
