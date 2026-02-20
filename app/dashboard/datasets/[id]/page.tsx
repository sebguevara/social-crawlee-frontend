"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Download,
  Search,
  Code,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
} from "lucide-react";
import { download, generateCsv, mkConfig } from "export-to-csv";
import { DashboardHeader } from "@/components/dashboard/header";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { apiClient } from "@/lib/api";
import { formatDateTime, getJobTypeLabel } from "@/lib/formatters";
import { type DatasetItem, type Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sileo } from "sileo";

interface DatasetDetailPageProps {
  params: Promise<{ id: string }>;
}

const itemsPerPage = 50;

const isImageUrl = (value: string) =>
  /(\.png|\.jpe?g|\.webp|\.gif|\.avif|\.svg)(\?.*)?$/i.test(value) ||
  value.includes("/uploads/");

const looksLikeUrl = (value: string) =>
  /^https?:\/\//i.test(value) || value.startsWith("/uploads/");

function JsonSyntax({ value }: { value: unknown }) {
  const renderNode = (node: unknown) => {
    if (node === null) return <span className="text-[#a78bfa]">null</span>;
    if (typeof node === "string") {
      return <span className="text-[#34d399]">"{node}"</span>;
    }
    if (typeof node === "number" || typeof node === "boolean") {
      return <span className="text-[#f59e0b]">{String(node)}</span>;
    }

    if (Array.isArray(node)) {
      return (
        <span>
          [
          {node.map((entry, index) => (
            <span key={index}>
              {index > 0 ? ", " : ""}
              {renderNode(entry)}
            </span>
          ))}
          ]
        </span>
      );
    }

    if (typeof node === "object") {
      const entries = Object.entries(node as Record<string, unknown>);
      return (
        <div className="pl-4">
          {"{"}
          {entries.map(([key, entry], index) => (
            <div key={key}>
              <span className="text-[#60a5fa]">"{key}"</span>
              <span className="text-[#94a3b8]">: </span>
              {renderNode(entry)}
              {index < entries.length - 1 ? "," : ""}
            </div>
          ))}
          {"}"}
        </div>
      );
    }

    return <span>{String(node)}</span>;
  };

  return (
    <div className="font-mono text-[11px] leading-relaxed text-[#cbd5e1]">
      {renderNode(value)}
    </div>
  );
}

