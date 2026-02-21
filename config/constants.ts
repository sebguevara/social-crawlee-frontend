/* ──────────────────────────────────────────────────────────────
   Social Crawlee – Application Constants & Configuration
   Single source of truth for all configurable values.
   ────────────────────────────────────────────────────────────── */

import { Platform, JobType, type NavItem } from "@/types";

// ─── App Metadata ────────────────────────────────────────────

export const APP_CONFIG = {
  name: "Social Crawlee",
  description:
    "Extrae datos estructurados de Instagram, Facebook, X y TikTok a escala.",
  tagline: "Scraping de redes sociales, simplificado.",
  version: "1.0.0",
  author: "Social Crawlee",
} as const;

// ─── API Configuration ──────────────────────────────────────

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  endpoints: {
    scrapeProfiles: "/api/scrape/profiles",
    scrapePosts: "/api/scrape/posts",
    scrapeComments: "/api/scrape/comments",
    dataset: "/api/scrape/dataset",
    jobStatus: "/api/scrape/job-status",
    dashboardSummary: "/api/dashboard/summary",
    dashboardJobsList: "/api/dashboard/jobs/list",
    dashboardJobDetail: "/api/dashboard/jobs/detail",
    dashboardJobStream: "/api/dashboard/jobs/stream",
    dashboardDatasetsList: "/api/dashboard/datasets/list",
    stopJob: "/api/scrape/stop",
    deleteJob: "/api/scrape/delete",
    purgeUserData: "/api/users/purge-data",
  },
  polling: {
    intervalMs: 3000,
    maxRetries: 100,
  },
} as const;

// ─── Platform Configuration ─────────────────────────────────

export interface PlatformConfig {
  key: Platform;
  label: string;
  description: string;
  color: string;
  icon: string;
  maxItemsDefault: number;
  daysBackDefault: number;
  supportedJobTypes: readonly JobType[];
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  [Platform.INSTAGRAM]: {
    key: Platform.INSTAGRAM,
    label: "Instagram",
    description: "Scrapea perfiles, publicaciones y comentarios de Instagram.",
    color: "hsl(330, 70%, 55%)",
    icon: "instagram",
    maxItemsDefault: 50,
    daysBackDefault: 7,
    supportedJobTypes: [JobType.PROFILE, JobType.POSTS, JobType.COMMENTS],
  },
  [Platform.FACEBOOK]: {
    key: Platform.FACEBOOK,
    label: "Facebook",
    description: "Extrae datos de páginas y grupos de Facebook.",
    color: "hsl(220, 70%, 55%)",
    icon: "facebook",
    maxItemsDefault: 50,
    daysBackDefault: 7,
    supportedJobTypes: [JobType.PROFILE, JobType.POSTS, JobType.COMMENTS],
  },
  [Platform.X]: {
    key: Platform.X,
    label: "X",
    description: "Obtén publicaciones, respuestas y datos de perfil desde X.",
    color: "hsl(0, 0%, 20%)",
    icon: "twitter",
    maxItemsDefault: 100,
    daysBackDefault: 3,
    supportedJobTypes: [JobType.PROFILE, JobType.POSTS, JobType.COMMENTS],
  },
  [Platform.TIKTOK]: {
    key: Platform.TIKTOK,
    label: "TikTok",
    description: "Scrapea videos, perfiles y métricas de TikTok.",
    color: "hsl(340, 80%, 55%)",
    icon: "music",
    maxItemsDefault: 30,
    daysBackDefault: 7,
    supportedJobTypes: [JobType.PROFILE, JobType.POSTS, JobType.COMMENTS],
  },
} as const;

// ─── Job Type Configuration ─────────────────────────────────

export interface JobTypeConfig {
  key: JobType;
  label: string;
  description: string;
  requiresUsernames: boolean;
  requiresPostUrls: boolean;
  requiresDaysBack: boolean;
}

export const JOB_TYPES: Record<JobType, JobTypeConfig> = {
  [JobType.PROFILE]: {
    key: JobType.PROFILE,
    label: "Perfiles",
    description:
      "Scrapea datos de un perfil incluyendo bio, seguidores, seguidos y más.",
    requiresUsernames: true,
    requiresPostUrls: false,
    requiresDaysBack: false,
  },
  [JobType.POSTS]: {
    key: JobType.POSTS,
    label: "Publicaciones",
    description: "Scrapea publicaciones por usuario o enlaces directos.",
    requiresUsernames: true,
    requiresPostUrls: true,
    requiresDaysBack: true,
  },
  [JobType.COMMENTS]: {
    key: JobType.COMMENTS,
    label: "Comentarios",
    description: "Extrae comentarios desde URLs específicas de publicaciones.",
    requiresUsernames: false,
    requiresPostUrls: true,
    requiresDaysBack: true,
  },
} as const;

// ─── Dashboard Navigation ───────────────────────────────────

export const DASHBOARD_NAV: readonly NavItem[] = [
  { label: "Resumen", href: "/dashboard", icon: "layout-dashboard" },
  { label: "Nuevo scraping", href: "/dashboard/scrape", icon: "plus-circle" },
  { label: "Ejecuciones", href: "/dashboard/jobs", icon: "list" },
  {
    label: "Conjuntos de datos",
    href: "/dashboard/datasets",
    icon: "database",
  },
  { label: "Referencia API", href: "/dashboard/api", icon: "code" },
  { label: "Configuración", href: "/dashboard/settings", icon: "settings" },
] as const;

// ─── Defaults ────────────────────────────────────────────────

export const DEFAULTS = {
  platform: Platform.INSTAGRAM,
  jobType: JobType.PROFILE,
  maxItems: 50,
  daysBack: 7,
  pollingInterval: 3000,
} as const;

// ─── Landing Page Content ────────────────────────────────────

export const LANDING_FEATURES = [
  {
    title: "Multiplataforma",
    description:
      "Una API, cuatro plataformas. Scrapea Instagram, Facebook, X y TikTok con una interfaz unificada.",
    icon: "globe",
  },
  {
    title: "Procesamiento por lotes",
    description:
      "Encola cientos de jobs a la vez. Cada uno corre de forma independiente con seguimiento.",
    icon: "layers",
  },
  {
    title: "Salida estructurada",
    description:
      "Cada scraping devuelve datasets JSON limpios y tipados listos para análisis e integración.",
    icon: "braces",
  },
  {
    title: "Estado en tiempo real",
    description:
      "Monitorea cada job en tiempo real. Ve progreso, errores y estado de finalización al instante.",
    icon: "activity",
  },
] as const;

export const LANDING_CAPABILITIES = [
  {
    title: "Perfiles",
    description:
      "Extrae cantidad de seguidores, biografías, estado de verificación y metadatos de perfil a escala.",
    endpoint: "/api/scrape/profiles",
  },
  {
    title: "Publicaciones",
    description:
      "Obtén publicaciones por usuario o URL directa con métricas completas.",
    endpoint: "/api/scrape/posts",
  },
  {
    title: "Comentarios",
    description:
      "Scrapea comentarios desde cualquier URL de publicación con datos del autor y engagement.",
    endpoint: "/api/scrape/comments",
  },
] as const;
