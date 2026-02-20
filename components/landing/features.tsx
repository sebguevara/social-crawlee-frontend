import {
  Layers,
  Braces,
  Activity,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Procesamiento por lotes",
    description:
      "Envía cientos de usuarios o URLs en un solo request. Cada objetivo se convierte en un trabajo independiente encolado y procesado en paralelo.",
  },
  {
    icon: Braces,
    title: "JSON estructurado",
    description:
      "Cada scraping devuelve JSON limpio y tipado con esquemas consistentes entre plataformas. Perfiles, publicaciones y comentarios siguen las mismas convenciones.",
  },
  {
    icon: Activity,
    title: "Seguimiento en tiempo real",
    description:
      "Monitorea cada trabajo en tiempo real. Sigue porcentaje de progreso, ítems procesados, errores y estado final desde el panel o la API.",
  },
  {
    icon: Shield,
    title: "Trabajos desacoplados",
    description:
      "Cada objetivo se ejecuta como un trabajo aislado. Si uno falla, el resto continúa. Reintenta fallas puntuales sin reprocesar todo el lote.",
  },
  {
    icon: Zap,
    title: "API unificada",
    description:
      "Tres endpoints cubren todos los casos: perfiles, publicaciones y comentarios. Mismo patrón de request para Instagram, Facebook, X y TikTok.",
  },
  {
    icon: BarChart3,
    title: "Gestión de datasets",
    description:
      "Accede a los datos recolectados mediante datasets estructurados. Consulta por ID de trabajo o dataset. Exporta, filtra y analiza tus datos.",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0 gradient-aurora" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-20 flex flex-col items-center gap-4 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Capacidades
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Diseñado para extracción de datos en serio
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Cada función está pensada para scraping a escala de producción con
            confiabilidad, velocidad y salida de datos limpia.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/50 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col gap-4 bg-card p-8 transition-colors hover:bg-secondary/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
