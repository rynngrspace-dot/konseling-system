import {
  Users,
  GraduationCap,
  Star,
  FolderOpen,
  TrendingUp,
  Activity,
  UserCheck,
  Clock,
  Plus,
  Search,
  FilePlus,
  ArrowRight,
  MoreVertical,
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

const stats = [
  {
    title: "Total Siswa",
    value: "1,284",
    description: "+12 siswa baru minggu ini",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Konseling Aktif",
    value: "24",
    description: "8 perlu tindak lanjut",
    icon: UserCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Kasus Baru",
    value: "12",
    description: "Dalam 30 hari terakhir",
    icon: FolderOpen,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    title: "Rata-rata Nilai",
    value: "78.4",
    description: "+2.1 poin dari semester lalu",
    icon: GraduationCap,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const recentActivities = [
  {
    name: "Andi Pratama",
    action: "Melakukan tes Minat Bakat",
    time: "10 menit yang lalu",
    status: "Selesai",
  },
  {
    name: "Siti Nurhaliza",
    action: "Konseling individu (Kasus Akademik)",
    time: "2 jam yang lalu",
    status: "Menunggu",
  },
  {
    name: "Budi Santoso",
    action: "Update data akademik semester ganjil",
    time: "5 jam yang lalu",
    status: "Selesai",
  },
  {
    name: "Rina Wijaya",
    action: "Permintaan rekomendasi jurusan",
    time: "Kemarin",
    status: "Diproses",
  },
];

export default function BKDashboardPage() {
  return (
    <div className="space-y-8 animate-in-fade">
      {/* ── Header Area ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">Ringkasan Dashboard</h1>
        <p className="text-slate-500 text-sm font-medium">
          Selamat datang kembali, Admin. Pantau perkembangan bimbingan hari ini secara real-time.
        </p>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="card-elegant border-slate-100 shadow-sm group hover:translate-y-[-2px] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {stat.title}
              </CardTitle>
              <div className={cn("rounded-2xl p-2.5 transition-colors shadow-sm", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight text-slate-800">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-medium text-slate-500">
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
        <Card className="lg:col-span-4 card-elegant border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-slate-800">Tren Akademik & Perilaku</CardTitle>
              <CardDescription className="font-medium text-slate-500 uppercase tracking-widest text-[10px] mt-1">
                Grafik perkembangan kolektif siswa bulan ini
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="relative h-[300px] w-full flex items-center justify-center bg-slate-50/40 rounded-3xl border border-dashed border-slate-200 overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-center relative z-10">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft">
                  <Activity className="h-8 w-8 text-primary/30" />
                </div>
                <p className="text-sm text-slate-500 font-bold tracking-tight">Data Visualization Coming Soon</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Connecting to Analytics Engine...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities Section */}
        <Card className="lg:col-span-3 card-elegant border-slate-100 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">Aktivitas Terkini</CardTitle>
              <CardDescription className="font-medium text-slate-500 text-sm">Log bimbingan hari ini.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/5 rounded-lg h-8">
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-7 relative">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 relative group cursor-default">
                  {idx !== recentActivities.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-[-28px] w-[2px] bg-slate-100 transition-colors group-hover:bg-primary/20" />
                  )}
                  <div className={cn(
                    "mt-1.5 h-[20px] w-[20px] rounded-full border-4 border-white shadow-md z-10 transition-all duration-300 group-hover:scale-110",
                    activity.status === 'Selesai' ? 'bg-emerald-500' : 
                    activity.status === 'Menunggu' ? 'bg-amber-400' : 'bg-blue-500'
                  )} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        {activity.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {activity.action}
                    </p>
                    <div className="pt-1">
                      <span className={cn(
                        "text-[10px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide uppercase",
                        activity.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' : 
                        activity.status === 'Menunggu' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      )}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 rounded-2xl bg-slate-800 text-white shadow-soft relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Tips Hari Ini</p>
                <p className="text-xs font-medium leading-relaxed text-slate-200">
                  Pastikan semua laporan bimbingan semester ganjil sudah divalidasi sebelum akhir pekan.
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Star className="h-16 w-16 fill-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