function renderValue(value: unknown) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (typeof value === "string") {
    if (looksLikeUrl(value) && isImageUrl(value)) {
      return (
        <img
          src={value}
          alt="Media"
          className="h-14 w-14 rounded-md border border-border/40 object-cover"
        />
      );
    }

    if (looksLikeUrl(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Abrir <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    return <span className="whitespace-pre-wrap break-words">{value}</span>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <span>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string" && isImageUrl(item))) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <img
              key={`${item}-${index}`}
              src={item}
              alt={`Media ${index + 1}`}
              className="h-14 w-14 rounded-md border border-border/40 object-cover"
            />
          ))}
        </div>
      );
    }

    return (
      <pre className="text-xs whitespace-pre-wrap break-all font-mono">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <pre className="text-xs whitespace-pre-wrap break-all font-mono">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function DatasetDetailPage({ params }: DatasetDetailPageProps) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "json">("table");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      const datasetResult = await apiClient.getDataset({ datasetId: id });
      if (cancelled) return;

      if (!datasetResult.success || !datasetResult.data) {
        sileo.error({
          title: "Error",
          description: datasetResult.error ?? "No se pudo cargar el dataset.",
        });
        setLoading(false);
        return;
      }

      setItems(datasetResult.data.items);

      if (datasetResult.data.jobId) {
        const jobResult = await apiClient.getDashboardJobDetail(
          datasetResult.data.jobId,
        );
        if (!cancelled && jobResult.success && jobResult.data) {
          setJob(jobResult.data);
        }
      }

      setLoading(false);
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const filteredItems = items.filter((item) => {
    const searchData = item.data || {};
    const searchString = JSON.stringify(searchData).toLowerCase();
    return searchString.includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const dataKeys = Array.from(
    new Set(filteredItems.flatMap((item) => Object.keys(item.data ?? {}))),
  );
  const tableColumns = ["id", ...dataKeys, "scrapedAt"];

  const handleExportCsv = () => {
    if (items.length === 0) return;

    const flatten = (obj: Record<string, unknown>, prefix = "") => {
      const result: Record<string, unknown> = {};
      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          Object.assign(result, flatten(value as Record<string, unknown>, newKey));
        } else {
          result[newKey] = Array.isArray(value) ? JSON.stringify(value) : value;
        }
      }
      return result;
    };

    const rows = items.map((item, index) => ({
      id: item.id || `item-${index}`,
      jobId: job?.id || id.replace("ds_", ""),
      scrapedAt: item.scrapedAt || new Date().toISOString(),
      ...flatten(item.data),
    }));

    const config = mkConfig({
      filename: `dataset-${id}`.replace(/[^a-z0-9]/gi, "_"),
      useKeysAsHeaders: true,
    });

    const csv = generateCsv(config)(rows);
    download(config)(csv);

    sileo.success({
      title: "Exportado",
      description: `Se han exportado ${items.length} registros a CSV.`,
    });
  };

  const handleCopyJson = async () => {
    const payload = filteredItems.map((item) => ({
      id: item.id,
      scrapedAt: item.scrapedAt,
      ...item.data,
    }));
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    sileo.success({
      title: "Json copiado",
      description: "El contenido JSON se copió al portapapeles.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        title={`Dataset ${id}`}
        description={
          job
            ? `${items.length} registros extraídos de ${job.platform} (${getJobTypeLabel(job.jobType)})`
            : "Explora los datos extraídos de este conjunto."
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard/datasets"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a datasets
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={items.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {job && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="border-border/50 bg-card/50 p-3 backdrop-blur-sm">
              <p className="mb-0.5 text-xs text-muted-foreground">Plataforma</p>
              <div className="flex items-center gap-2">
                <PlatformBadge platform={job.platform} />
              </div>
            </Card>
            <Card className="border-border/50 bg-card/50 p-3 backdrop-blur-sm">
              <p className="mb-0.5 text-xs text-muted-foreground">Tipo de scrape</p>
              <Badge variant="secondary">{getJobTypeLabel(job.jobType)}</Badge>
            </Card>
            <Card className="border-border/50 bg-card/50 p-3 backdrop-blur-sm">
              <p className="mb-0.5 text-xs text-muted-foreground">Total items</p>
              <p className="text-xl font-semibold">{items.length}</p>
            </Card>
            <Card className="border-border/50 bg-card/50 p-3 backdrop-blur-sm">
              <p className="mb-0.5 text-xs text-muted-foreground">Ejecución</p>
              <Link
                href={`/dashboard/jobs/${job.id}`}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver ejecución <ExternalLink className="h-3 w-3" />
              </Link>
            </Card>
          </div>
        )}

        <Card className="flex flex-col overflow-hidden border-border/50 bg-card/30 shadow-lg backdrop-blur-md">
          <div className="flex flex-col gap-4 border-b border-border/50 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar datos..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-background/50 pl-9"
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Tabs
                value={view}
                onValueChange={(v) => setView(v as "table" | "json")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
                  <TabsTrigger value="table" className="gap-2">
                    <TableIcon className="h-4 w-4" />
                    Tabla
                  </TabsTrigger>
                  <TabsTrigger value="json" className="gap-2">
                    <Code className="h-4 w-4" />
                    Json
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {view === "json" && (
                <Button variant="outline" size="sm" onClick={handleCopyJson}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar json
                </Button>
              )}
            </div>
          </div>

          <div className="relative max-h-[600px] flex-1 overflow-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 p-12">
                <Database className="h-10 w-10 animate-pulse text-primary" />
                <p className="text-sm text-muted-foreground">Cargando registros...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 p-12">
                <Search className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No se encontraron registros.</p>
              </div>
            ) : view === "table" ? (
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
                  <TableRow>
                    {tableColumns.map((col) => (
                      <TableHead key={col} className="capitalize">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item) => (
                    <TableRow key={item.id} className="transition-colors hover:bg-muted/30">
                      {tableColumns.map((col) => {
                        const value =
                          col === "id"
                            ? item.id
                            : col === "scrapedAt"
                              ? formatDateTime(item.scrapedAt)
                              : item.data?.[col];

                        return (
                          <TableCell key={col} className="align-top">
                            {renderValue(value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="space-y-4 p-4">
                {paginatedItems.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden border-border/30 bg-[#0a0a0b] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        id: {item.id}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {formatDateTime(item.scrapedAt)}
                      </span>
                    </div>
                    <JsonSyntax value={item.data} />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {!loading && filteredItems.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">
                Mostrando {Math.min(filteredItems.length, (currentPage - 1) * itemsPerPage + 1)}-
                {Math.min(filteredItems.length, currentPage * itemsPerPage)} de {filteredItems.length} registros
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
