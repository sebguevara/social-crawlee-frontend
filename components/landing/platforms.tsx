import {
  SiInstagram,
  SiFacebook,
  SiX,
  SiTiktok,
} from "@icons-pack/react-simple-icons";
import { PLATFORMS } from "@/config/constants";
import { Platform } from "@/types";

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

export function Platforms() {
  const entries = Object.values(PLATFORMS);

  return (
    <section id="platforms" className="relative px-6 py-32">
      {/* Gradient sweep */}
      <div className="pointer-events-none absolute inset-0 gradient-sweep" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-20 flex flex-col items-center gap-4 text-center">
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {entries.map((platform) => {
            const Icon = PLATFORM_ICONS[platform.key];
            const data = PLATFORM_DATA[platform.key];

            return (
              <div
                key={platform.key}
                className="group relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all glow-card"
              >
                {/* Hover glow orb */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full glow-orb opacity-0 transition-opacity duration-500 group-hover:opacity-60 blur-[60px]" />

                <div className="flex items-center gap-4">
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

                <ul className="flex flex-col gap-2.5">
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

                <div className="flex flex-wrap gap-2 pt-2">
                  {platform.supportedJobTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full border border-border/50 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {type.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
