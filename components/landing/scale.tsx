const METRICS = [
  {
    value: "Perfiles",
    detail: "Bio, followers, following, verified status, profile picture URL, account metadata",
  },
  {
    value: "Publicaciones",
    detail: "Caption, likes, comments count, shares, media URLs, hashtags, mentions, timestamp",
  },
  {
    value: "Comentarios",
    detail: "Author info, comment text, likes, replies count, timestamp, parent thread context",
  },
] as const;

const USE_CASES = [
  {
    title: "Análisis competitivo",
    description:
      "Monitor competitor profiles and content performance across all four platforms. Track follower growth, engagement rates, and content strategy changes.",
  },
  {
    title: "Investigación de influencers",
    description:
      "Evaluate influencer reach and authenticity. Analyze follower counts, post engagement, comment sentiment, and content consistency.",
  },
  {
    title: "Inteligencia de mercado",
    description:
      "Track trending topics, hashtags, and audience sentiment across social networks. Build datasets for market research and trend analysis.",
  },
  {
    title: "Monitoreo de contenido",
    description:
      "Monitor brand mentions, product discussions, and customer feedback in real-time. Set up batch jobs to track specific accounts or keywords.",
  },
] as const;

export function Scale() {
  return (
    <section id="scale" className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0 gradient-sweep" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Data you extract */}
        <div className="mb-24">
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Esquema de datos
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Qué puedes extraer
            </h2>
            <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Cada tipo de scraping devuelve datos ricos y estructurados con
              campos consistentes en las cuatro plataformas.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/50 md:grid-cols-3">
            {METRICS.map((metric) => (
              <div
                key={metric.value}
                className="flex flex-col gap-3 bg-card p-8"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {metric.value}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div>
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Casos de uso
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Diseñado para flujos reales
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {USE_CASES.map((useCase, i) => (
              <div
                key={useCase.title}
                className="group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-8 transition-all glow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
