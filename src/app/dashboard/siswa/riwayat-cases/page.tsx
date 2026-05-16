import { Calendar, UserCircle, CheckCircle2, Clock, Check, FileText, Eye, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const myCases = [
  { 
    id: 1, 
    date: "16 Okt 2025", 
    type: "Akademik",
    category: "Konseling",
    title: "Konsultasi penurunan nilai tengah semester", 
    counselor: "Bpk. Ahmad (Guru BK)", 
    status: "Selesai",
    notes: "Siswa disarankan mengikuti kelas tambahan matematika."
  },
  { 
    id: 2, 
    date: "15 Okt 2025", 
    type: "Perilaku",
    category: "Kasus",
    title: "Terlambat masuk sekolah 3 kali berturut-turut", 
    counselor: "Ibu Rina (Guru BK)", 
    status: "Diproses",
    notes: "Pemanggilan orang tua dijadwalkan minggu depan."
  },
  { 
    id: 3, 
    date: "10 Sep 2025", 
    type: "Karir",
    category: "Konseling",
    title: "Pemetaan peminatan SMA/SMK", 
    counselor: "Ibu Rina (Guru BK)", 
    status: "Selesai",
    notes: "Telah diberikan angket minat bakat."
  },
];

export default function SiswaRiwayatKasusPage() {
  const konselingData = myCases.filter(c => c.category === "Konseling");
  const kasusData = myCases.filter(c => c.category === "Kasus");

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">Rekam Jejak BK</h1>
        <p className="text-slate-500 text-sm font-medium">
          Informasi lengkap mengenai layanan bimbingan konseling dan catatan kedisiplinan Anda.
        </p>
      </div>

      <Tabs defaultValue="konseling" className="w-full">
        <div className="flex flex-col sm:flex-row justify-start items-center mb-6 gap-4">
          <TabsList variant="line" className="w-full sm:w-auto justify-start gap-6 h-auto rounded-none bg-transparent p-0">
            <TabsTrigger 
              value="konseling" 
              className="text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
            >
              <FileText className="h-4 w-4" />
              Riwayat Konseling
            </TabsTrigger>
            <TabsTrigger 
              value="kasus" 
              className="text-sm font-medium text-slate-500 data-[state=active]:text-rose-600 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
            >
              <AlertCircle className="h-4 w-4" />
              Catatan Pelanggaran
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="konseling" className="m-0 focus-visible:outline-none focus-visible:ring-0 animate-in-fade">
          <CaseTable data={konselingData} />
        </TabsContent>
        
        <TabsContent value="kasus" className="m-0 focus-visible:outline-none focus-visible:ring-0 animate-in-fade">
          <CaseTable data={kasusData} isKasus={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CaseTable({ data, isKasus = false }: { data: typeof myCases, isKasus?: boolean }) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-blue-50 rounded-xl p-12 text-center shadow-none flex flex-col items-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          {isKasus ? <AlertCircle className="h-8 w-8 text-slate-300" /> : <FileText className="h-8 w-8 text-slate-300" />}
        </div>
        <h3 className="text-slate-700 font-semibold mb-1">Belum ada catatan</h3>
        <p className="text-sm text-slate-500">
          {isKasus ? "Anda tidak memiliki catatan pelanggaran kedisiplinan." : "Anda belum pernah melakukan sesi konseling."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-50 bg-white shadow-none overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader className="bg-linear-to-r from-blue-50/50 to-cyan-50/50 border-b border-blue-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-slate-700 h-12 px-6 w-16 text-center">No</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12 px-6">Tanggal</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12 px-6">Kategori</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12 px-6">Topik / Kasus</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12 px-6">Konselor</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12 px-6 text-center">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 h-12 px-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-blue-50/50">
            {data.map((kasus, index) => (
              <TableRow key={kasus.id} className="hover:bg-blue-50/30 transition-colors">
                <TableCell className="text-center text-sm text-slate-400 py-4 px-6">{index + 1}</TableCell>
                <TableCell className="text-sm text-slate-600 py-4 px-6">{kasus.date}</TableCell>
                <TableCell className="py-4 px-6">
                  <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-md ${
                    isKasus ? 'text-rose-600 bg-rose-50' : 'text-blue-600 bg-blue-50'
                  }`}>
                    {kasus.type}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 max-w-sm">
                  <p className="text-sm font-medium text-slate-800 mb-1">{kasus.title}</p>
                  {kasus.notes && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">Catatan: {kasus.notes}</p>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{kasus.counselor}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                    kasus.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 
                    kasus.status === 'Diproses' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {kasus.status === 'Selesai' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {kasus.status}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Detail">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
