"use client";

interface PrintHeaderProps {
  studentFilter: string;
  startDate: string;
  endDate: string;
  formatDateIndo: (dateStr: string) => string;
}

export function PrintHeader({
  studentFilter,
  startDate,
  endDate,
  formatDateIndo,
}: PrintHeaderProps) {
  return (
    <>
      {/* ── PRINT-ONLY LETTERHEAD (KOP SURAT) ────────────────────────────────── */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-3 mb-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">PEMERINTAH KABUPATEN BANDUNG BARAT</h2>
        <h1 className="text-base font-black uppercase tracking-widest text-slate-900 mt-0.5">SMP BINA KARYA NGAMPRAH</h1>
        <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
          Jl. Raya Ngamprah No.123, Kec. Ngamprah, Kabupaten Bandung Barat, Jawa Barat 40552
        </p>
        <p className="text-[8px] text-slate-400 font-medium mt-0.5">
          Email: info@smpbinakaryangamprah.sch.id | Telp: (022) 86861234
        </p>
      </div>

      {/* ── PRINT-ONLY TITLE & ACTIVE FILTER CONTEXT ─────────────────────────── */}
      <div className="hidden print:block text-center mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 underline decoration-1 underline-offset-2">
          REKAPITULASI CATATAN BIMBINGAN & KONSELING SISWA
        </h3>
        {studentFilter !== "ALL" && (
          <p className="text-[9px] text-slate-800 font-extrabold mt-1">
            Nama Siswa: {studentFilter.toUpperCase()}
          </p>
        )}
        {startDate || endDate ? (
          <p className="text-[8px] text-slate-500 font-semibold mt-0.5">
            Periode: {startDate ? formatDateIndo(startDate) : "Awal"} s/d {endDate ? formatDateIndo(endDate) : "Akhir"}
          </p>
        ) : (
          <p className="text-[8px] text-slate-500 font-semibold mt-0.5">Semua Periode Catatan</p>
        )}
        <p className="text-[8px] text-slate-400 font-bold mt-1">
          Tanggal Cetak: {new Date().toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })} WIB
        </p>
      </div>
    </>
  );
}
