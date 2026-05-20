"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, Fragment } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { X, BookOpenCheck, LogOut } from "lucide-react";

interface MobileDrawerProps {
  links: NavLink[];
  roleLabel: string;
  roleBadgeColor?: "blue" | "emerald";
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export function MobileDrawer({
  links,
  roleLabel,
  roleBadgeColor = "blue",
  isOpen,
  onClose,
  onLogout,
}: MobileDrawerProps) {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  // Close only when pathname actually changes
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      onClose();
      prevPathname.current = pathname;
    }
  }, [pathname, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-sidebar shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-5 shrink-0 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            {!logoError ? (
              <Image
                src="/assets/images/Logo.png"
                alt="Logo SMP Bina Karya"
                width={28}
                height={28}
                className="h-7 w-7 object-contain shrink-0"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <BookOpenCheck className="h-4 w-4" />
              </div>
            )}
            <span className="text-xs font-bold leading-tight tracking-tight text-sidebar-foreground line-clamp-2">SMP Bina Karya Ngamprah</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent rounded-xl"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Role badge */}
        <div className="px-5 pt-5 pb-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm",
              roleBadgeColor === "blue"
                ? "bg-blue-50 text-blue-600 border border-blue-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            )}
          >
            {roleLabel}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1.5">
            {links.map((link, idx) => {
              const hasItems = !!link.items && link.items.length > 0;
              const isActive = link.href ? (pathname === link.href || (link.href !== '/dashboard/bk' && link.href !== '/dashboard/siswa' && pathname.startsWith(link.href))) : false;

              return (
                <Fragment key={`group-${idx}`}>
                  {hasItems ? (
                    <li className="space-y-1.5 mt-2">
                      <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                        {link.title}
                      </div>
                      <ul className="flex flex-col gap-1 ml-2 pl-3 border-l-2 border-border/40">
                        {link.items?.map((sub, sIdx) => {
                          const isSubActive = pathname === sub.href || (sub.href !== '/dashboard/bk' && sub.href !== '/dashboard/siswa' && pathname.startsWith(sub.href));
                          const SubIcon = sub.icon;
                          return (
                            <li key={`sub-${idx}-${sIdx}`}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  "flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-all duration-200",
                                  isSubActive
                                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                                    : "text-sidebar-foreground font-semibold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                )}
                              >
                                <SubIcon className={cn("h-4 w-4 shrink-0", isSubActive ? "scale-105" : "")} />
                                <span className="truncate">{sub.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ) : (
                    <li key={`link-${idx}`}>
                      <Link
                        href={link.href!}
                        className={cn(
                          "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-sm"
                            : "text-sidebar-foreground font-semibold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <link.icon className={cn("h-4 w-4 shrink-0", isActive ? "scale-105" : "")} />
                        <span className="truncate">{link.title}</span>
                      </Link>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ul>
        </nav>

        {/* Logout Footer */}
        {onLogout && (
          <div className="border-t border-border/50 p-4 mt-auto bg-background/50 backdrop-blur-md">
            <button
              onClick={onLogout}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
