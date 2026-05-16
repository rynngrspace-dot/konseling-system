"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/constants/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpenCheck, LogOut } from "lucide-react";

interface SidebarProps {
  links: NavLink[];
  roleLabel: string;
  roleBadgeColor?: "blue" | "emerald";
  isCollapsed: boolean;
  onLogout?: () => void;
}

export function Sidebar({
  links,
  roleLabel,
  roleBadgeColor = "blue",
  isCollapsed,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      data-collapsed={isCollapsed}
      className={cn(
        "hidden md:flex h-full flex-col border-r border-border/50 bg-sidebar/50 backdrop-blur-md transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/50 px-4 shrink-0",
          isCollapsed ? "justify-center" : "justify-start gap-3"
        )}
      >
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300",
          isCollapsed ? "shadow-sm" : ""
        )}>
          <BookOpenCheck className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <span className="text-sm font-bold leading-tight tracking-tight text-sidebar-foreground animate-in-fade line-clamp-2">
            SMP Bina Karya Ngamprah
          </span>
        )}
      </div>



      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Sidebar navigation">
        <ul className="flex flex-col gap-1.5">
          {links.map((link, idx) => (
            <SidebarItem key={idx} link={link} isCollapsed={isCollapsed} pathname={pathname} />
          ))}
        </ul>
      </nav>

      {/* Logout Footer */}
      {onLogout && (
        <div className="border-t border-border/50 p-4 mt-auto">
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className="flex h-10 w-full items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium text-destructive">
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onLogout}
              className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

function SidebarItem({ link, isCollapsed, pathname }: { link: NavLink, isCollapsed: boolean, pathname: string }) {
  const hasItems = !!link.items && link.items.length > 0;
  
  // Check if any sub-item is active
  const isAnyChildActive = hasItems && link.items?.some(item => pathname === item.href);
  const isCurrentActive = link.href ? (pathname === link.href || (link.href !== '/dashboard/bk' && link.href !== '/dashboard/siswa' && pathname.startsWith(link.href))) : false;
  const isActive = isCurrentActive || isAnyChildActive;

  if (isCollapsed) {
    if (hasItems) {
      return (
        <li className="space-y-1.5 mt-2">
          {/* Subtle divider for grouped icons */}
          <div className="flex justify-center mb-1">
            <div className="h-[2px] w-5 rounded-full bg-border/80 opacity-60" />
          </div>
          <ul className="flex flex-col gap-1.5">
            {link.items!.map((sub, sIdx) => {
              const isSubActive = pathname === sub.href;
              return (
                <li key={sIdx}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={sub.href}
                        className={cn(
                          "flex h-10 w-full items-center justify-center rounded-md transition-all duration-200",
                          isSubActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <sub.icon className={cn("h-4 w-4", isSubActive ? "scale-105" : "")} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {sub.title}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </li>
      );
    }

    return (
      <li>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={link.href!}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-md transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className={cn("h-4 w-4", isActive ? "scale-105" : "")} />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {link.title}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return (
    <li className="space-y-1">
      {hasItems ? (
        <div className="space-y-1 mt-3">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
            {link.title}
          </div>
          <ul className="flex flex-col gap-1 pl-2 border-l border-border/50 ml-2">
            {link.items?.map((sub, sIdx) => {
              const isSubActive = pathname === sub.href;
              return (
                <li key={sIdx}>
                  <Link
                    href={sub.href}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-all duration-200",
                      isSubActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-sidebar-foreground font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <sub.icon className={cn("h-4 w-4 shrink-0", isSubActive ? "scale-105" : "")} />
                    <span className="truncate">{sub.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <Link
          href={link.href!}
          className={cn(
            "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition-all duration-200",
            isActive
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-sidebar-foreground font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <link.icon className={cn("h-4 w-4 shrink-0", isActive ? "scale-105" : "")} />
          <span className="truncate">{link.title}</span>
        </Link>
      )}
    </li>
  );
}
