"use client";

export function PrintFooter() {
  const currentDateFormatted = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="hidden print:grid grid-cols-2 gap-12 mt-12 text-center text-[9px] text-slate-800">
      <div>
        <p className="font-medium">Mengetahui,</p>
        <p className="font-extrabold uppercase mt-0.5">Kepala SMP Bina Karya Ngamprah</p>
        <div className="h-16" />
        <p className="font-bold underline">Latifah Wisudawati, S. Kom</p>
        <p className="text-[8px] text-slate-500">NUPTK. 6737763664210182</p>
      </div>
      <div>
        <p className="font-medium">Ngamprah, {currentDateFormatted}</p>
        <p className="font-extrabold uppercase mt-0.5">Guru Bimbingan Konseling</p>
        <div className="h-16" />
        <p className="font-bold underline">Mulziara Filzian</p>
        {/* <p className="text-[8px] text-slate-500">NIP. 197504202005012002</p> */}
      </div>
    </div>
  );
}
