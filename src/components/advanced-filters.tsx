"use client";

import { Calendar, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdvancedFiltersProps {
  show: boolean;
  studentFilter: string;
  setStudentFilter: (val: string) => void;
  categoryFilter: "ALL" | "KONSELING" | "PELANGGARAN";
  setCategoryFilter: (val: "ALL" | "KONSELING" | "PELANGGARAN") => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  uniqueStudents: string[];
}

export function AdvancedFilters({
  show,
  studentFilter,
  setStudentFilter,
  categoryFilter,
  setCategoryFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  uniqueStudents,
}: AdvancedFiltersProps) {
  if (!show) return null;

  return (
    <div className="p-4 bg-blue-50/30 border border-blue-100/50 rounded-xl flex flex-wrap items-center gap-6 animate-in-fade print:hidden">
      {/* Student Specific Dropdown Option */}
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Siswa tertentu</span>
        <div className="relative w-full sm:w-56">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="pl-9 pr-8 h-10 w-full bg-white border border-blue-100 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-0 focus:border-blue-200 cursor-pointer appearance-none animate-in-fade"
          >
            <option value="ALL">Semua Siswa</option>
            {uniqueStudents.map(studentName => (
              <option key={studentName} value={studentName}>
                {studentName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Category Tabs / Filters */}
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Kategori layanan</span>
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto h-10 items-center">
          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`text-xs font-bold px-4 py-1.5 rounded-md transition-all cursor-pointer h-8 ${
              categoryFilter === "ALL" 
                ? "bg-white text-blue-600 shadow-xs" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setCategoryFilter("KONSELING")}
            className={`text-xs font-bold px-4 py-1.5 rounded-md transition-all cursor-pointer h-8 ${
              categoryFilter === "KONSELING" 
                ? "bg-white text-blue-600 shadow-xs" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Konseling
          </button>
          <button
            onClick={() => setCategoryFilter("PELANGGARAN")}
            className={`text-xs font-bold px-4 py-1.5 rounded-md transition-all cursor-pointer h-8 ${
              categoryFilter === "PELANGGARAN" 
                ? "bg-white text-rose-600 shadow-xs" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Pelanggaran
          </button>
        </div>
      </div>

      {/* Date Picker (Range) */}
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Rentang Tanggal</span>
        <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-lg px-3 py-1 shadow-none transition-all duration-200 h-10 w-full sm:w-auto">
          <Calendar className="h-4 w-4 text-blue-400 shrink-0" />
          <Input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 border-none shadow-none focus-visible:ring-0 px-1 text-sm text-slate-600 bg-transparent w-full sm:w-32 cursor-pointer"
          />
          <span className="text-slate-300 font-medium shrink-0">-</span>
          <Input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-8 border-none shadow-none focus-visible:ring-0 px-1 text-sm text-slate-600 bg-transparent w-full sm:w-32 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
