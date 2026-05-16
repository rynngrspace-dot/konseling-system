"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { SiswaSidebarLinks } from "@/constants/navigation";

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    // Mock logout logic
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar Desktop */}
      <Sidebar 
        links={SiswaSidebarLinks} 
        roleLabel="Siswa" 
        roleBadgeColor="emerald"
        isCollapsed={isCollapsed}
        onLogout={handleLogout}
      />

      {/* Sidebar Mobile (Drawer) */}
      <MobileDrawer
        links={SiswaSidebarLinks}
        roleLabel="Siswa"
        roleBadgeColor="emerald"
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          userName="Ahmad Faisal"
          role="siswa"
          extraInfo="0023948571"
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onMobileMenuToggle={() => setIsMobileOpen(true)}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
