import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FileText,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Activity,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Make dashboard dynamic
export const dynamic = "force-dynamic";

// Helper to calculate relative times dynamically
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    if (now.getDate() === date.getDate()) {
      return "Hari ini";
    }
    return "Kemarin";
  }
  if (diffDays < 7) {
    return `${diffDays} hari lalu`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} minggu lalu`;
  }
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default async function SiswaDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  // Load the student data from database using their logged-in User.id
  const student = await prisma.siswa.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      nilaiAkademik: true,
      minatBakat: true,
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
      rekomendasiJurusan: {
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
        <p className="text-sm text-slate-500 text-center max-w-md">Akun Anda belum terhubung dengan data siswa di database. Silakan hubungi Admin atau Guru BK Anda.</p>
      </div>
    );
  }

  // Determine Stats
  const totalBimbingan = student.riwayatKasus.length;
  
  const latestCase = student.riwayatKasus[0];
  let latestStatus = "Tidak Ada";
  let statusColor = "text-slate-500 bg-slate-50 border-slate-100";
  let latestCaseDateLabel = "Belum ada sesi bimbingan";

  if (latestCase) {
    latestCaseDateLabel = `Update terakhir: ${getRelativeTimeString(latestCase.updatedAt)}`;
    if (latestCase.status === "SELESAI") {
      latestStatus = "Selesai";
      statusColor = "text-emerald-700 bg-emerald-50 border border-emerald-100";
    } else if (latestCase.status === "DIPROSES") {
      latestStatus = "Diproses";
      statusColor = "text-blue-700 bg-blue-50 border border-blue-100";
    } else {
      latestStatus = "Menunggu";
      statusColor = "text-amber-700 bg-amber-50 border border-amber-100";
    }
  }

  const latestRec = student.rekomendasiJurusan[0];
  const hasRec = !!latestRec;
  const recStatus = hasRec ? "Ready" : "Belum Ada";
  const recSubtext = hasRec 
    ? `${latestRec.rekomendasi_akhir}`
    : "Menunggu klasifikasi BK";

  // Build Recent Activity Feed
  interface ActivityItem {
    title: string;
    time: string;
    icon: any;
    color: string;
    bg: string;
    timestamp: Date;
  }

  const activities: ActivityItem[] = [];

  if (latestRec) {
    activities.push({
      title: `Rekomendasi Jurusan: ${latestRec.rekomendasi_akhir}`,
      time: getRelativeTimeString(latestRec.tanggal),
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50 border-amber-100/50",
      timestamp: latestRec.tanggal
    });
  }

  const latestMinatBakat = student.minatBakat[0];
  if (latestMinatBakat) {
    activities.push({
      title: `Hasil Evaluasi Minat & Bakat diupdate`,
      time: getRelativeTimeString(latestMinatBakat.updatedAt),
      icon: Compass,
      color: "text-indigo-500",
      bg: "bg-indigo-50 border-indigo-100/50",
      timestamp: latestMinatBakat.updatedAt
    });
  }

  student.riwayatKasus.slice(0, 2).forEach(c => {
    activities.push({
      title: `Sesi Bimbingan: ${c.jenis_kasus}`,
      time: getRelativeTimeString(c.tanggal),
      icon: FileText,
      color: c.kategori === "KONSELING" ? "text-blue-500" : "text-rose-500",
      bg: c.kategori === "KONSELING" ? "bg-blue-50 border-blue-100/50" : "bg-rose-50 border-rose-100/50",
      timestamp: c.tanggal
    });
  });

  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 3);

  // Career details
  const mainRec = latestRec?.rekomendasi_akhir || "";
  const detailObj = latestRec?.detail_persentase as any;
  const altRec = detailObj?.alternative?.prediction || "";
  const studentMinat = latestMinatBakat?.minat || "-";
  const studentBakat = latestMinatBakat?.bakat || "-";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white shadow-soft">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight animate-in-fade">Halo, {student.nama}! 👋</h1>
            <p className="mt-2 text-sm font-medium text-emerald-50 opacity-90 max-w-lg animate-in-fade" style={{ animationDelay: '100ms' }}>
              Senang melihatmu kembali. Di sini kamu bisa melihat ringkasan perkembangan bimbingan, catatan riwayat konseling, dan rekomendasi penjurusan belajarmu.
            </p>
          </div>
          <div className="flex gap-2 animate-in-fade" style={{ animationDelay: '200ms' }}>
            <Link href="/dashboard/siswa/riwayat-cases">
              <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-sm border-none font-bold rounded-lg cursor-pointer">
                Riwayat Sesi Saya
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-elegant border border-slate-100 shadow-2xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bimbingan</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800">{totalBimbingan}</div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">Sesi yang telah diikuti</p>
          </CardContent>
        </Card>
        
        <Card className="card-elegant border border-slate-100 shadow-2xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Terakhir</CardTitle>
            <div className="p-2 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={cn("text-lg font-extrabold px-3 py-1 rounded-lg", latestCase ? "shadow-2xs" : "")}>
                <span className={cn("inline-block", latestCase ? "" : "text-slate-400 font-bold")}>
                  {latestStatus}
                </span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-3.5 uppercase tracking-wider">
              {latestCaseDateLabel}
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant border border-slate-100 shadow-2xs rounded-2xl bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rekomendasi Jurusan</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-extrabold", hasRec ? "text-amber-600" : "text-slate-400")}>
              {recStatus}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2.5 uppercase tracking-wider truncate">
              {recSubtext}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="card-elegant border border-slate-100 shadow-2xs rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              <Activity className="h-4.5 w-4.5 text-emerald-600" />
              Aktivitas Terbaru Anda
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Linimasa perkembangan akademik & bimbingan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-bold">Belum ada aktivitas yang tercatat.</span>
              </div>
            ) : (
              sortedActivities.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 hover:border-slate-200 transition-all duration-200 group">
                  <div className={cn("p-2 rounded-lg border", item.bg)}>
                    <item.icon className={cn("h-4.5 w-4.5", item.color)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-extrabold text-slate-800 leading-tight">{item.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-1 uppercase tracking-wider">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Future Path / Career */}
        {hasRec ? (
          <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Compass className="w-48 h-48 text-emerald-400 animate-spin-slow" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white text-xs font-extrabold uppercase tracking-widest">
                <Compass className="h-4.5 w-4.5 text-emerald-400" />
                Eksplorasi Karir Saya
              </CardTitle>
              <CardDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Analisis rekomendasi masa depan oleh AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                Berdasarkan minat dominanmu di bidang <strong className="text-emerald-400 font-extrabold">{studentMinat}</strong> serta bakat alamimu dalam <strong className="text-emerald-400 font-extrabold">{studentBakat}</strong>, sistem AI memprediksi kamu sangat unggul untuk menempuh:
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Rekomendasi Utama:</span>
                  <span className="text-xs font-extrabold text-emerald-400 block">{mainRec}</span>
                </div>

                {altRec && (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Rekomendasi Alternatif (Peringkat 2):</span>
                    <span className="text-xs font-extrabold text-amber-400 block">{altRec}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link href="/dashboard/siswa/rekomendasi-jurusan" className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-lg text-xs transition-all border-0 shadow-lg shadow-emerald-500/10 cursor-pointer">
                    Lihat Analisis Detail & Persentase
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Compass className="w-48 h-48 text-slate-400" />
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white text-xs font-extrabold uppercase tracking-widest">
                <Compass className="h-4.5 w-4.5 text-slate-400" />
                Eksplorasi Karir Saya
              </CardTitle>
              <CardDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Masa depanmu dimulai di sini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                Rekomendasi jurusan resmi Anda sedang diproses oleh Guru Bimbingan Konseling (BK).
              </p>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                  💡 **Catatan BK**: Siswa wajib melengkapi seluruh data **Nilai Rapor** dan **Evaluasi Minat & Bakat** di portal BK sebelum Guru BK dapat menjalankan sistem klasifikasi AI.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/dashboard/siswa/riwayat-cases" className="block">
                  <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold h-11 rounded-lg text-xs transition-all border-0 cursor-pointer">
                    Lihat Aktivitas Bimbingan Saya
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
