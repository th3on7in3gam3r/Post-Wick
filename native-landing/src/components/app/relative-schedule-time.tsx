import {
  formatRelativeScheduleLabel,
  formatScheduleLabel,
} from "@/lib/scheduling/slots";
import { cn } from "@/lib/utils";

export function RelativeScheduleTime({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  return (
    <time
      dateTime={iso}
      title={formatScheduleLabel(iso)}
      className={cn("cursor-default", className)}
    >
      {formatRelativeScheduleLabel(iso)}
    </time>
  );
}
