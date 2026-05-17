import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  ArrowLeft, 
  Edit, 
  Calendar, 
  User, 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CaseDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ kasusId?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "GURU_BK") {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const kasusId = resolvedParams.kasusId || "";

  if (!kasusId) {
    redirect("/dashboard/bk/riwayat-kasus");
  }

  const kasus = await prisma.riwayatKasus.findUnique({
    where: { id: kasusId },
    include: {
      siswa: true,
      guruBk: true,
    },
  });

  if (!kasus) {
    redirect("/dashboard/bk/riwayat-kasus");
  }

  const formatDate = (dateInput: Date) => {
    return new Date(dateInput).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in-fade">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/bk/riwayat-kasus">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Kembali ke Daftar</span>
          </Button>
        </Link>
        
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/40">
          Rincian Catatan Sesi
        </div>
      </div>

      {/* Main Details Workspace Card */}
      <Card className="border border-slate-200/60 shadow-xl shadow-slate-100/50 rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-6 px-8 pt-8 bg-slate-50/40">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shadow-xs shrink-0 ${
                kasus.kategori === 'KONSELING' 
                  ? 'text-blue-600 bg-blue-50 border-blue-100/50' 
                  : 'text-amber-600 bg-amber-50 border-amber-100/50'
              }`}>
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <span className={`inline-flex text-[9px] font-extrabold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider mb-1.5 ${
                  kasus.kategori === 'KONSELING' 
                    ? 'text-blue-600 bg-blue-50 border-blue-100' 
                    : 'text-amber-600 bg-amber-50 border-amber-100'
                }`}>
                  Kategori {kasus.kategori}
                </span>
                <CardTitle className="text-lg font-extrabold tracking-tight text-slate-800 leading-tight">
                  {kasus.jenis_kasus}
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs font-semibold mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Sesi dicatat pada {formatDate(kasus.tanggal)}
                </CardDescription>
              </div>
            </div>

            <Link href={`/dashboard/bk/riwayat-kasus/edit?kasusId=${kasus.id}`}>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 px-5 font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer w-full md:w-auto"
              >
                <Edit className="h-4 w-4" />
                Edit Catatan Kasus
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Student Info Card */}
            <div className="bg-slate-50/60 border border-slate-200/40 p-5 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/30">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Identitas Siswa</span>
              </div>
              <div className="space-y-1">
                <span className="font-extrabold text-slate-800 text-xs block">{kasus.siswa.nama}</span>
                <span className="text-[10px] font-semibold text-slate-500 block">NIS: {kasus.siswa.nis}</span>
                <span className="inline-flex text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/40 mt-1">
                  Kelas {kasus.siswa.kelas || "-"}
                </span>
              </div>
            </div>

            {/* BK Teacher Info Card */}
            <div className="bg-slate-50/60 border border-slate-200/40 p-5 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/30">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Pendamping BK</span>
              </div>
              <div className="space-y-1">
                <span className="font-extrabold text-slate-800 text-xs block">{kasus.guruBk.nama}</span>
                <span className="text-[10px] font-semibold text-slate-500 block">NIP: {kasus.guruBk.nip}</span>
                <span className="inline-flex text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/40 mt-1">
                  Guru BK
                </span>
              </div>
            </div>

            {/* Case Status Info Card */}
            <div className="bg-slate-50/60 border border-slate-200/40 p-5 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/30">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Status Tindak Lanjut</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                    kasus.status === 'SELESAI' ? 'bg-emerald-100/70 text-emerald-700 border border-emerald-200' : 
                    kasus.status === 'DIPROSES' ? 'bg-blue-100/70 text-blue-700 border border-blue-200' : 
                    'bg-amber-100/70 text-amber-700 border border-amber-200'
                  }`}>
                    {kasus.status}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Terakhir diupdate: {formatDate(kasus.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Case Chronology Description */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Kronologi & Keterangan Lengkap</span>
            <div className="text-xs font-semibold text-slate-600 leading-relaxed bg-slate-50/40 border border-slate-100 p-6 rounded-2xl shadow-xs whitespace-pre-wrap">
              {kasus.keterangan}
            </div>
          </div>

          {/* Informational Footer Banner */}
          <div className="bg-blue-50/40 border border-blue-100/40 rounded-2xl p-5 flex gap-4 text-xs leading-relaxed text-blue-800 font-semibold shadow-xs">
            <div className="shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="font-bold block text-blue-900 mb-0.5">Kerahasiaan Catatan Bimbingan</span>
              <span>Dokumen ini bersifat rahasia dan merupakan arsip resmi bimbingan konseling SMP Bina Karya Ngamprah. Seluruh isi catatan dilindungi kode etik BK dan hanya dapat diakses oleh personil yang berwenang.</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
