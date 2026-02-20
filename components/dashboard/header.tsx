"use client";

import Link from "next/link";
import { Bell, Plus, Check, Settings, Trash2, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNotifications } from "@/components/dashboard/job-monitor";
import { SidebarContent } from "@/components/dashboard/sidebar";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/30 bg-background/80 px-4 py-[11px] backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu trigger */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 p-0 md:hidden"
              aria-label="Menú principal"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de navegación</SheetTitle>
            </SheetHeader>
            <div className="h-full pt-4">
              <SidebarContent
                onSelect={() => setIsMobileMenuOpen(false)}
                hideCollapseControl
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex flex-col gap-0.5">
          <h1
            suppressHydrationWarning
            className="truncate text-lg font-semibold tracking-tight text-foreground md:text-xl"
          >
            {title}
          </h1>
          {description && (
            <p className="hidden text-[13px] text-muted-foreground sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-lg border border-border/50 text-muted-foreground transition-all hover:border-foreground/20 hover:bg-foreground/5 hover:text-foreground active:scale-95"
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="mt-2 w-80 overflow-hidden rounded-xl border border-border/40 bg-background/95 p-0 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-3">
              <span className="text-sm font-semibold tracking-tight">
                Notificaciones {unreadCount > 0 && `(${unreadCount})`}
              </span>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground transition-colors hover:text-primary"
                    onClick={() => markAllAsRead()}
                    title="Marcar todas como leídas"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground transition-colors hover:text-red-500"
                  onClick={() => clearNotifications()}
                  title="Limpiar todo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={cn(
                        "group relative flex cursor-pointer flex-col gap-1 border-b border-border/10 px-4 py-3 transition-colors hover:bg-muted/40",
                        !n.read && "bg-primary/2",
                      )}
                    >
                      {!n.read && (
                        <div className="absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "text-[13px] font-medium leading-tight",
                            !n.read
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {n.title}
                        </span>
                        <span className="whitespace-nowrap text-[10px] text-muted-foreground/60">
                          {formatRelativeTime(n.timestamp.toISOString())}
                        </span>
                      </div>
                      <p className="text-[12px] leading-snug text-muted-foreground/70">
                        {n.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                    <Bell className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="px-6 text-[13px] text-muted-foreground/60">
                    No tienes notificaciones por ahora.
                  </p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-border/40 bg-muted/20 px-4 py-2 text-center">
                <Link
                  href="/dashboard/jobs"
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Ver todas las ejecuciones
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Primary CTA */}
        <Link
          href="/dashboard/scrape"
          className="btn-primary-glow hidden scale-100 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground transition-all active:scale-95 sm:inline-flex"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nuevo</span>
        </Link>
        <Link
          href="/dashboard/scrape"
          className="btn-primary-glow inline-flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground sm:hidden"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
