import { cn } from "@/lib/utils";
import { VideoStatus } from "@/types/video";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: VideoStatus;
  className?: string;
}

const statusConfig: Record<VideoStatus, { label: string; className: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Clock,
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
    icon: Loader2,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/20 text-destructive border-destructive/30",
    icon: XCircle,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border",
        config.className,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", status === "PROCESSING" && "animate-spin")} />
      {config.label}
    </span>
  );
}
