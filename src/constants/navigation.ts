import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Star,
  FolderOpen,
  Compass,
  BarChart3,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type NavSubItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavLink = {
  /** Label teks yang ditampilkan di sidebar */
  title: string;
  /** Rute tujuan (opsional jika memiliki sub-items) */
  href?: string;
  /** Icon dari lucide-react */
  icon: LucideIcon;
  /** Sub-items untuk menu bertingkat */
  items?: NavSubItem[];
};

// ─────────────────────────────────────────────────────────────────────────────
// BK Sidebar Links  (Admin Bimbingan & Konseling)
// ─────────────────────────────────────────────────────────────────────────────

export const BKSidebarLinks: NavLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard/bk",
    icon: LayoutDashboard,
  },
  {
    title: "Data Master",
    icon: Users,
    items: [
      {
        title: "Data Siswa",
        href: "/dashboard/bk/data-siswa",
        icon: Users,
      },
      {
        title: "Nilai Akademik",
        href: "/dashboard/bk/nilai-akademik",
        icon: GraduationCap,
      },
    ],
  },
  {
    title: "Layanan BK",
    icon: FolderOpen,
    items: [
      {
        title: "Minat dan Bakat",
        href: "/dashboard/bk/minat-bakat",
        icon: Star,
      },
      {
        title: "Riwayat Kasus",
        href: "/dashboard/bk/riwayat-kasus",
        icon: FolderOpen,
      },
      {
        title: "Rekomendasi",
        href: "/dashboard/bk/rekomendasi-jurusan",
        icon: Compass,
      },
    ],
  },
  {
    title: "Laporan",
    href: "/dashboard/bk/laporan",
    icon: BarChart3,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Siswa Sidebar Links
// ─────────────────────────────────────────────────────────────────────────────

export const SiswaSidebarLinks: NavLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard/siswa",
    icon: LayoutDashboard,
  },
  {
    title: "Menu Utama",
    icon: Compass,
    items: [
      {
        title: "Riwayat Kasus",
        href: "/dashboard/siswa/riwayat-cases",
        icon: FileText,
      },
      {
        title: "Rekomendasi Jurusan",
        href: "/dashboard/siswa/rekomendasi-jurusan",
        icon: Compass,
      },
    ],
  },
];
