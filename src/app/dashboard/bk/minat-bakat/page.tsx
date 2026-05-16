import { Star, BrainCircuit, Target, UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockMinatBakat = [
  { id: 1, name: "Andi Pratama", class: "9A", dominan: "Logika Matematika", mbti: "INTJ", minat: "Sains & Teknologi", date: "12 Okt 2025" },
  { id: 2, name: "Budi Santoso", class: "9B", dominan: "Linguistik verbal", mbti: "ENFP", minat: "Seni & Jurnalistik", date: "12 Okt 2025" },
  { id: 3, name: "Citra Lestari", class: "9A", dominan: "Kinestetik", mbti: "ESTP", minat: "Olahraga & Fisik", date: "14 Okt 2025" },
];

export default function MinatBakatPage() {
  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Minat dan Bakat</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Hasil asesmen psikologi dan pemetaan potensi siswa.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-blue-100 text-blue-600 hover:bg-blue-50 rounded-lg h-10 px-4 font-medium shadow-sm transition-all">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Hasil
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-10 px-4 font-medium shadow-sm transition-all">
            <FileText className="mr-2 h-4 w-4" />
            Mulai Asesmen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockMinatBakat.map((item) => (
          <div key={item.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">{item.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Kelas {item.class}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-md uppercase tracking-wider">
                {item.mbti}
              </span>
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-indigo-50 p-1.5 rounded-lg text-indigo-500">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kecerdasan Dominan</p>
                  <p className="text-sm font-medium text-slate-700">{item.dominan}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-amber-50 p-1.5 rounded-lg text-amber-500">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minat Karir</p>
                  <p className="text-sm font-medium text-slate-700">{item.minat}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">Diuji: {item.date}</span>
              <Button variant="link" className="text-blue-600 h-auto p-0 font-semibold text-xs group-hover:underline">
                Lihat Detail
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
