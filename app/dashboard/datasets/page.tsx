"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Download, ExternalLink, Search, Copy } from "lucide-react";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { DashboardHeader } from "@/components/dashboard/header";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { apiClient } from "@/lib/api";
import { formatRelativeTime, getJobTypeLabel } from "@/lib/formatters";
import { type DatasetItem, type Job } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";

type CsvValue = string | number | boolean | null;
type CsvRow = Record<string, CsvValue>;

function normalizeValue(value: unknown): CsvValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  return JSON.stringify(value);
}

function flattenRow(
  source: Record<string, unknown>,
  prefix = "",
  output: CsvRow = {},
): CsvRow {
  for (const [key, value] of Object.entries(source)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      output[nextKey] = value.every((item) => item && typeof item === "object")
        ? JSON.stringify(value)
        : value.map((item) => normalizeValue(item)).join(" | ");
      continue;
    }

    if (value && typeof value === "object") {
      flattenRow(value as Record<string, unknown>, nextKey, output);
      continue;
    }

    output[nextKey] = normalizeValue(value);
  }

  return output;
}

function mapDatasetItemToCsvRow(item: DatasetItem): CsvRow {
  const row: Record<string, unknown> = {
    id: item.id,
    jobId: item.jobId,
    scrapedAt: item.scrapedAt,
    ...item.data,
  };
  return flattenRow(row);
}

export default function DatasetsPage() {
  const [search, setSearch] = useState("");
  const [datasets, setDatasets] = useState<Job[]>([]);
  const [totalDatasets, setTotalDatasets] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const result = await apiClient.listDashboardDatasets({
        search,
        page: 1,
        limit: 200,
      });

      if (!result.success || !result.data || cancelled) return;
      setDatasets(result.data.data);
      setTotalDatasets(result.data.pagination.total);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    sileo.success({
      title: "Copiado",
      description: "El ID del dataset está en tu portapapeles.",
    });
  };

  const handleExport = async (jobId: number, datasetId: string) => {
    const result = await apiClient.getDataset({ jobId, datasetId });
    if (!result.success || !result.data) {
      sileo.error({
        title: "Error al exportar",
        description: result.error ?? "No se pudo obtener el dataset.",
      });
      return;
    }

    const rows = result.data.items.map(mapDatasetItemToCsvRow);
    if (rows.length === 0) {
      sileo.warning({
        title: "Dataset vacío",
        description: "Este dataset no contiene registros para exportar.",
      });
      return;
    }

    const config = mkConfig({
      filename: `${datasetId}`,
      useKeysAsHeaders: true,
    });

    const csv = generateCsv(config)(rows);
    download(config)(csv);
    sileo.success({
      title: "Exportación exitosa",
      description: `Se ha descargado el archivo CSV para el dataset ${datasetId}.`,
    });
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Conjuntos de datos"
        description={`${totalDatasets} datasets disponibles para descargar.`}
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID de dataset, plataforma o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card pl-9"
          />
        </div>

        {/* Dataset cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {datasets.map((job) => (
            <div
              key={job.datasetId}
              className="group flex flex-col gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm font-medium text-foreground">
                    {job.datasetId}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(job.datasetId)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Copiar ID del dataset"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <PlatformBadge platform={job.platform} />
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {getJobTypeLabel(job.jobType)}
                </span>
                <StatusBadge status={job.status} />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">
                    {job.processedItems}
                  </strong>{" "}
                  ítems
                </span>
                <span>
                  {formatRelativeTime(job.finishedAt ?? job.updatedAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 sm:w-auto"
                  asChild
                >
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver ejecución
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 sm:w-auto"
                  onClick={() => void handleExport(job.id, job.datasetId)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          ))}

          {datasets.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 py-12 text-center">
              <Database className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No se encontraron datasets que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
