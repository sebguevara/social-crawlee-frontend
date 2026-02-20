"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { apiClient } from "@/lib/api";
import { JobStatus, Platform, JobType, type Job } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        className="h-8 w-full cursor-pointer rounded-lg border-border/40 bg-secondary/40 text-[13px] text-foreground shadow-none transition-all duration-200 focus:ring-1 focus:ring-primary/20 sm:w-[190px]"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-lg border-border/50 bg-popover/95 backdrop-blur-xl">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="cursor-pointer text-[13px] data-[state=checked]:bg-primary/12 data-[state=checked]:text-primary"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
