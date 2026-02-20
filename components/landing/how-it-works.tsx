"use client";

import { Send, RefreshCw, Database, Download } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  {
    icon: Send,
    step: "01",
    title: "Define tus objetivos",
    description:
      "Elige una plataforma y tipo de scraping. Indica usuarios para perfiles/publicaciones o URLs directas para comentarios. Define máximo de ítems y rango temporal.",
  },
  {
    icon: RefreshCw,
    step: "02",
    title: "Se despachan los trabajos",
    description:
      "Cada objetivo se convierte en un trabajo independiente y desacoplado. Se encolan, procesan en paralelo y se siguen individualmente. Un fallo no bloquea los demás.",
  },
  {
    icon: Database,
    step: "03",
    title: "Se extraen los datos",
    description:
      "El motor de scraping navega cada plataforma, extrae datos estructurados y los guarda en un dataset. Perfiles, publicaciones y comentarios tienen esquemas tipados.",
  },
  {
    icon: Download,
    step: "04",
    title: "Recupera tu dataset",
    description:
      "Obtén resultados completos en JSON tipado por ID de trabajo o de dataset. Filtra, exporta o intégralo directo a tu pipeline de analítica.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      <div className="pointer-events-none absolute inset-0 gradient-aurora" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 flex flex-col items-center gap-4 text-center"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Flujo
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Del request al dataset
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Un pipeline simple por fuera, robusto por dentro.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Horizontal connector */}
          <motion.div
            variants={{
              hidden: { scaleX: 0, opacity: 0 },
              show: {
                scaleX: 1,
                opacity: 1,
                transition: { duration: 0.6, delay: 0.2 },
              },
            }}
            className="pointer-events-none absolute top-8 left-[12%] right-[12%] hidden origin-left lg:block"
          >
            <div className="divider-gradient" />
          </motion.div>

          {STEPS.map((step) => (
            <motion.div
              key={step.step}
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
              className="group relative flex flex-col gap-5"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-card transition-all glow-card">
                  <step.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <span className="font-mono text-xs text-muted-foreground/50">
                  {step.step}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
