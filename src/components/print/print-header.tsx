"use client";

import { useState } from "react";
import Image from "next/image";

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
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      {/* ── PRINT-ONLY LETTERHEAD (KOP SURAT) ────────────────────────────────── */}
      <div className="hidden print:block relative border-b-2 border-slate-800 pb-1 mb-4 text-slate-900 min-h-[80px]">
        {/* Logo absolutely positioned on the left */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-start">
          {!logoError && (
            <Image
              src="/assets/images/Logo.png"
              alt="Logo YPM Pancasila"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
              onError={() => setLogoError(true)}
            />
          )}
        </div>

        {/* Centered Text */}
        <div className="text-center w-full px-20 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wide leading-tight">
            YAYASAN PENDIDIKAN MUSLIM ( YPM ) PANCASILA
          </h2>

          <h1 className="text-sm font-black uppercase tracking-wider leading-tight mt-1">
            SMP BINA KARYA NGAMPRAH
          </h1>
          <p className="text-[7.5px] font-semibold uppercase tracking-tight leading-tight mt-0.5">
            NSS : 202020831290 NPSN : 20252485
          </p>
          <p className="text-[7px] font-medium leading-normal mt-1">
            Jalan Pangkalan Desa Cimanggu Kec. Ngamprah Kab. Bandung Barat Telp. 081322168626 Kode Pos 40552{" "}
            <span className="text-blue-600 font-semibold underline">E-mail: smpbinakarya@yahoo.com</span>
          </p>
        </div>
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
