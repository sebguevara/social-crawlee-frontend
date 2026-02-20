import { SpacetimeGrid } from "./spacetime-grid";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Layered gradient background: white → dark → blue edges */}
      <div className="pointer-events-none absolute inset-0 gradient-hero" />
      <SpacetimeGrid />

      {/* Large diffused blue glow orb */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 glow-orb blur-[100px] opacity-40 dark:opacity-100" />

      {/* Secondary subtle orb bottom-right */}
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] glow-orb opacity-20 dark:opacity-40 blur-[120px]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 text-center">
        {/* Tag */}
        <div className="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-xs font-medium tracking-wide uppercase text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Infraestructura de datos sociales
        </div>

        {/* Heading */}
        <h1 className="text-balance text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl md:text-8xl">
          Extrae datos de
          <br />
          <span className="text-gradient">todas las redes</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Una API unificada para scrapear perfiles, publicaciones y comentarios
          de Instagram, Facebook, X y TikTok. Salida JSON estructurada,
          procesamiento por lotes y seguimiento en tiempo real.
        </p>

        {/* Stats row */}
        <div className="mt-6 flex items-center gap-px rounded-xl border border-border/50 bg-secondary/30 backdrop-blur-sm overflow-hidden">
          {[
            { value: "4", label: "Plataformas" },
            { value: "3", label: "Modos de scraping" },
            { value: "Batch", label: "Procesamiento" },
            { value: "JSON", label: "Salida" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center gap-1 px-6 py-4 md:px-10",
                i > 0 && "border-l border-border/50",
              )}
            >
              <span className="text-xl font-bold text-foreground md:text-2xl">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
