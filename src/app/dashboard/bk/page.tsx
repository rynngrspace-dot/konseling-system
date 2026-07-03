import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Star,
  FolderOpen,
  TrendingUp,
  Activity,
  UserCheck,
  Clock,
  MoreVertical,
  Sparkles
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BKChart } from "@/components/bk-chart";

export const dynamic = "force-dynamic";

export default async function BKDashboardPage() {
  // 1. Fetch Dynamic Statistics from Database
  const totalSiswa = await prisma.siswa.count();

  const konselingAktif = await prisma.riwayatKasus.count({
    where: { status: "DIPROSES" }
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const kasusBaru = await prisma.riwayatKasus.count({
    where: {
      tanggal: { gte: thirtyDaysAgo }
    }
  });

  const avgNilaiResult = await prisma.nilaiAkademik.aggregate({
    _avg: {
      nilai: true
    }
  });
  const avgNilai = avgNilaiResult._avg.nilai ? avgNilaiResult._avg.nilai.toFixed(1) : "0.0";

  // 2. Fetch Dynamic Recent Activities
  const recentCases = await prisma.riwayatKasus.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { siswa: true },
  });

  // 3. Fetch Case Distributions for BKChart
  const casesByCategoryRaw = await prisma.riwayatKasus.groupBy({
    by: ["kategori"],
    _count: {
      _all: true
    }
  });

  const casesByStatusRaw = await prisma.riwayatKasus.groupBy({
    by: ["status"],
    _count: {
      _all: true
    }
  });

  const categoryColors: Record<string, string> = {
    KONSELING: "#3b82f6", // blue-500
    PELANGGARAN: "#f43f5e", // rose-500
  };

  const statusColors: Record<string, string> = {
    SELESAI: "#10b981", // emerald-500
    DIPROSES: "#3b82f6", // blue-500
    MENUNGGU: "#f59e0b", // amber-500
  };

  const categoryNames: Record<string, string> = {
    KONSELING: "Bimbingan Konseling",
    PELANGGARAN: "Kasus Pelanggaran",
  };

  const statusNames: Record<string, string> = {
    SELESAI: "Selesai",
    DIPROSES: "Diproses",
    MENUNGGU: "Menunggu",
  };

  const categoryChartData = casesByCategoryRaw.map((item) => ({
    name: categoryNames[item.kategori] || item.kategori,
    value: item._count._all,
    color: categoryColors[item.kategori] || "#64748b",
  }));

  const statusChartData = casesByStatusRaw.map((item) => ({
    name: statusNames[item.status] || item.status,
    value: item._count._all,
    color: statusColors[item.status] || "#64748b",
  }));

  const recentMinatBakat = await prisma.minatBakat.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { siswa: true },
  });

  // Combine and sort recent activities by date
  const combinedActivities = [
    ...recentCases.map(c => ({
      name: c.siswa.nama,
      action: `Konseling ${c.kategori.toLowerCase()} (${c.jenis_kasus})`,
      time: c.createdAt,
      status: c.status === "SELESAI" ? "Selesai" : c.status === "DIPROSES" ? "Diproses" : "Menunggu",
    })),
    ...recentMinatBakat.map(m => ({
      name: m.siswa.nama,
      action: `Melakukan tes Minat Bakat (${m.minat})`,
      time: m.createdAt,
      status: "Selesai",
    }))
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 4);

  // Fallbacks if database has no records yet
  const activities = combinedActivities.length > 0 ? combinedActivities : [
    {
      name: "Andi Pratama",
      action: "Melakukan tes Minat Bakat (Seni & Sastra)",
      time: new Date(Date.now() - 15 * 60 * 1000),
      status: "Selesai",
    },
    {
      name: "Siti Nurhaliza",
      action: "Sesi bimbingan pribadi (Kasus Kedisiplinan)",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "Menunggu",
    },
    {
      name: "Budi Santoso",
      action: "Input nilai rapor semester ganjil",
      time: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: "Selesai",
    },
    {
      name: "Rina Wijaya",
      action: "Permintaan analisis rekomendasi jurusan",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "Diproses",
    },
  ];

  const stats = [
    {
      title: "Total Siswa",
      value: totalSiswa.toLocaleString("id-ID"),
      description: `Data induk aktif di sistem`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Konseling Aktif",
      value: konselingAktif.toLocaleString("id-ID"),
      description: "Kasus dalam penanganan",
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Kasus Baru",
      value: kasusBaru.toLocaleString("id-ID"),
      description: "Dalam 30 hari terakhir",
      icon: FolderOpen,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Rata-rata Nilai",
      value: avgNilai,
      description: "Rapor prestasi akademik",
      icon: GraduationCap,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];



  const formatActivityTime = (dateInput: Date) => {
    const diffMs = Date.now() - new Date(dateInput).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)} menit yang lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam yang lalu`;
    } else {
      return new Date(dateInput).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short"
      });
    }
  };

  return (
    <div className="space-y-8 animate-in-fade">
      {/* ── Header Area ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          Ringkasan Dashboard BK
        </h1>
        <p className="text-slate-500 text-sm font-semibold">
          Selamat datang kembali, Guru Pendamping. Kelola layanan bimbingan konseling secara real-time.
        </p>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-slate-200/60 shadow-xs shadow-slate-100/50 rounded-2xl group hover:translate-y-[-2px] transition-all duration-300 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {stat.title}
              </CardTitle>
              <div className={cn("rounded-xl p-2 transition-colors border border-slate-100 shadow-xs", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-800">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* ── Main Content Grid ──────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Chart Section */}
        <Card className="lg:col-span-4 border-slate-200/60 shadow-xs rounded-2xl bg-white flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-base font-extrabold tracking-tight text-slate-800">Tren Akademik & Perilaku</CardTitle>
              <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mt-1">
                Visualisasi statistik bimbingan konseling dan prestasi siswa
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-slate-100 cursor-pointer">
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            <BKChart
              categoryData={categoryChartData}
              statusData={statusChartData}
            />
          </CardContent>
        </Card>

        {/* Recent Activities Section */}
        <Card className="lg:col-span-3 border-slate-200/60 shadow-xs rounded-2xl bg-white flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-800">Aktivitas Terkini</CardTitle>
              <CardDescription className="font-bold text-slate-400 text-xs mt-0.5">Log pembaharuan data hari ini.</CardDescription>
            </div>
            <Link href="/dashboard/bk/riwayat-kasus">
              <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-50 hover:text-blue-700 rounded-lg h-8 text-xs cursor-pointer">
                Lihat Semua
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6 relative">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4.5 relative group cursor-default">
                  {idx !== activities.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-[-24px] w-[2px] bg-slate-100 transition-colors group-hover:bg-blue-100" />
                  )}
                  <div className={cn(
                    "mt-1.5 h-[20px] w-[20px] rounded-full border-4 border-white shadow-xs z-10 transition-all duration-300 group-hover:scale-110",
                    activity.status === 'Selesai' ? 'bg-emerald-500' :
                      activity.status === 'Menunggu' ? 'bg-amber-400' : 'bg-blue-500'
                  )} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">
                        {activity.name}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatActivityTime(activity.time)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      {activity.action}
                    </p>
                    <div className="pt-1">
                      <span className={cn(
                        "text-[9px] px-2.5 py-0.5 rounded-lg border font-extrabold tracking-wider uppercase",
                        activity.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                          activity.status === 'Menunggu' ? 'bg-amber-50 text-amber-600 border-amber-100/50' : 'bg-blue-50 text-blue-600 border-blue-100/50'
                      )}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-800 text-white shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Tips Bimbingan Konseling</p>
                <p className="text-[11px] font-semibold leading-relaxed text-slate-200">
                  Lakukan sinkronisasi data nilai akademik siswa secara periodik untuk mendeteksi dini penurunan motivasi belajar.
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Star className="h-14 w-14 fill-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
