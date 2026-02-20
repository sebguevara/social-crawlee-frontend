"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Job } from "@/types";
import { StatusBadge } from "./status-badge";
import { PlatformBadge } from "./platform-badge";
import {
  formatRelativeTime,
  getJobTypeLabel,
  formatDuration,
} from "@/lib/formatters";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { XCircle, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { JobStatus } from "@/types";

interface JobsTableProps {
  jobs: Job[];
  compact?: boolean;
  onRefresh?: () => void;
}

export function JobsTable({
  jobs,
  compact = false,
  onRefresh,
}: JobsTableProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleStop = async (jobId: number) => {
    setProcessingId(jobId);
    try {
      const res = await apiClient.stopJob(jobId);
      if (res.success) {
        toast.success("Ejecución detenida");
        onRefresh?.();
      } else {
        toast.error("No se pudo detener", { description: res.error });
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (jobId: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta ejecución?")) return;
    setProcessingId(jobId);
    try {
      const res = await apiClient.deleteJob(jobId);
      if (res.success) {
        toast.success("Ejecución eliminada");
        onRefresh?.();
      } else {
        toast.error("No se pudo eliminar", { description: res.error });
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="glass-card w-full overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full md:min-w-0">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Plataforma
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Tipo
              </th>
              {!compact && (
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Progreso
                </th>
              )}
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Resultados
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Iniciado
              </th>
              {!compact && (
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                  Duración
                </th>
              )}
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, idx) => (
              <tr
                key={job.id}
                className={`group border-b border-border/20 transition-colors hover:bg-primary/2 ${
                  idx === jobs.length - 1 ? "border-b-0" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-4 py-3">
                  <PlatformBadge platform={job.platform} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px] text-muted-foreground">
                    {getJobTypeLabel(job.jobType)}
                  </span>
                </td>
                {!compact && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-[12px] font-mono text-muted-foreground/70">
                        {job.progress}%
                      </span>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-[13px] font-medium text-foreground">
                    {job.processedItems.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[13px] text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {formatRelativeTime(job.createdAt)}
                  </span>
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-right">
                    <span
                      className="font-mono text-[12px] text-muted-foreground/70"
                      suppressHydrationWarning
                    >
                      {formatDuration(job.createdAt, job.finishedAt)}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-all group-hover:opacity-100">
                    {(job.status === "QUEUED" || job.status === "RUNNING") && (
                      <button
                        onClick={() => handleStop(job.id)}
                        disabled={processingId === job.id}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-orange-500/60 transition-all hover:bg-orange-500/10 hover:text-orange-500"
                        title="Detener ejecución"
                      >
                        {processingId === job.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={processingId === job.id}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-500/60 transition-all hover:bg-red-500/10 hover:text-red-500"
                      title="Eliminar ejecución"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 transition-all hover:bg-foreground/4 hover:text-foreground"
                      aria-label={`Ver ejecución ${job.id}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td
                  colSpan={compact ? 6 : 8}
                  className="py-16 text-center text-[13px] text-muted-foreground"
                >
                  No se encontraron ejecuciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
