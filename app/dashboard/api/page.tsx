"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { cn } from "@/lib/utils";

interface Endpoint {
  method: string;
  path: string;
  title: string;
  description: string;
  body: string;
  response: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "POST",
    path: "/api/scrape/profiles",
    title: "Scrapear perfiles (Batch)",
    description:
      "Recibe una plataforma y un array de usuarios. Crea un trabajo PROFILE individual para cada usuario en la cola.",
    body: JSON.stringify(
      {
        platform: "INSTAGRAM",
        usernames: ["nike", "adidas"],
      },
      null,
      2,
    ),
    response: JSON.stringify(
      {
        message: "Jobs PROFILE procesados",
        total: 2,
        queued: 2,
        failed: 0,
        data: [
          { status: "QUEUED", target: "nike", jobId: "ds_a1b2c3d4" },
          { status: "QUEUED", target: "adidas", jobId: "ds_e5f6g7h8" },
        ],
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/posts",
    title: "Scrapear publicaciones",
    description:
      "Scrapea publicaciones recientes de perfiles o URLs específicas. Utiliza daysBack para filtrar por antigüedad.",
    body: JSON.stringify(
      {
        platform: "X",
        usernames: ["elonmusk"],
        postUrls: [],
        daysBack: 7,
        maxItems: 20,
      },
      null,
      2,
    ),
    response: JSON.stringify(
      {
        message: "Job POSTS encolado",
        totalProfiles: 1,
        totalPostUrls: 0,
        queued: 1,
        failed: 0,
        data: [{ status: "QUEUED", target: "batch", jobId: "ds_i9j0k1l2" }],
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/comments",
    title: "Scrapear comentarios",
    description:
      "Extrae comentarios de una o varias publicaciones. Recibe un array de URLs directas de los posts.",
    body: JSON.stringify(
      {
        platform: "TIKTOK",
        postUrls: ["https://tiktok.com/@user/video/123456789"],
        maxItems: 100,
      },
      null,
      2,
    ),
    response: JSON.stringify(
      {
        message: "Jobs COMMENTS procesados",
        total: 1,
        queued: 1,
        failed: 0,
        data: [
          {
            status: "QUEUED",
            target: "https://tiktok.com/...",
            jobId: "ds_m3n4o5p6",
          },
        ],
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/dataset",
    title: "Obtener resultados (Dataset)",
    description:
      "Recupera los ítems scrapeados. Puedes consultar por jobId o por el datasetId generado.",
    body: JSON.stringify(
      {
        jobId: "ds_a1b2c3d4",
      },
      null,
      2,
    ),
    response: JSON.stringify(
      {
        datasetId: "ds_a1b2c3d4",
        jobId: "ds_a1b2c3d4",
        totalItems: 42,
        items: [
          {
            id: "item_1",
            jobId: "ds_a1b2c3d4",
            scrapedAt: "2026-02-20T18:00:00Z",
            data: {
              username: "nike",
              followers: 250000000,
              biography: "Just Do It.",
            },
          },
        ],
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/job-progress",
    title: "Consultar progreso",
    description:
      "Obtiene un snapshot rápido del estado, progreso porcentual y métricas del trabajo.",
    body: JSON.stringify({ jobId: "ds_a1b2c3d4" }, null, 2),
    response: JSON.stringify(
      {
        jobId: "ds_a1b2c3d4",
        platform: "INSTAGRAM",
        type: "PROFILE",
        status: "RUNNING",
        progress: 45,
        createdAt: "2026-02-20T19:00:00Z",
        updatedAt: "2026-02-20T19:01:30Z",
      },
      null,
      2,
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/stop",
    title: "Cancelar ejecución",
    description:
      "Detiene inmediatamente un trabajo en ejecución y limpia la cola de procesos.",
    body: JSON.stringify({ jobId: "ds_a1b2c3d4" }, null, 2),
    response: JSON.stringify(
      {
        success: true,
        message: "Trabajo detenido correctamente",
      },
      null,
      2,
    ),
  },
];

export default function ApiReferencePage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Referencia API"
        description="Documentación completa de endpoints para la API de Social Crawlee."
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6">
        {/* Base URL */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            URL base
          </p>
          <code className="font-mono text-sm text-foreground">
            http://localhost:3000
          </code>
        </div>

        {/* Endpoints */}
        {ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.path} endpoint={ep} />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [activeTab, setActiveTab] = useState<"request" | "response">("request");

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
          {endpoint.method}
        </span>
        <code className="font-mono text-sm text-foreground">
          {endpoint.path}
        </code>
      </div>

      {/* Description */}
      <div className="border-b border-border/50 px-5 py-3">
        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab("request")}
          className={cn(
            "flex-1 px-5 py-2.5 text-xs font-medium transition-colors",
            activeTab === "request"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Cuerpo del request
        </button>
        <button
          onClick={() => setActiveTab("response")}
          className={cn(
            "flex-1 px-5 py-2.5 text-xs font-medium transition-colors",
            activeTab === "response"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Respuesta
        </button>
      </div>

      {/* Code block */}
      <div className="relative bg-[#0a0a0b] p-5">
        <CopyButton
          text={activeTab === "request" ? endpoint.body : endpoint.response}
        />
        <pre className="overflow-x-auto pr-10 font-mono text-xs leading-relaxed text-[#a8b4c0]">
          {activeTab === "request" ? endpoint.body : endpoint.response}
        </pre>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute right-3 top-3 rounded-md p-1.5 text-[#6b7280] transition-colors hover:bg-[#1f1f23] hover:text-[#a8b4c0]"
      aria-label="Copiar código"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
