"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Database,
  AlertCircle,
  RefreshCw,
  Copy,
  Download,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { apiClient } from "@/lib/api";
import {
  formatDateTime,
  formatDuration,
  getJobTypeLabel,
} from "@/lib/formatters";
import { JobStatus, type Job } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const jobId = Number(id);
  const [job, setJob] = useState<Job | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(jobId) || jobId <= 0) {
      setNotFound(true);
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let source: EventSource | null = null;

    const loadDetail = async () => {
      const result = await apiClient.getDashboardJobDetail(jobId);
      if (cancelled) return;

      if (!result.success || !result.data) {
        setNotFound(true);
        return;
      }

      setNotFound(false);
      setJob(result.data);
    };

    const startPolling = () => {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        void loadDetail();
      }, 3000);
    };

    const startStream = () => {
      source = apiClient.openDashboardJobStream(jobId, {
        onProgress: (nextJob) => {
          if (cancelled) return;
          setNotFound(false);
          setJob(nextJob);
        },
        onDone: (nextJob) => {
          if (cancelled) return;
          setJob(nextJob);
          if (source) {
            source.close();
            source = null;
          }
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
        },
        onError: () => {
          startPolling();
        },
      });
    };

    void loadDetail();
    startStream();

    return () => {
      cancelled = true;
      if (source) source.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [jobId]);

  if (notFound) {
    return (
      <div className="flex flex-col">
        <DashboardHeader title="Ejecución no encontrada" />
        <div className="flex flex-col items-center gap-4 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No se encontró la ejecución #{id}.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/jobs">Volver a ejecuciones</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col">
        <DashboardHeader title="Cargando ejecución..." />
        <div className="p-6 text-sm text-muted-foreground">
          Obteniendo información del job...
        </div>
      </div>
    );
  }

  const isRunning = job.status === JobStatus.RUNNING;
  const isCompleted = job.status === JobStatus.COMPLETED;

  const handleCopyDatasetId = () => {
    navigator.clipboard.writeText(job.datasetId);
    sileo.success({
      title: "Copiado",
      description: "ID del dataset copiado al portapapeles",
    });
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={`Ejecución #${job.id}`}
        description={`${getJobTypeLabel(job.jobType)} en ${job.platform.toLowerCase()}`}
      />

      <div className="flex flex-col gap-6 p-6">
        {/* Back link */}
        <Link
          href="/dashboard/jobs"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Todas las ejecuciones
        </Link>

        {/* Status & Progress Card */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <div className="flex flex-col gap-6">
            {/* Top row */}
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge status={job.status} />
              <PlatformBadge platform={job.platform} />
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {getJobTypeLabel(job.jobType)}
              </span>
              {isRunning && (
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progreso</span>
                <span className="font-mono text-sm text-foreground">
                  {job.processedItems} / {job.totalItems} ítems ({job.progress}
                  %)
                </span>
              </div>
              <Progress value={job.progress} className="h-2" />
            </div>

            {/* Metadata grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetaItem
                icon={Calendar}
                label="Creado"
                value={formatDateTime(job.createdAt)}
              />
              <MetaItem
                icon={Clock}
                label="Duración"
                value={formatDuration(job.createdAt, job.finishedAt)}
              />
              <MetaItem
                icon={Database}
                label="ID del dataset"
                value={job.datasetId}
                mono
              />
              <MetaItem
                icon={RefreshCw}
                label="Última actualización"
                value={formatDateTime(job.updatedAt)}
              />
            </div>

            {/* Error message */}
            {job.errorMessage && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-red-500">
                    Error
                  </span>
                  <span className="text-sm text-red-400">
                    {job.errorMessage}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Configuration */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Configuración de entrada
          </h3>
          <div className="rounded-lg bg-[#0a0a0b] p-4">
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-[#a8b4c0]">
              {JSON.stringify(job.input, null, 2)}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 sm:w-auto"
            onClick={handleCopyDatasetId}
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar ID del dataset
          </Button>

          {isCompleted && (
            <Button size="sm" className="w-full gap-2 sm:w-auto" asChild>
              <Link href={`/dashboard/datasets?jobId=${job.id}`}>
                <Download className="h-3.5 w-3.5" />
                Ver dataset
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────── */

interface MetaItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}

function MetaItem({ icon: Icon, label, value, mono }: MetaItemProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
