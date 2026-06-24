import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Send,
  SkipForward,
  Sparkles,
  XCircle,
} from "lucide-react";
import { RelativeScheduleTime } from "@/components/app/relative-schedule-time";
import type { ActivityItem } from "@/lib/db";
import { ExternalPostLink } from "@/components/app/external-post-link";
import { cn } from "@/lib/utils";

const actionMeta = {
  published: {
    icon: Send,
    label: "Published",
    className: "text-emerald-700",
  },
  scheduled: {
    icon: Clock3,
    label: "Scheduled",
    className: "text-gold",
  },
  skipped: {
    icon: SkipForward,
    label: "Skipped",
    className: "text-gray-body",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "text-red-600",
  },
  generated: {
    icon: Sparkles,
    label: "Updated",
    className: "text-gray-body",
  },
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-body">
        Activity will show up here as you approve and publish posts.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {items.map((item) => {
        const meta = actionMeta[item.action];
        const Icon = meta.icon;
        const timestamp = item.publishedAt ?? item.scheduledAt ?? item.updatedAt;

        return (
          <li
            key={`${item.id}-${item.updatedAt}`}
            className="flex gap-3 rounded-xl border border-black/[0.06] bg-cream/50 px-4 py-3"
          >
            <div className="mt-0.5 rounded-full bg-white p-2">
              <Icon className={cn("h-4 w-4", meta.className)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-near-black">{meta.label}</p>
                <span className="text-xs uppercase tracking-wide text-gray-label">
                  {item.platform}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-body">{item.content}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-label">
                <span>{item.brandName}</span>
                {timestamp ? (
                  <RelativeScheduleTime iso={timestamp} />
                ) : null}
                {item.action === "published" ? (
                  <ExternalPostLink
                    platform={item.platform}
                    externalPostId={item.externalPostId}
                    className="text-xs"
                  />
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ActivityFeedFooter() {
  return (
    <div className="mt-4 flex items-center gap-2 text-xs text-gray-label">
      <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
      <Link href="/history" className="hover:text-gold">
        View full publishing history
      </Link>
    </div>
  );
}
