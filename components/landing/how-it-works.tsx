"use client";

import { Send, RefreshCw, Database, Download } from "lucide-react";
import { motion, useAnimationFrame, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
      "Obtén resultados completos en JSON tipado por ID de trabajo o de dataset. Filtra, exporta o intégralo directo a tu flujo de analítica.",
  },
] as const;

const ANIMATION_CYCLE_MS = 4400;
const STEP_STARTS = [0, 0.24, 0.48, 0.72] as const;
const CONNECTOR_WINDOWS = [
  [0.12, 0.24],
  [0.36, 0.48],
  [0.6, 0.72],
] as const;
const FADE_WINDOW = [0.86, 1] as const;

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationStartRef = useRef<number | null>(null);
  const isInView = useInView(containerRef, { amount: 0.35 });
  const [cycleProgress, setCycleProgress] = useState(0);

  useEffect(() => {
    if (!isInView) {
      animationStartRef.current = null;
      setCycleProgress(0);
    }
  }, [isInView]);

  useAnimationFrame((time) => {
    if (!isInView) return;

    if (animationStartRef.current === null) {
      animationStartRef.current = time;
    }

    const elapsed = (time - animationStartRef.current) % ANIMATION_CYCLE_MS;
    setCycleProgress(elapsed / ANIMATION_CYCLE_MS);
  });

  const clamp = (value: number, min = 0, max = 1) =>
    Math.max(min, Math.min(max, value));
  const smoothstep = (value: number) => value * value * (3 - 2 * value);
  const ramp = (value: number, from: number, to: number) =>
    smoothstep(clamp((value - from) / (to - from)));
  const fadeOut = 1 - ramp(cycleProgress, FADE_WINDOW[0], FADE_WINDOW[1]);

  const connectorProgress = (index: number) => {
    const [from, to] = CONNECTOR_WINDOWS[index];
    return ramp(cycleProgress, from, to) * fadeOut;
  };

  const stepIntensity = (index: number) => {
    const start = STEP_STARTS[index];
    const turnOn = ramp(cycleProgress, start, start + 0.08);
    return turnOn * fadeOut;
  };

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
            De la solicitud al dataset
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Un flujo simple por fuera, robusto por dentro.
          </p>
        </motion.div>

        <motion.div
          ref={containerRef}
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
          {STEPS.map((step, index) => {
            const intensity = stepIntensity(index);
            const isLit = intensity >= 0.2;

            return (
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
                className="group relative z-10 flex flex-col gap-5"
              >
              {index < STEPS.length - 1 && (
                <div className="pointer-events-none absolute top-8 left-20 -right-4 z-0 hidden h-px lg:block">
                  <div className="absolute inset-0 bg-border/60" />
                  <div
                    className="absolute inset-0 origin-left bg-primary"
                    style={{
                      transform: `scaleX(${connectorProgress(index)})`,
                      opacity: 0.12 + connectorProgress(index) * 0.78,
                      transition: "transform 120ms linear, opacity 180ms ease",
                    }}
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <div
                  className="relative z-20 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-card transition-all duration-300 ease-out glow-card"
                  style={{
                    backgroundColor: `hsl(var(--primary) / ${0.02 + intensity * 0.14})`,
                    boxShadow: `0 0 ${12 + intensity * 18}px hsl(var(--primary) / ${0.08 + intensity * 0.28})`,
                    transform: `scale(${1 + intensity * 0.03})`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-1 rounded-xl blur-md"
                    style={{
                      backgroundColor: `hsl(var(--primary) / ${intensity * 0.32})`,
                    }}
                  />
                  <step.icon
                    className={`relative z-10 h-6 w-6 transition-all duration-300 ease-out ${
                      isLit ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    }`}
                    style={{
                      filter:
                        intensity > 0.04
                          ? `drop-shadow(0 0 ${4 + intensity * 7}px hsl(var(--primary) / ${0.3 + intensity * 0.35}))`
                          : undefined,
                    }}
                  />
                </div>
                <span
                  className="relative z-20 rounded-md bg-card px-1.5 py-0.5 font-mono text-xs text-muted-foreground/50 transition-colors duration-300 ease-out"
                  style={{
                    color:
                      intensity > 0.04
                        ? `hsl(var(--primary) / ${0.45 + intensity * 0.35})`
                        : undefined,
                  }}
                >
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
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
