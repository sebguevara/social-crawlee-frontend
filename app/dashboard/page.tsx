"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Briefcase,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { JobsTable } from "@/components/dashboard/jobs-table";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { apiClient } from "@/lib/api";
import { Platform, JobType, type DashboardSummaryResponse } from "@/types";
import { formatNumber, getJobTypeLabel } from "@/lib/formatters";

export default function DashboardOverviewPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const result = await apiClient.getDashboardSummary(user?.id ?? null);
    if (result.success && result.data) {
      setStats(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchSummary(true);
    const timer = setInterval(() => {
      void fetchSummary();
    }, 5000);

    return () => clearInterval(timer);
  }, [user?.id]);

  const totalJobs = stats?.totalJobs ?? 0;
  const recentJobs = stats?.recentJobs ?? [];

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Resumen"
        description="Monitorea tus operaciones de scraping de un vistazo."
      />

      <div className="flex flex-col gap-6 p-6">
        {/* ── Stat Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Ejecuciones totales"
            value={stats?.totalJobs ?? 0}
            icon={Briefcase}
            loading={loading}
          />
          <StatCard
            label="Activos"
            value={stats?.activeJobs ?? 0}
            icon={Play}
            trend="running"
            loading={loading}
          />
          <StatCard
            label="Completados"
            value={stats?.completedJobs ?? 0}
            icon={CheckCircle2}
            loading={loading}
          />
          <StatCard
            label="Fallidos"
            value={stats?.failedJobs ?? 0}
            icon={AlertCircle}
            loading={loading}
          />
          <StatCard
            label="Ítems scrapeados"
            value={formatNumber(stats?.totalItemsScraped ?? 0)}
            icon={TrendingUp}
            loading={loading}
          />
        </div>

        {/* ── Breakdown Cards ─────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* By platform */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="mb-4 text-[13px] font-semibold text-foreground">
              Ejecuciones por plataforma
            </h3>
            <div className="flex flex-col gap-3">
              {Object.entries(stats?.jobsByPlatform ?? {}).map(
                ([platform, count]) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between"
                  >
                    <PlatformBadge platform={platform as Platform} />
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary/50 transition-all duration-500"
                          style={{
                            width: `${totalJobs > 0 ? (count / totalJobs) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[13px] font-medium text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* By type */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="mb-4 text-[13px] font-semibold text-foreground">
              Ejecuciones por tipo
            </h3>
            <div className="flex flex-col gap-3">
              {Object.entries(stats?.jobsByType ?? {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">
                    {getJobTypeLabel(type as JobType)}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary/40 transition-all duration-500"
                        style={{
                          width: `${totalJobs > 0 ? (count / totalJobs) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[13px] font-medium text-muted-foreground">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Jobs ─────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-foreground">
              Ejecuciones recientes
            </h3>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-1 text-[12px] font-medium text-primary transition-colors hover:text-primary/80"
            >
              Ver todos
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <JobsTable jobs={recentJobs} onRefresh={() => fetchSummary()} />
        </div>
      </div>
    </div>
  );
}
