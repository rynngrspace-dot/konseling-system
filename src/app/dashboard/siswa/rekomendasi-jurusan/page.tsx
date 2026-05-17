import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Compass, Lightbulb, Target, ArrowRight, Award, Calendar, BrainCircuit, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const formatReason = (text: string) => {
  if (!text) return "";
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">$1</strong>');
};

export default async function SiswaRekomendasiJurusanPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  // Load the student and their latest recommendation
  const student = await prisma.siswa.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      minatBakat: {
        orderBy: {
          updatedAt: "desc"
        }
      },
      rekomendasiJurusan: {
        orderBy: {
          tanggal: "desc"
        }
      }
    }
  });

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Compass className="h-12 w-12 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-800">Profil Siswa Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">Silakan hubungi Guru BK Anda.</p>
      </div>
    );
  }

  const latestRec = student.rekomendasiJurusan[0];

  if (!latestRec) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 max-w-md mx-auto text-center">
        <div className="h-16 w-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-2xs">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-wide">Rekomendasi Belum Diterbitkan</h2>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          Guru Bimbingan Konseling (BK) Anda belum menerbitkan rekomendasi jurusan resmi untuk Anda. 
          <br /><br />
          💡 Pastikan data **Nilai Rapor** dan **Evaluasi Minat & Bakat** Anda sudah terisi lengkap agar Guru BK dapat memproses klasifikasi AI.
        </p>
        <Link href="/dashboard/siswa" className="pt-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-lg text-xs cursor-pointer">
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const detailObj = latestRec.detail_persentase as any;
  const mainRec = latestRec.rekomendasi_akhir;
  const altRec = detailObj?.alternative?.prediction || "";
  const altConfidence = detailObj?.alternative?.confidence || "";
  const reason = detailObj?.reason || "";
  const minat = student.minatBakat[0]?.minat || "-";
  const bakat = student.minatBakat[0]?.bakat || "-";
  const confidence = detailObj?.confidence || "90%";

  // Naive Bayes top probabilities
  const nbProbabilities = detailObj?.nb?.probabilities || [];

  return (
    <div className="space-y-6 animate-in-fade pb-12">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-xl font-extrabold tracking-wider text-slate-800 uppercase">Rekomendasi Jurusan Saya</h1>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Hasil analisis kecerdasan buatan berbasis Minat, Bakat, dan Rekam Akademis.
        </p>
      </div>

      {/* Main recommendation banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Compass className="h-64 w-64 -mt-10 -mr-10 animate-spin-slow" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider w-fit">
              <Award className="h-4 w-4 text-amber-300" />
              Rekomendasi Utama
            </div>
            <div className="inline-flex items-center gap-2 text-blue-100 text-[10px] font-bold bg-black/15 px-3.5 py-1.5 rounded-full backdrop-blur-sm w-fit uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              Diterbitkan: {new Date(latestRec.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-wide mb-2">{mainRec}</h2>
            <p className="text-blue-100 font-bold text-sm max-w-xl uppercase tracking-widest">
              Tingkat Keyakinan Konsensus: {confidence} Confidence
            </p>
          </div>

          <div className="pt-6 border-t border-white/20 grid sm:grid-cols-2 gap-6">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-blue-200">
                <Target className="h-4.5 w-4.5" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider">Berdasarkan Minat Anda</h4>
              </div>
              <p className="text-xs text-blue-50/80 leading-relaxed font-semibold">
                Sangat relevan dengan minat utama Anda di bidang <strong className="font-bold text-white bg-white/15 px-1.5 py-0.5 rounded-sm">{minat}</strong>, yang merupakan faktor pendorong motivasi belajar terbesar Anda.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-blue-200">
                <Lightbulb className="h-4.5 w-4.5" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider">Berdasarkan Bakat Anda</h4>
              </div>
              <p className="text-xs text-blue-50/80 leading-relaxed font-semibold">
                Didukung oleh bakat dominan Anda dalam <strong className="font-bold text-white bg-white/15 px-1.5 py-0.5 rounded-sm">{bakat}</strong>, memudahkan Anda menyerap kompetensi praktis pada jurusan ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory AI details */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Decision reason */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Dasar Keputusan AI</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ensemble Logic Explanation</p>
            </div>
          </div>
          <p 
            className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/70 p-4 rounded-xl border border-slate-100" 
            dangerouslySetInnerHTML={{ __html: formatReason(reason) }} 
          />
        </div>

        {/* Alternative Recommendation card */}
        {altRec && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Opsi Peringkat 2
              </div>
              <div>
                <span className="text-[9px] text-amber-100/80 font-bold uppercase tracking-wider block mb-1">Rekomendasi Alternatif:</span>
                <h4 className="text-lg font-black tracking-wide leading-snug">{altRec}</h4>
              </div>
            </div>
            
            <p className="text-[10px] text-amber-50 font-bold leading-normal pt-4 mt-4 border-t border-white/20">
              Alternatif terbaik yang direkomendasikan sistem jika Anda ingin mengeksplorasi rumpun karir cadangan.
            </p>
          </div>
        )}
      </div>

      {/* Probability Distribution */}
      {nbProbabilities.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Matriks Kecocokan Jurusan (Top 3)</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Bayesian Prior & Posterior Probability Distribution</p>
            </div>
          </div>

          <div className="space-y-5">
            {nbProbabilities.slice(0, 3).map((prob: any, idx: number) => {
              // Different colors for ranks
              const colors = [
                "bg-blue-500 shadow-blue-500/10",
                "bg-amber-500 shadow-amber-500/10",
                "bg-slate-400 shadow-slate-400/10"
              ];
              const textColors = [
                "text-blue-700",
                "text-amber-700",
                "text-slate-600"
              ];
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-700">Peringkat {idx + 1}: {prob.className}</span>
                    <span className={`font-black ${textColors[idx]}`}>{prob.prob}% Cocok</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${colors[idx]}`}
                      style={{ width: `${prob.prob}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
