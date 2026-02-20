"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { useState } from "react";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-foreground">
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
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
              <Button
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/80"
              >
                Iniciar sesión
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-b border-border/40 bg-background/95 backdrop-blur-2xl transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-80" : "max-h-0 border-b-0"
        )}
      >
        <div className="flex flex-col gap-4 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <SignedOut>
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <Button
                  size="sm"
                  className="bg-foreground text-background hover:bg-foreground/80"
                >
                  Iniciar sesión
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Ir al panel</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
