import { ExternalLink } from "lucide-react";
import { platformLabel, resolveExternalPostUrl } from "@/lib/publish/external-url";
import { cn } from "@/lib/utils";

export function ExternalPostLink({
  platform,
  externalPostId,
  className,
}: {
  platform: string;
  externalPostId: string | null | undefined;
  className?: string;
}) {
  const url = resolveExternalPostUrl(platform, externalPostId);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 font-medium text-gold hover:opacity-80",
        className,
      )}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      View on {platformLabel(platform)}
    </a>
  );
}
