"use client";

import { APP_CONFIG } from "@/config/constants";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 px-6 py-16">
      {/* Subtle gradient bleed at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 glow-orb opacity-20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8"
      >
        {/* Divider gradient */}
        <div className="divider-gradient w-full" />

        <div className="flex w-full flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-foreground">
              <span className="text-[10px] font-bold text-background">SC</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {APP_CONFIG.name}
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Funciones
            </a>
            <a
              href="#platforms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Plataformas
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Flujo
            </a>
          </nav>

          <p className="text-xs text-muted-foreground/60">
            {new Date().getFullYear()} {APP_CONFIG.name}
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
