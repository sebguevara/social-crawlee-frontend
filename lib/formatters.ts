/* ──────────────────────────────────────────────────────────────
   Social Crawlee – Formatting Utilities
   ────────────────────────────────────────────────────────────── */

import { JobStatus, Platform, JobType } from "@/types";

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("es-ES", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "justo ahora";
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(dateString);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const mins = Math.floor(diffSecs / 60);
  const secs = diffSecs % 60;

  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export function getStatusColor(status: JobStatus): string {
  const map: Record<JobStatus, string> = {
    [JobStatus.QUEUED]: "text-muted-foreground",
    [JobStatus.RUNNING]: "text-primary",
    [JobStatus.COMPLETED]: "text-emerald-500",
    [JobStatus.FAILED]: "text-red-500",
  };
  return map[status];
}

export function getStatusBgColor(status: JobStatus): string {
  const map: Record<JobStatus, string> = {
    [JobStatus.QUEUED]: "bg-muted-foreground/10",
    [JobStatus.RUNNING]: "bg-primary/10",
    [JobStatus.COMPLETED]: "bg-emerald-500/10",
    [JobStatus.FAILED]: "bg-red-500/10",
  };
  return map[status];
}

export function getPlatformLabel(platform: Platform): string {
  const map: Record<Platform, string> = {
    [Platform.INSTAGRAM]: "Instagram",
    [Platform.FACEBOOK]: "Facebook",
    [Platform.X]: "X",
    [Platform.TIKTOK]: "TikTok",
  };
  return map[platform];
}

export function getJobTypeLabel(jobType: JobType): string {
  const map: Record<JobType, string> = {
    [JobType.PROFILE]: "Perfiles",
    [JobType.POSTS]: "Publicaciones",
    [JobType.COMMENTS]: "Comentarios",
  };
  return map[jobType];
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}
