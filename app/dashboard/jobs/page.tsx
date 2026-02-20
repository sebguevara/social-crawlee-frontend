"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { apiClient } from "@/lib/api";
import { JobStatus, Platform, JobType, type Job } from "@/types";

const STATUS_OPTIONS = [
  { label: "Todos los estados", value: "ALL" },
  { label: "En cola", value: JobStatus.QUEUED },
  { label: "En ejecución", value: JobStatus.RUNNING },
  { label: "Completados", value: JobStatus.COMPLETED },
  { label: "Fallidos", value: JobStatus.FAILED },
];

const PLATFORM_OPTIONS = [
  { label: "Todas las plataformas", value: "ALL" },
  { label: "Instagram", value: Platform.INSTAGRAM },
  { label: "Facebook", value: Platform.FACEBOOK },
  { label: "X", value: Platform.X },
  { label: "TikTok", value: Platform.TIKTOK },
];

const TYPE_OPTIONS = [
  { label: "Todos los tipos", value: "ALL" },
  { label: "Perfiles", value: JobType.PROFILE },
  { label: "Publicaciones", value: JobType.POSTS },
  { label: "Comentarios", value: JobType.COMMENTS },
];

export default function JobsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);

  const loadJobs = async () => {
    const result = await apiClient.listDashboardJobs({
      page: 1,
      limit: 200,
      status: statusFilter as JobStatus | "ALL",
      platform: platformFilter as Platform | "ALL",
      type: typeFilter as JobType | "ALL",
    });

    if (result.success && result.data) {
      setJobs(result.data.data);
      setTotalJobs(result.data.pagination.total);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadJobsSilently = async () => {
      const result = await apiClient.listDashboardJobs({
        page: 1,
        limit: 200,
        status: statusFilter as JobStatus | "ALL",
        platform: platformFilter as Platform | "ALL",
        type: typeFilter as JobType | "ALL",
      });
      if (result.success && result.data && !cancelled) {
        setJobs(result.data.data);
        setTotalJobs(result.data.pagination.total);
      }
    };

    void loadJobs();
    const timer = setInterval(() => {
      void loadJobsSilently();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [platformFilter, statusFilter, typeFilter]);

  const hasActiveFilters =
    statusFilter !== "ALL" || platformFilter !== "ALL" || typeFilter !== "ALL";

  const clearFilters = () => {
    setStatusFilter("ALL");
    setPlatformFilter("ALL");
    setTypeFilter("ALL");
  };

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Ejecuciones"
        description={`${totalJobs} ejecuciones en total.`}
      />

      <div className="flex flex-col gap-5 p-6">
        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="text-[12px] font-medium">Filtros</span>
          </div>

          <FilterSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterSelect
            options={PLATFORM_OPTIONS}
            value={platformFilter}
            onChange={setPlatformFilter}
          />
          <FilterSelect
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-1 text-[12px] font-medium text-primary transition-colors hover:text-primary/80"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-[12px] text-muted-foreground/60">
          Mostrando {jobs.length} de {totalJobs} ejecuciones
        </p>

        {/* Table */}
        <JobsTable jobs={jobs} onRefresh={() => void loadJobs()} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */

interface FilterSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}

function FilterSelect({ options, value, onChange }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full cursor-pointer rounded-lg border border-border/40 bg-secondary/40 px-3 pr-8 text-[13px] text-foreground transition-all duration-200 focus:border-primary/40 focus:bg-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-position-[right_8px_center] bg-no-repeat sm:w-auto"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
