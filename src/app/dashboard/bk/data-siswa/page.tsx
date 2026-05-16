import { Search, Plus, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from "lucide-react";
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

const mockStudents = [
  { id: 1, nisn: "0012345678", name: "Andi Pratama", class: "9A", gender: "Laki-laki" },
  { id: 2, nisn: "0012345679", name: "Budi Santoso", class: "9B", gender: "Laki-laki" },
  { id: 3, nisn: "0012345680", name: "Citra Lestari", class: "9A", gender: "Perempuan" },
  { id: 4, nisn: "0012345681", name: "Dewi Anggraini", class: "8C", gender: "Perempuan" },
  { id: 5, nisn: "0012345682", name: "Eko Prasetyo", class: "7B", gender: "Laki-laki" },
  { id: 6, nisn: "0012345683", name: "Fajar Hidayat", class: "9C", gender: "Laki-laki" },
];

export default function DataSiswaPage() {
  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Data Siswa</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Kelola data induk siswa SMP Bina Karya Ngamprah.
          </p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white rounded-lg h-10 px-4 font-medium shadow-sm transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      <div className="space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input 
              placeholder="Cari NISN atau Nama..." 
              className="pl-9 h-10 bg-white border-blue-100 focus:border-blue-300 rounded-lg text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-200"
            />
          </div>
          <Button variant="outline" className="h-10 rounded-lg border-blue-100 text-blue-600 hover:bg-blue-50 w-full sm:w-auto font-medium shadow-none">
            <Filter className="mr-2 h-4 w-4" />
            Filter Kelas
          </Button>
        </div>

        <div className="rounded-xl border border-blue-100 bg-white shadow-none overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 h-11 px-4 w-12 text-center">No</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">NISN</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Nama Lengkap</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Kelas</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Jenis Kelamin</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {mockStudents.map((student, index) => (
                <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors border-none group">
                  <TableCell className="text-center text-sm text-slate-400 px-4 py-3">{index + 1}</TableCell>
                  <TableCell className="text-sm text-slate-500 px-4 py-3">{student.nisn}</TableCell>
                  <TableCell className="text-sm font-medium text-slate-700 px-4 py-3">{student.name}</TableCell>
                  <TableCell className="text-sm text-slate-500 px-4 py-3">{student.class}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                      student.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {student.gender}
                    </span>
                  </TableCell>
                  <TableCell className="text-center px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
            <span>Menampilkan 1-6 dari 1,284 data</span>
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
