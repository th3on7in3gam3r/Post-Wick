import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/social/platform-badge";

interface PostCardProps {
  content: string;
  platform: string;
  status: string;
  imageUrl?: string | null;
}

export function PostCard({ content, platform, status, imageUrl }: PostCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base not-italic font-sans">
          Post preview
        </CardTitle>
        <div className="flex gap-2">
          <PlatformBadge platform={platform} />
          <Badge variant={status === "pending" ? "accent" : "muted"}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="mb-4 rounded-md border border-brand-border"
          />
        )}
        <p className="whitespace-pre-wrap text-sm text-brand-text">{content}</p>
      </CardContent>
    </Card>
  );
}
