"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Database,
  Code,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  HardDrive,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { APP_CONFIG } from "@/config/constants";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJobMonitor } from "@/components/dashboard/job-monitor";
import { Loader2, Activity } from "lucide-react";

/* ─── Nav Sections ─────────────────────────────────────────── */

const MAIN_NAV = [
  { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { label: "Nuevo scraping", href: "/dashboard/scrape", icon: PlusCircle },
  { label: "Ejecuciones", href: "/dashboard/jobs", icon: List },
  { label: "Conjuntos de datos", href: "/dashboard/datasets", icon: Database },
];

const BOTTOM_NAV = [
  { label: "Referencia API", href: "/dashboard/api", icon: Code },
  { label: "Configuración", href: "/dashboard/settings", icon: Settings },
];

/* ─── Usage Stats (mock) ───────────────────────────────────── */

const USAGE_STATS = {
  requests: { used: 1240, total: 10000, label: "Peticiones" },
  storage: { used: 48, total: 500, label: "Almacenamiento (MB)" },
};

/* ─── Component ────────────────────────────────────────────── */

/* ─── Components ───────────────────────────────────────────── */

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden h-screen border-r border-border/40 bg-card/80 backdrop-blur-md transition-[width] duration-300 ease-in-out md:flex",
        collapsed ? "md:w-[60px]" : "md:w-[240px]",
      )}
    >
      <SidebarContent collapsed={collapsed} onCollapsedChange={setCollapsed} />
    </aside>
  );
}

export function SidebarContent({
  onSelect,
  hideCollapseControl = false,
  collapsed: collapsedProp,
  onCollapsedChange,
}: {
  onSelect?: () => void;
  hideCollapseControl?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
}) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const { user } = useUser();
  const { activeJobs, isScraping } = useJobMonitor();
  const shouldHideCollapseControl = hideCollapseControl && isMobileViewport;
  const collapsed =
    typeof collapsedProp === "boolean" ? collapsedProp : internalCollapsed;
  const setCollapsed =
    onCollapsedChange ??
    ((next: boolean) => {
      setInternalCollapsed(next);
    });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobileViewport(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const NavLink = ({
    href,
    icon: Icon,
    label,
    active,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
  }) => {
    const linkContent = (
      <Link
        href={href}
        onClick={onSelect}
        className={cn(
          "sidebar-active-indicator flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
          active
            ? "active bg-primary/8 text-foreground"
            : "text-muted-foreground hover:bg-foreground/4 hover:text-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors",
            active ? "text-primary" : "text-muted-foreground/70",
          )}
        />
        {!collapsed && <span>{label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            <p className="text-xs font-medium">{label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative flex h-full flex-col backdrop-blur-md transition-all duration-300 ease-in-out",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        {/* ── User Profile (top) ─────────────────────────── */}
        <div
          className={cn(
            "flex items-center gap-2.5 border-b border-border/30 px-3 py-[18.5px]",
            collapsed && "justify-center",
          )}
        >
          <div className="shrink-0">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col -mt-2">
              <span className="truncate text-[14px] font-medium text-foreground">
                {user?.fullName || user?.firstName || "Usuario"}
              </span>
              <span className="truncate text-[11px] text-muted-foreground/70 -mt-0.5">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </span>
            </div>
          )}
        </div>

        {/* ── Main Navigation ────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(item.href)}
                />
              </li>
            ))}
          </ul>

          {/* Separator + secondary nav */}
          <div className="my-3 mx-3 h-px bg-border/30" />

          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Herramientas
            </p>
          )}

          <ul className="flex flex-col gap-0.5">
            {BOTTOM_NAV.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(item.href)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Active Jobs Indicator ──────────────────────── */}
        {isScraping && (
          <div className="mx-2 mb-3">
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 transition-all duration-300",
                collapsed ? "justify-center px-0" : "px-3",
              )}
            >
              <div className="relative">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <Loader2 className="absolute -top-1 -right-1 h-2 w-2 text-primary animate-spin" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-primary">
                    Scraping {activeJobs.length}{" "}
                    {activeJobs.length === 1 ? "job" : "jobs"}
                  </span>
                  <span className="text-[10px] text-primary/60">
                    En progreso...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Usage Stats (Commented out until implemented) */}
        {/* !collapsed && (
          <div className="flex flex-col gap-2.5 border-t border-border/30 px-4 py-3">
            {Object.values(USAGE_STATS).map((stat) => {
              const pct = Math.round((stat.used / stat.total) * 100);
              return (
                <div key={stat.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground/70">
                      {stat.label}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {stat.used.toLocaleString()} /{" "}
                      {stat.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="usage-bar-fill h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) */}

        {/* Collapsed stats (Commented out until implemented) */}
        {/* collapsed && (
          <div className="flex flex-col items-center gap-2 border-t border-border/30 px-2 py-3">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <div className="h-1 w-6 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="usage-bar-fill h-full rounded-full"
                      style={{
                        width: `${Math.round((USAGE_STATS.requests.used / USAGE_STATS.requests.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <p className="text-xs">
                  {USAGE_STATS.requests.used.toLocaleString()} /{" "}
                  {USAGE_STATS.requests.total.toLocaleString()} peticiones
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1">
                  <HardDrive className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <div className="h-1 w-6 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="usage-bar-fill h-full rounded-full"
                      style={{
                        width: `${Math.round((USAGE_STATS.storage.used / USAGE_STATS.storage.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <p className="text-xs">
                  {USAGE_STATS.storage.used} / {USAGE_STATS.storage.total} MB
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        ) */}

        {/* ── Bottom: Logo + Collapse ────────────────────── */}
        <div className="flex items-center justify-between border-t border-border/30 px-3 py-2.5">
          {!collapsed ? (
            <>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <span className="text-[10px] font-bold">SC</span>
                </div>
                <span className="text-[12px] font-medium text-muted-foreground">
                  {APP_CONFIG.name}
                </span>
              </Link>
              {!shouldHideCollapseControl && (
                <button
                  onClick={() => setCollapsed(true)}
                  className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-foreground/4 hover:text-foreground"
                  aria-label="Colapsar barra lateral"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex w-full flex-col items-center gap-2">
              <Link href="/" className="flex items-center justify-center">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <span className="text-[10px] font-bold">SC</span>
                </div>
              </Link>
              {!shouldHideCollapseControl && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCollapsed(false)}
                      className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-foreground/4 hover:text-foreground"
                      aria-label="Expandir barra lateral"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    <p className="text-xs">Expandir</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
