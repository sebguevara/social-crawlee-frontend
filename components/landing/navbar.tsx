"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { APP_CONFIG } from "@/config/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Funciones", href: "#features" },
  { label: "Plataformas", href: "#platforms" },
  { label: "Cómo funciona", href: "#how-it-works" },
  { label: "Escala", href: "#scale" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 flex justify-center transition-all duration-300 ease-in-out px-4",
        isScrolled ? "top-4" : "top-0 md:top-2",
      )}
    >
      <div
        className={cn(
          "w-full max-w-7xl transition-all duration-500 ease-in-out overflow-hidden",
          isScrolled
            ? "rounded-2xl border border-border/40 bg-background/70 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl md:max-w-5xl"
            : "border-b border-border/10 bg-background/50 backdrop-blur-md md:rounded-2xl md:bg-transparent md:border-transparent md:backdrop-blur-0",
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between px-6 transition-all duration-300",
            isScrolled ? "py-3" : "py-5",
          )}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-foreground transition-transform group-hover:scale-110">
              <span className="text-xs font-bold text-background">SC</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              {APP_CONFIG.name}
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:scale-105"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <AuthButtons />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-colors hover:bg-foreground/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menú"
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out md:hidden",
            mobileOpen ? "max-h-96 border-t border-border/20" : "max-h-0",
          )}
        >
          <div className="flex flex-col gap-4 bg-background/50 px-6 py-6 backdrop-blur-3xl">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div
              className="flex flex-col gap-2 pt-4"
              onClick={() => setMobileOpen(false)}
            >
              <AuthButtons isMobile />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AuthButtons({ isMobile }: { isMobile?: boolean }) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex items-center",
          isMobile ? "w-full" : "min-w-[120px] justify-end",
        )}
      >
        <div
          className={cn(
            "animate-pulse rounded-full bg-foreground/5",
            isMobile ? "h-10 w-full" : "h-9 w-28",
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center",
        isMobile ? "w-full" : "min-w-[120px] justify-end",
      )}
    >
      <SignedOut>
        <SignInButton
          mode="redirect"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/"
        >
          <Button
            size={isMobile ? "default" : "sm"}
            variant="default"
            className={cn(
              "rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95",
              isMobile ? "w-full" : "px-5",
            )}
          >
            Iniciar sesión
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        {isMobile ? (
          <Button variant="outline" className="w-full rounded-xl" asChild>
            <Link href="/dashboard">Ir al panel</Link>
          </Button>
        ) : (
          <UserButton afterSignOutUrl="/" />
        )}
      </SignedIn>
    </div>
  );
}
