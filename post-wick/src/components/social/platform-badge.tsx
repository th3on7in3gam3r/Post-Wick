import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "X",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export function PlatformBadge({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  return (
    <Badge variant="default" className={cn(className)}>
      {platformLabels[platform] ?? platform}
    </Badge>
  );
}
