import { Compass, Lightbulb, Target, ArrowRight, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiswaRekomendasiJurusanPage() {
  return (
    <div className="space-y-6 animate-in-fade max-w-4xl mx-auto">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">Rekomendasi Jurusan</h1>
        <p className="text-slate-500 text-sm font-medium">
          Saran pendidikan lanjutan berdasarkan pemetaan potensi Anda.
        </p>
      </div>

      <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Compass className="h-64 w-64 -mt-10 -mr-10" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
              <Award className="h-4 w-4" />
              Rekomendasi Utama
            </div>
            <div className="inline-flex items-center gap-2 text-blue-100 text-xs font-semibold bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm w-fit">
              <Calendar className="h-3.5 w-3.5" />
              Diterbitkan: 24 Okt 2025
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">SMA - MIPA</h2>
          <p className="text-blue-100 font-medium text-lg max-w-xl">
            (Matematika dan Ilmu Pengetahuan Alam)
          </p>

          <div className="mt-8 pt-8 border-t border-white/20 grid sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-100">
                <Target className="h-5 w-5" />
                <h4 className="font-semibold">Berdasarkan Minat</h4>
              </div>
              <p className="text-sm text-blue-50/80 leading-relaxed font-medium">
                Hasil tes psikologi menunjukkan Anda memiliki kecerdasan Logika-Matematika yang sangat dominan (92%), cocok untuk analisis mendalam.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-100">
                <Lightbulb className="h-5 w-5" />
                <h4 className="font-semibold">Berdasarkan Nilai</h4>
              </div>
              <p className="text-sm text-blue-50/80 leading-relaxed font-medium">
                Rata-rata nilai Sains (IPA) dan Matematika Anda di atas 85 selama 3 semester terakhir, menunjukkan fondasi akademik yang kuat.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm mt-6">
        <h3 className="font-semibold text-slate-800 mb-4">Alternatif Lain</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <h4 className="font-bold text-slate-700">SMK - Teknik Komputer Jaringan (TKJ)</h4>
            <p className="text-xs text-slate-500 font-medium mt-1">Sesuai dengan ketertarikan Anda pada teknologi.</p>
          </div>
          <Button variant="ghost" size="icon" className="text-blue-500">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
