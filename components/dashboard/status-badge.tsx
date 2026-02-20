import { JobStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Loader2, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  JobStatus,
  {
    label: string;
    icon: React.ElementType;
    textColor: string;
    bgColor: string;
    dotColor: string;
  }
> = {
  [JobStatus.QUEUED]: {
    label: "En cola",
    icon: Clock,
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    dotColor: "bg-amber-500",
  },
  [JobStatus.RUNNING]: {
    label: "En ejecución",
    icon: Loader2,
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    dotColor: "bg-blue-500",
  },
  [JobStatus.COMPLETED]: {
    label: "Completado",
    icon: Check,
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    dotColor: "bg-emerald-500",
  },
  [JobStatus.FAILED]: {
    label: "Fallido",
    icon: XCircle,
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    dotColor: "bg-red-500",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium",
        config.textColor,
        config.bgColor,
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          config.dotColor,
          status === JobStatus.RUNNING && "pulse-dot",
        )}
      />
      {config.label}
    </span>
  );
}
