"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { Session } from "next-auth";
import { BKSidebarLinks, SiswaSidebarLinks } from "@/constants/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  session: Session;
  roleLabel: string;
  roleBadgeColor: "blue" | "emerald";
  role: "siswa" | "bk";
}

export function DashboardLayout({
  children,
  session,
  roleLabel,
  roleBadgeColor,
  role,
}: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = role === "siswa" ? SiswaSidebarLinks : BKSidebarLinks;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 print:bg-white print:h-auto print:overflow-visible">
      {/* Sidebar Desktop */}
      <Sidebar 
        links={links} 
        roleLabel={roleLabel} 
        roleBadgeColor={roleBadgeColor}
        isCollapsed={isCollapsed}
        onLogout={handleLogout}
      />

      {/* Sidebar Mobile (Drawer) */}
      <MobileDrawer
        links={links}
        roleLabel={roleLabel}
        roleBadgeColor={roleBadgeColor}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible print:h-auto print:w-full">
        <Navbar
          userName={session?.user?.name || "Pengguna"}
          role={role}
          extraInfo={session?.user?.identifier || ""}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onMobileMenuToggle={() => setIsMobileOpen(true)}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:overflow-visible print:h-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
