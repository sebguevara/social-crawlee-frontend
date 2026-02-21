"use client";

import { motion } from "framer-motion";

const METRICS = [
  {
    value: "Perfiles",
    detail:
      "Bio, seguidores, seguidos, estado de verificación, URL de foto de perfil y metadatos de la cuenta.",
  },
  {
    value: "Publicaciones",
    detail:
      "Texto, likes, cantidad de comentarios, compartidos, URLs multimedia, hashtags, menciones y fecha.",
  },
  {
    value: "Comentarios",
    detail:
      "Información del autor, texto del comentario, likes, cantidad de respuestas, fecha y contexto del hilo principal.",
  },
] as const;

const USE_CASES = [
  {
    title: "Análisis competitivo",
    description:
      "Monitorea perfiles de competidores y rendimiento de contenido en las cuatro plataformas. Sigue crecimiento de seguidores, engagement y cambios de estrategia.",
  },
  {
    title: "Investigación de influencers",
    description:
      "Evalúa alcance y autenticidad de influencers. Analiza cantidad de seguidores, interacción por publicación, sentimiento en comentarios y consistencia de contenido.",
  },
  {
    title: "Inteligencia de mercado",
    description:
      "Sigue temas en tendencia, hashtags y sentimiento de audiencia en redes sociales. Construye datasets para investigación y análisis de mercado.",
  },
  {
    title: "Monitoreo de contenido",
    description:
      "Monitorea menciones de marca, conversaciones de producto y feedback de clientes en tiempo real. Configura lotes para seguir cuentas o palabras clave.",
  },
] as const;

export function Scale() {
  return (
    <section id="scale" className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0 gradient-sweep" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Data you extract */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex flex-col items-center gap-4 text-center"
          >
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
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.05 },
              },
            }}
            className="grid gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/50 md:grid-cols-3"
          >
            {METRICS.map((metric) => (
              <motion.div
                key={metric.value}
                variants={{
                  hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
                  show: {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: {
                      type: "spring",
                      stiffness: 140,
                      damping: 18,
                    },
                  },
                }}
                className="flex flex-col gap-3 bg-card p-8"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {metric.value}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {metric.detail}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Use cases */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex flex-col items-center gap-4 text-center"
          >
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Casos de uso
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Diseñado para flujos reales
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.12, delayChildren: 0.05 },
              },
            }}
            className="grid gap-6 md:grid-cols-2"
          >
            {USE_CASES.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                variants={{
                  hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
                  show: {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: {
                      type: "spring",
                      stiffness: 140,
                      damping: 18,
                    },
                  },
                }}
                className="group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-8 glow-card"
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
