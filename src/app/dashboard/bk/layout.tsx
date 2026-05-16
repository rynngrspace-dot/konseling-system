"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { BKSidebarLinks } from "@/constants/navigation";

export default function BKLayout({
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
        links={BKSidebarLinks} 
        roleLabel="Admin BK" 
        roleBadgeColor="blue"
        isCollapsed={isCollapsed}
        onLogout={handleLogout}
      />

      {/* Sidebar Mobile (Drawer) */}
      <MobileDrawer
        links={BKSidebarLinks}
        roleLabel="Admin BK"
        roleBadgeColor="blue"
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          userName="Admin BK"
          role="bk"
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
