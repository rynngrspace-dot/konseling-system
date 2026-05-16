import { BarChart3, PieChart, LineChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LaporanPage() {
  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Laporan & Statistik</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Visualisasi data dan ekspor laporan layanan BK.
          </p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 px-4 font-medium shadow-sm transition-all">
          <Download className="mr-2 h-4 w-4" />
          Ekspor PDF
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Placeholder Chart 1 */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800">Distribusi Kasus Bulanan</h3>
          </div>
          <div className="h-64 w-full bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-slate-400">Chart Area</p>
            <p className="text-xs text-slate-400 mt-1">Requires Recharts library</p>
          </div>
        </div>

        {/* Placeholder Chart 2 */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500">
              <PieChart className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800">Minat Jurusan Siswa Kelas 9</h3>
          </div>
          <div className="h-64 w-full bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-slate-400">Chart Area</p>
            <p className="text-xs text-slate-400 mt-1">Requires Recharts library</p>
          </div>
        </div>
        
        {/* Placeholder Chart 3 */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-amber-50 p-2 rounded-lg text-amber-500">
              <LineChart className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800">Tren Nilai Akademik Semester Ganjil</h3>
          </div>
          <div className="h-64 w-full bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-slate-400">Chart Area</p>
            <p className="text-xs text-slate-400 mt-1">Requires Recharts library</p>
          </div>
        </div>
      </div>
    </div>
  );
}
