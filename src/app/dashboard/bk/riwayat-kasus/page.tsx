import { Search, Plus, FileText, MoreHorizontal, Calendar, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Filter, Download } from "lucide-react";
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
        <Button className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 px-5 font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-0">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kasus
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
          <Input 
            placeholder="Cari nama siswa atau jenis kasus..." 
            className="pl-9 h-10 bg-white border-blue-100 rounded-lg shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white shadow-none transition-colors">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white shadow-none transition-colors">
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-50 bg-white shadow-none overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[900px]">
            <TableHeader className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border-b border-blue-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700 h-12 px-6 w-16 text-center">No</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12 px-6">Tanggal</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12 px-6">Nama Siswa</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12 px-6">Jenis Kasus</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12 px-6">Keterangan</TableHead>
                <TableHead className="font-semibold text-slate-700 h-12 px-6">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right h-12 px-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-blue-50/50">
              {mockCases.map((kasus, index) => (
                <TableRow key={kasus.id} className="hover:bg-blue-50/30 transition-colors">
                  <TableCell className="text-center text-sm text-slate-400 py-4 px-6">{index + 1}</TableCell>
                  <TableCell className="text-sm text-slate-600 py-4 px-6">{kasus.date}</TableCell>
                  <TableCell className="font-medium text-slate-800 py-4 px-6">{kasus.student}</TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="inline-flex text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{kasus.type}</span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 py-4 px-6">
                    {kasus.title}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      kasus.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 
                      kasus.status === 'Diproses' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {kasus.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Detail">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Edit Data">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Hapus Data">
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
