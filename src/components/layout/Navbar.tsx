"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, Menu, ShieldCheck, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  /** Nama user */
  userName: string;
  /** URL foto profil */
  userAvatar?: string;
  /** Role user: 'bk' atau 'siswa' */
  role: "bk" | "siswa";
  /** Identitas tambahan (NISN untuk siswa) */
  extraInfo?: string;
  /** Handler untuk membuka menu mobile */
  onMobileMenuToggle: () => void;
  /** State collapse sidebar */
  isCollapsed: boolean;
  /** Handler untuk toggle collapse */
  onToggleCollapse: () => void;
  /** Handler untuk logout */
  onLogout: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Navbar({
  userName,
  userAvatar,
  role,
  extraInfo,
  isCollapsed,
  onToggleCollapse,
  onMobileMenuToggle,
  onLogout,
}: NavbarProps) {
  const isAdmin = role === "bk";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 md:px-6 shrink-0 print:hidden">
      {/* ── Left Section ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex h-9 w-9 text-muted-foreground hover:text-primary transition-colors rounded-lg"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        {/* Brand/Title */}
        <div className="hidden md:flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight text-foreground">
            {isAdmin ? "Panel Admin BK" : "Portal Siswa Mandiri"}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
            {isAdmin ? "Bimbingan & Konseling" : "Layanan Siswa Terpadu"}
          </span>
        </div>
      </div>

      {/* ── Right Section ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Role Chip (Admin only) */}
        {isAdmin && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <ShieldCheck className="h-3 w-3" />
            Admin BK
          </span>
        )}

        {/* User profile info */}
        <div className="hidden sm:flex flex-col items-end leading-none">
          <span className="text-sm font-semibold text-foreground tracking-tight">{userName}</span>
          {extraInfo && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1.5 opacity-70">
              {role === "siswa" ? `NISN: ${extraInfo}` : extraInfo}
            </span>
          )}
        </div>

        {/* Avatar */}
        <Avatar
          className={cn(
            "h-9 w-9 border shadow-sm",
            isAdmin ? "border-blue-100" : "border-emerald-100"
          )}
        >
          {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
          <AvatarFallback
            className={cn(
              "text-white text-sm font-semibold",
              isAdmin ? "bg-primary" : "bg-emerald-500"
            )}
          >
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Separator (Siswa style) */}
        {!isAdmin && (
          <div className="hidden sm:block h-8 w-px bg-border/60 mx-1" />
        )}

        {/* Logout Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-muted-foreground transition-all duration-300 rounded-lg",
                isAdmin 
                  ? "hover:text-primary hover:bg-primary/10" 
                  : "hover:text-emerald-600 hover:bg-emerald-50"
              )}
              onClick={onLogout}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isAdmin ? "Logout" : "Keluar Aplikasi"}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
