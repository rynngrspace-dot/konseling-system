import { Search, Filter, MoreHorizontal, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from "lucide-react";
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

const mockScores = [
  { id: 1, nisn: "0012345678", name: "Andi Pratama", class: "9A", math: 85, science: 90, language: 88, average: 87.6, trend: "up" },
  { id: 2, nisn: "0012345679", name: "Budi Santoso", class: "9B", math: 78, science: 82, language: 80, average: 80.0, trend: "stable" },
  { id: 3, nisn: "0012345680", name: "Citra Lestari", class: "9A", math: 92, science: 88, language: 95, average: 91.6, trend: "up" },
  { id: 4, nisn: "0012345681", name: "Dewi Anggraini", class: "8C", math: 65, science: 70, language: 75, average: 70.0, trend: "down" },
  { id: 5, nisn: "0012345682", name: "Eko Prasetyo", class: "7B", math: 80, science: 75, language: 82, average: 79.0, trend: "stable" },
];

export default function NilaiAkademikPage() {
  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Nilai Akademik</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Pantau perkembangan nilai akademik siswa secara berkala.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input 
              placeholder="Cari Siswa..." 
              className="pl-9 h-10 bg-white border-blue-100 focus:border-blue-300 rounded-lg text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-200"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="h-10 rounded-lg border-blue-100 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none font-medium shadow-none">
              <Filter className="mr-2 h-4 w-4" />
              Semester
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-white shadow-none overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 h-11 px-4 w-12 text-center">No</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Siswa</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">Matematika</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">IPA</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">B. Indo</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">Rata-rata</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">Tren</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {mockScores.map((score, index) => (
                <TableRow key={score.id} className="hover:bg-slate-50/50 transition-colors border-none group">
                  <TableCell className="text-center text-sm text-slate-400 px-4 py-3">{index + 1}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-700">{score.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{score.nisn} • {score.class}</div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600 px-4 py-3">{score.math}</TableCell>
                  <TableCell className="text-center text-sm text-slate-600 px-4 py-3">{score.science}</TableCell>
                  <TableCell className="text-center text-sm text-slate-600 px-4 py-3">{score.language}</TableCell>
                  <TableCell className="text-center px-4 py-3">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">{score.average}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex justify-center">
                      {score.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                      {score.trend === 'down' && <TrendingDown className="h-4 w-4 text-rose-500" />}
                      {score.trend === 'stable' && <Minus className="h-4 w-4 text-slate-400" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
              <Button variant="ghost" size="sm" className="h-8 min-w-[32px] text-slate-600 hover:bg-slate-100 rounded-lg">3</Button>
              <span className="px-1 text-slate-400">...</span>
              <Button variant="ghost" size="sm" className="h-8 min-w-[32px] text-slate-600 hover:bg-slate-100 rounded-lg">10</Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 border-slate-200 shadow-none hover:bg-slate-50 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
