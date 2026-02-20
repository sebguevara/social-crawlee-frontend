import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accentColor?: string;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentColor,
  className,
  loading,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "glass-card stat-accent group flex flex-col gap-3 rounded-xl p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/6 transition-colors group-hover:bg-primary/10">
          <Icon className="h-4 w-4 text-primary/70" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        ) : (
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </span>
        )}
        {trend && (
          <span className="mb-0.5 rounded-md bg-primary/8 px-1.5 py-0.5 text-[11px] font-medium text-primary">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
