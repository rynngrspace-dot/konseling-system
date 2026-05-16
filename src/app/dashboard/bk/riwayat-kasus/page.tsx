import { Search, Plus, FileText, MoreHorizontal, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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

const mockCases = [
  { id: 1, date: "16 Okt 2025", student: "Andi Pratama", type: "Akademik", title: "Penurunan nilai drastis semester ini", status: "Selesai" },
  { id: 2, date: "15 Okt 2025", student: "Dewi Anggraini", type: "Perilaku", title: "Sering membolos jam pelajaran", status: "Diproses" },
  { id: 3, date: "14 Okt 2025", student: "Eko Prasetyo", type: "Karir", title: "Kebingungan memilih sekolah lanjutan", status: "Menunggu" },
  { id: 4, date: "10 Okt 2025", student: "Citra Lestari", type: "Pribadi", title: "Kesulitan adaptasi lingkungan", status: "Selesai" },
];

export default function RiwayatKasusBKPage() {
  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Riwayat Kasus</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Catatan sesi bimbingan konseling siswa.
          </p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 px-4 font-medium shadow-sm transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Buat Kasus Baru
        </Button>
      </div>

      <div className="space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input 
              placeholder="Cari siswa atau judul..." 
              className="pl-9 h-10 bg-white border-blue-100 focus:border-blue-300 rounded-lg text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-200"
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-white shadow-none overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 h-11 px-4 w-12 text-center">No</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Siswa</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Kategori</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Judul Kasus</TableHead>
                <TableHead className="font-semibold text-slate-700 h-11 px-4">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center h-11 px-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {mockCases.map((kasus, index) => (
                <TableRow key={kasus.id} className="hover:bg-slate-50/50 transition-colors border-none group">
                  <TableCell className="text-center text-sm text-slate-400 px-4 py-3">{index + 1}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {kasus.date}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-700 px-4 py-3">{kasus.student}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-slate-600 text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                      {kasus.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-700 text-sm px-4 py-3">{kasus.title}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      kasus.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 
                      kasus.status === 'Diproses' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {kasus.status}
                    </span>
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
            <span>Menampilkan 1-4 dari 24 data</span>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 border-slate-200 shadow-none rounded-lg" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 min-w-[32px] bg-blue-50 text-blue-600 border-blue-200 shadow-none rounded-lg">1</Button>
              <Button variant="ghost" size="sm" className="h-8 min-w-[32px] text-slate-600 hover:bg-slate-100 rounded-lg">2</Button>
              <Button variant="ghost" size="sm" className="h-8 min-w-[32px] text-slate-600 hover:bg-slate-100 rounded-lg">3</Button>
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
