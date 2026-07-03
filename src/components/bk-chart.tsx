"use client";

import { useState } from "react";
import { 
  PieChart as ChartIcon, 
  Activity, 
  FolderOpen,
  CheckCircle,
  HelpCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface BKChartProps {
  categoryData: ChartDataItem[];
  statusData: ChartDataItem[];
}

export function BKChart({ categoryData, statusData }: BKChartProps) {
  const [activeTab, setActiveTab] = useState<"kategori" | "status">("kategori");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentData = activeTab === "kategori" ? categoryData : statusData;
  
  // Calculate total values
  const totalValue = currentData.reduce((sum, item) => sum + item.value, 0);

  // SVG parameters
  const radius = 50;
  const strokeWidth = 12;
  const strokeWidthHover = 16;
  const circumference = 2 * Math.PI * radius; // ~314.159

  // Process data for drawing SVG circles
  let accumulatedPercent = 0;
  const slices = currentData.map((item) => {
    const percent = totalValue > 0 ? item.value / totalValue : 0;
    const size = percent * circumference;
    const offset = accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      ...item,
      percent,
      size,
      offset,
    };
  });

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChartIcon className="h-4.5 w-4.5 text-blue-500" />
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Pilih Visualisasi
          </span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl items-center shadow-inner">
          <button
            onClick={() => {
              setActiveTab("kategori");
              setHoveredIndex(null);
            }}
            className={cn(
              "text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer",
              activeTab === "kategori"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Kategori
          </button>
          <button
            onClick={() => {
              setActiveTab("status");
              setHoveredIndex(null);
            }}
            className={cn(
              "text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer",
              activeTab === "status"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Status
          </button>
        </div>
      </div>

      {/* Main Row: Chart & Legend */}
      {totalValue === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 min-h-[220px]">
          <FolderOpen className="h-8 w-8 text-slate-300 mb-2 animate-bounce" />
          <p className="text-xs font-bold text-slate-500">Belum Ada Data Kasus</p>
          <p className="text-[10px] text-slate-400 text-center mt-1 uppercase tracking-wider">
            Semua data kasus konseling yang dicatat akan divisualisasikan di sini.
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[220px]">
          {/* Chart Wrapper (col-span-5) */}
          <div className="md:col-span-5 flex justify-center items-center">
            <div className="relative w-[170px] h-[170px]">
              <svg 
                viewBox="0 0 140 140" 
                className="w-full h-full transform -rotate-90 select-none"
              >
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#f8fafc"
                  strokeWidth={strokeWidth}
                />
                
                {/* Colored Slices */}
                {slices.map((slice, idx) => {
                  if (slice.value === 0) return null;
                  
                  const isHovered = hoveredIndex === idx;
                  return (
                    <circle
                      key={idx}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? strokeWidthHover : strokeWidth}
                      strokeDasharray={`${slice.size} ${circumference}`}
                      strokeDashoffset={-slice.offset}
                      className="transition-all duration-300 cursor-pointer origin-center hover:scale-[1.02]"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Absolute Center Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                {activeSlice ? (
                  <>
                    <span 
                      className="text-[10px] font-extrabold uppercase tracking-wider truncate max-w-[100px]"
                      style={{ color: activeSlice.color }}
                    >
                      {activeSlice.name}
                    </span>
                    <span className="text-xl font-black text-slate-800 mt-0.5">
                      {activeSlice.value}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {Math.round(activeSlice.percent * 100)}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Total
                    </span>
                    <span className="text-2xl font-black text-slate-800">
                      {totalValue}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Kasus
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Legend Area (col-span-7) */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1.5">
              Rincian Distribusi
            </div>
            <div className="space-y-2">
              {slices.map((slice, idx) => {
                const isHovered = hoveredIndex === idx;
                const percentage = totalValue > 0 ? Math.round((slice.value / totalValue) * 100) : 0;
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-xl transition-all duration-200 border border-transparent cursor-pointer",
                      isHovered 
                        ? "bg-slate-50 border-slate-100/80 shadow-xs" 
                        : "hover:bg-slate-50/50"
                    )}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className={cn(
                        "text-xs font-bold truncate transition-colors",
                        isHovered ? "text-slate-800" : "text-slate-600"
                      )}>
                        {slice.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-slate-800">
                        {slice.value}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 w-8 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
