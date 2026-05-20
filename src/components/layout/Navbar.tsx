"use client";

import { useState } from "react";
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

        {/* Avatar with Dropdown */}
        <div className="relative">
          <Avatar
            className={cn(
              "h-9 w-9 border shadow-sm cursor-pointer hover:opacity-90 transition-opacity",
              isAdmin ? "border-blue-100" : "border-emerald-100",
              isProfileOpen ? "ring-2 ring-primary/20" : ""
            )}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
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

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              {/* Click-outside backdrop */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsProfileOpen(false)}
              />
              {/* Dropdown Menu Box */}
              <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-slate-100 bg-white p-1 shadow-lg shadow-slate-100/50 z-50 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-xs border-b border-slate-100 text-slate-700">
                  <p className="font-bold text-slate-800 truncate">{userName}</p>
                  {extraInfo && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                      {role === "siswa" ? `NISN: ${extraInfo}` : extraInfo}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors mt-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
