import {
  LayoutDashboard,
  FileText,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Activity,
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

export default function SiswaDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-emerald-500/90 p-8 text-white shadow-soft">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight animate-in-fade">Halo, Ahmad Faisal! 👋</h1>
            <p className="mt-2 text-sm font-medium text-emerald-50 opacity-90 max-w-lg animate-in-fade" style={{ animationDelay: '100ms' }}>
              Senang melihatmu kembali. Di sini kamu bisa melihat ringkasan perkembangan bimbingan dan rekomendasi belajarmu.
            </p>
          </div>
          <div className="flex gap-2 animate-in-fade" style={{ animationDelay: '200ms' }}>
            <Link href="/dashboard/siswa/riwayat-cases">
              <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-sm border-none font-bold">
                Riwayat Saya
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-elegant border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Bimbingan</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">12</div>
            <p className="text-[10px] font-semibold text-muted-foreground mt-2 uppercase tracking-wider">Sesi yang telah diikuti</p>
          </CardContent>
        </Card>
        <Card className="card-elegant border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Status Terakhir</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-600">Selesai</div>
            <p className="text-[10px] font-semibold text-muted-foreground mt-2 uppercase tracking-wider">Update terakhir: 2 hari lalu</p>
          </CardContent>
        </Card>
        <Card className="card-elegant border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Rekomendasi</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">Ready</div>
            <p className="text-[10px] font-semibold text-muted-foreground mt-2 uppercase tracking-wider">3 jurusan disarankan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity / Next Step */}
        <Card className="card-elegant border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-emerald-600" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>Apa yang baru di portalmu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: "Hasil Tes Minat Bakat", time: "Kemarin", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
              { title: "Catatan Konseling Akademik", time: "3 hari lalu", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 border border-transparent hover:border-slate-200 transition-all duration-200 group animate-in-fade" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={cn("p-2 rounded-lg shadow-sm", item.bg)}>
                  <item.icon className={cn("h-5 w-5", item.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Future Path / Career */}
        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Compass className="h-5 w-5 text-emerald-400" />
              Eksplorasi Karir
            </CardTitle>
            <CardDescription className="text-slate-400">Temukan masa depanmu di sini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300">
              Berdasarkan minat terakhirmu, kamu cocok di bidang <strong>Teknologi Informasi</strong> atau <strong>Desain Kreatif</strong>.
            </p>
            <Link href="/dashboard/siswa/rekomendasi-jurusan" className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Lihat Detail Rekomendasi
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
