import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
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

export const dynamic = "force-dynamic";

export default async function SiswaRiwayatKasusPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  // Load student and their historical counseling sessions
  const student = await prisma.siswa.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      riwayatKasus: {
        include: {
          guruBk: {
            select: {
              nama: true,
            },
          },
        },
        orderBy: {
          tanggal: "desc",
        },
      },
    },
  });

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-800">Profil Siswa Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">Silakan hubungi Guru BK Anda.</p>
      </div>
    );
  }

  // Map backend cases to ui compatible objects
  const myCases = student.riwayatKasus.map(c => ({
    id: c.id,
    date: c.tanggal.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }),
    type: c.jenis_kasus,
    category: c.kategori, // "KONSELING" or "PELANGGARAN"
    title: c.jenis_kasus,
    counselor: c.guruBk?.nama || "Guru BK",
    status: c.status === "SELESAI" ? "Selesai" : (c.status === "DIPROSES" ? "Diproses" : "Menunggu"),
    notes: c.keterangan
  }));

  const konselingData = myCases.filter(c => c.category === "KONSELING");
  const kasusData = myCases.filter(c => c.category === "PELANGGARAN");

  return (
    <div className="space-y-6 animate-in-fade pb-12">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-xl font-extrabold tracking-wider text-slate-800 uppercase">Rekam Jejak BK Saya</h1>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Informasi lengkap mengenai layanan bimbingan konseling dan catatan kedisiplinan Anda.
        </p>
      </div>

      <Tabs defaultValue="konseling" className="w-full">
        <div className="flex flex-col sm:flex-row justify-start items-center mb-6 gap-4">
          <TabsList variant="line" className="w-full sm:w-auto justify-start gap-6 h-auto rounded-none bg-transparent p-0">
            <TabsTrigger 
              value="konseling" 
              className="text-xs font-semibold uppercase tracking-wider text-slate-400 data-[state=active]:text-slate-800 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
            >
              <FileText className="h-4.5 w-4.5" />
              Sesi Konseling ({konselingData.length})
            </TabsTrigger>
            <TabsTrigger 
              value="kasus" 
              className="text-xs font-semibold uppercase tracking-wider text-slate-400 data-[state=active]:text-slate-800 cursor-pointer border-0 pb-3 mt-3 rounded-none bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none flex gap-2 items-center"
            >
              <AlertCircle className="h-4.5 w-4.5" />
              Catatan Pelanggaran ({kasusData.length})
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

function CaseTable({ data, isKasus = false }: { data: any[], isKasus?: boolean }) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-2xs flex flex-col items-center">
        <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
          {isKasus ? <AlertCircle className="h-8 w-8 text-slate-400" /> : <FileText className="h-8 w-8 text-slate-400" />}
        </div>
        <h3 className="text-slate-700 font-extrabold text-sm uppercase tracking-wider mb-1">Belum ada catatan</h3>
        <p className="text-xs text-slate-400 font-semibold">
          {isKasus ? "Hebat! Anda tidak memiliki catatan pelanggaran kedisiplinan." : "Anda belum memiliki catatan sesi bimbingan konseling."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-2xs overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader className="bg-slate-50/70 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 w-16 text-center">No</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6">Tanggal</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6">Topik / Kasus</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6">Pembimbing (BK)</TableHead>
              <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider h-12 px-6 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {data.map((kasus, index) => (
              <TableRow key={kasus.id} className="hover:bg-slate-50/50 transition-colors border-none">
                <TableCell className="text-center text-xs font-semibold text-slate-400 py-4 px-6">{index + 1}</TableCell>
                <TableCell className="text-xs font-bold text-slate-600 py-4 px-6">{kasus.date}</TableCell>
                <TableCell className="py-4 px-6 max-w-sm">
                  <p className="text-xs font-extrabold text-slate-800 mb-1">{kasus.title}</p>
                  {kasus.notes && (
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 mt-1.5">
                      Catatan: {kasus.notes}
                    </p>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4.5 w-4.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{kasus.counselor}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase border ${
                    kasus.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    kasus.status === 'Diproses' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {kasus.status === 'Selesai' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {kasus.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
