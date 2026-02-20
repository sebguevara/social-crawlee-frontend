import { Platform } from "@/types";
import { cn } from "@/lib/utils";
import {
  SiInstagram,
  SiFacebook,
  SiX,
  SiTiktok,
} from "@icons-pack/react-simple-icons";

const PLATFORM_CONFIG: Record<
  Platform,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }
> = {
  [Platform.INSTAGRAM]: {
    label: "Instagram",
    icon: SiInstagram,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-500/10",
  },
  [Platform.FACEBOOK]: {
    label: "Facebook",
    icon: SiFacebook,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  [Platform.X]: {
    label: "X",
    icon: SiX,
    color: "text-foreground",
    bg: "bg-secondary dark:bg-white/5",
  },
  [Platform.TIKTOK]: {
    label: "TikTok",
    icon: SiTiktok,
    color: "text-foreground",
    bg: "bg-secondary dark:bg-white/5",
  },
};

interface PlatformBadgeProps {
  platform: Platform;
  showLabel?: boolean;
  className?: string;
}

export function PlatformBadge({
  platform,
  showLabel = true,
  className,
}: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium",
        config.bg,
        config.color,
        className,
      )}
    >
      <Icon size={13} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
