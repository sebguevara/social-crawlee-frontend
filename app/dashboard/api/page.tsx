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
    title: "Scrapear perfiles",
    description:
      "Recibe una plataforma y un array de usuarios, luego encola trabajos PROFILE desacoplados.",
    body: JSON.stringify(
      {
        platform: "INSTAGRAM",
        usernames: ["nike", "adidas"],
        maxItems: 2,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        jobId: 1,
        datasetId: "ds_a1b2c3d4",
        status: "QUEUED",
        platform: "INSTAGRAM",
        jobType: "PROFILE",
        createdAt: "2026-02-19T10:00:00Z",
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/posts",
    title: "Scrapear publicaciones",
    description:
      "Scrapea publicaciones por usuarios (perfil) o enlaces directos (postUrls), con plataforma explícita.",
    body: JSON.stringify(
      {
        platform: "X",
        usernames: ["elonmusk"],
        postUrls: [],
        daysBack: 3,
        maxItems: 50,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        jobId: 2,
        datasetId: "ds_e5f6g7h8",
        status: "QUEUED",
        platform: "X",
        jobType: "POSTS",
        createdAt: "2026-02-19T11:00:00Z",
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/comments",
    title: "Scrapear comentarios",
    description:
      "Recibe plataforma y array de links de publicaciones, luego encola trabajos COMMENTS desacoplados por post.",
    body: JSON.stringify(
      {
        platform: "TIKTOK",
        postUrls: ["https://tiktok.com/@user/video/123"],
        daysBack: 7,
        maxItems: 100,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        jobId: 3,
        datasetId: "ds_i9j0k1l2",
        status: "QUEUED",
        platform: "TIKTOK",
        jobType: "COMMENTS",
        createdAt: "2026-02-19T12:00:00Z",
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/dataset",
    title: "Obtener dataset",
    description:
      "Devuelve todos los ítems scrapeados de un dataset como JSON (por jobId o datasetId).",
    body: JSON.stringify(
      {
        jobId: 1,
        datasetId: "ds_a1b2c3d4",
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        datasetId: "ds_a1b2c3d4",
        jobId: 1,
        items: [{ id: "item_1", data: {} }],
        totalItems: 1,
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/scrape/job-status",
    title: "Estado del trabajo",
    description: "Consulta el estado y progreso actual de un trabajo específico.",
    body: JSON.stringify({ jobId: 1 }, null, 2),
    response: JSON.stringify(
      {
        jobId: 1,
        datasetId: "ds_a1b2c3d4",
        status: "COMPLETED",
        platform: "INSTAGRAM",
        jobType: "PROFILE",
        progress: 100,
        totalItems: 5,
        processedItems: 5,
        createdAt: "2026-02-19T10:00:00Z",
        updatedAt: "2026-02-19T10:02:30Z",
        finishedAt: "2026-02-19T10:02:30Z",
      },
      null,
      2
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
        <code className="font-mono text-sm text-foreground">{endpoint.path}</code>
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
              : "text-muted-foreground hover:text-foreground"
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
              : "text-muted-foreground hover:text-foreground"
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
