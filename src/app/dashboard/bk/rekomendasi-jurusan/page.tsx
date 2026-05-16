import { Search, Compass, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mockRecommendations = [
  { id: 1, name: "Andi Pratama", class: "9A", rec: "SMA - MIPA", confidence: "94%", reason: "Nilai rata-rata Sains 90 dan minat dominan di bidang Teknologi." },
  { id: 2, name: "Budi Santoso", class: "9B", rec: "SMK - Multimedia", confidence: "88%", reason: "Bakat linguistik verbal tinggi dan minat pada Seni/Kreatif." },
  { id: 3, name: "Citra Lestari", class: "9A", rec: "SMA - IPS", confidence: "91%", reason: "Nilai Bahasa stabil dan unggul di komunikasi interpersonal." },
];

export default function RekomendasiJurusanBKPage() {
  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Rekomendasi Jurusan</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Sistem pakar rekomendasi jurusan berdasarkan data terintegrasi.
          </p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 px-4 font-medium shadow-sm transition-all">
          <Compass className="mr-2 h-4 w-4" />
          Generate Rekomendasi
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockRecommendations.map((item) => (
          <div key={item.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">{item.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Kelas {item.class}</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold">{item.confidence}</span>
              </div>
            </div>
            
            <div className="mt-2 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hasil Rekomendasi</p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-sm font-bold text-blue-700">{item.rec}</p>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Analisis Sistem</p>
              <p className="text-xs font-medium text-slate-600 leading-relaxed">{item.reason}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="ghost" size="sm" className="text-blue-600 font-medium">
                Edit / Validasi
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
