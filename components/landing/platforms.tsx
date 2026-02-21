"use client";

import {
  SiInstagram,
  SiFacebook,
  SiX,
  SiTiktok,
} from "@icons-pack/react-simple-icons";
import { PLATFORMS } from "@/config/constants";
import { Platform } from "@/types";
import { motion } from "framer-motion";

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  [Platform.INSTAGRAM]: SiInstagram,
  [Platform.FACEBOOK]: SiFacebook,
  [Platform.X]: SiX,
  [Platform.TIKTOK]: SiTiktok,
};

const PLATFORM_DATA: Record<
  Platform,
  { dataPoints: string[]; volume: string }
> = {
  [Platform.INSTAGRAM]: {
    dataPoints: [
      "Cantidad de seguidores y seguidos",
      "Bio, estado verificado, foto de perfil",
      "Texto de publicaciones, likes y comentarios",
      "Vistas en reels, hashtags y menciones",
    ],
    volume: "Hasta 1.000 ítems por lote",
  },
  [Platform.FACEBOOK]: {
    dataPoints: [
      "Likes de página y métricas de seguidores",
      "Reacciones, compartidos y comentarios",
      "Publicaciones y discusiones en grupos",
      "Metadatos de página e información general",
    ],
    volume: "Hasta 1.000 ítems por lote",
  },
  [Platform.X]: {
    dataPoints: [
      "Texto de posts, likes, reposts y respuestas",
      "Bio de usuario, seguidores y verificación",
      "Extracción de hilos y cadenas de respuesta",
      "Adjuntos multimedia y URLs",
    ],
    volume: "Hasta 1.000 ítems por lote",
  },
  [Platform.TIKTOK]: {
    dataPoints: [
      "Vistas de video, likes, compartidos y comentarios",
      "Perfil del creador y cantidad de seguidores",
      "Metadatos de sonido y hashtags",
      "Autor del comentario y engagement",
    ],
    volume: "Hasta 1.000 ítems por lote",
  },
};

const PLATFORM_HOVER_GLOW: Record<
  Platform,
  { overlay: string; orb: string }
> = {
  [Platform.INSTAGRAM]: {
    overlay:
      "radial-gradient(circle at 20% 25%, rgba(225, 48, 108, 0.3), transparent 72%)",
    orb: "#E1306C",
  },
  [Platform.FACEBOOK]: {
    overlay:
      "radial-gradient(circle at 20% 25%, rgba(24, 119, 242, 0.28), transparent 72%)",
    orb: "#1877F2",
  },
  [Platform.X]: {
    overlay:
      "radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.24), transparent 72%)",
    orb: "#9CA3AF",
  },
  [Platform.TIKTOK]: {
    overlay:
      "radial-gradient(circle at 18% 22%, rgba(37, 244, 238, 0.24), rgba(254, 44, 85, 0.24) 42%, transparent 74%)",
    orb: "#FE2C55",
  },
};

export function Platforms() {
  const entries = Object.values(PLATFORMS);

  return (
    <section id="platforms" className="relative px-6 py-32">
      {/* Gradient sweep */}
      <div className="pointer-events-none absolute inset-0 gradient-sweep" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 flex flex-col items-center gap-4 text-center"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Plataformas compatibles
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Cuatro plataformas, una interfaz
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Todas las plataformas devuelven esquemas estructurados iguales.
            Cambia de red modificando un solo parámetro.
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
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid gap-6 md:grid-cols-2"
        >
          {entries.map((platform) => {
            const Icon = PLATFORM_ICONS[platform.key];
            const data = PLATFORM_DATA[platform.key];
            const hoverGlow = PLATFORM_HOVER_GLOW[platform.key];

            return (
              <motion.div
                key={platform.key}
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
                className="group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-border/50 bg-card p-8 glow-card"
              >
                <div
                  className="pointer-events-none absolute inset-0 z-0 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
                  style={{ background: hoverGlow.overlay }}
                />

                {/* Hover glow orb */}
                <div
                  className="pointer-events-none absolute -top-20 -right-20 z-0 h-40 w-40 rounded-full opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-60"
                  style={{ backgroundColor: hoverGlow.orb }}
                />

                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 text-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {platform.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {data.volume}
                    </p>
                  </div>
                </div>

                <ul className="relative z-10 flex flex-col gap-2.5">
                  {data.dataPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="relative z-10 flex flex-wrap gap-2 pt-2">
                  {platform.supportedJobTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full border border-border/50 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {type.toLowerCase()}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
