import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BrandCardProps {
  id: string;
  name: string;
  websiteUrl: string;
  postCount?: number;
}

export function BrandCard({ id, name, websiteUrl, postCount = 0 }: BrandCardProps) {
  return (
    <Link href={`/brands/${id}`}>
      <Card className="transition-colors hover:border-brand-accent/50">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-brand-muted truncate">{websiteUrl}</p>
          <Badge variant="muted" className="mt-3">
            {postCount} posts
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
