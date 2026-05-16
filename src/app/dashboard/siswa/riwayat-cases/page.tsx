import { Calendar, UserCircle, CheckCircle2, Clock, Check } from "lucide-react";

const myCases = [
  { 
    id: 1, 
    date: "16 Okt 2025", 
    type: "Akademik", 
    title: "Konsultasi penurunan nilai tengah semester", 
    counselor: "Bpk. Ahmad (Guru BK)", 
    status: "Selesai",
    notes: "Siswa disarankan mengikuti kelas tambahan matematika."
  },
  { 
    id: 2, 
    date: "10 Sep 2025", 
    type: "Karir", 
    title: "Pemetaan peminatan SMA/SMK", 
    counselor: "Ibu Rina (Guru BK)", 
    status: "Selesai",
    notes: "Telah diberikan angket minat bakat."
  },
];

export default function SiswaRiwayatKasusPage() {
  return (
    <div className="space-y-6 animate-in-fade max-w-4xl mx-auto">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">Riwayat Bimbingan</h1>
        <p className="text-slate-500 text-sm font-medium">
          Catatan sesi konseling dan bimbingan yang pernah Anda ikuti.
        </p>
      </div>

      <div className="space-y-4">
        {myCases.map((kasus) => (
          <div key={kasus.id} className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400 group-hover:bg-blue-500 transition-colors" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 ml-2">
              <div>
                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">
                  {kasus.type}
                </span>
                <h3 className="text-lg font-semibold text-slate-800">{kasus.title}</h3>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg shrink-0">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{kasus.status}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 ml-2 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-600">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal</p>
                  <p className="text-sm font-medium">{kasus.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                  <UserCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Konselor</p>
                  <p className="text-sm font-medium">{kasus.counselor}</p>
                </div>
              </div>
            </div>

            {kasus.notes && (
              <div className="ml-2 mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Catatan Konselor</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{kasus.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
