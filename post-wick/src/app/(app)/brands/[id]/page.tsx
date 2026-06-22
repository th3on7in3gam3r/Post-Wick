import Link from "next/link";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function BrandOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header title="Brand overview" />
      <div className="flex-1 p-6">
        <div className="mb-6 flex gap-3">
          <Link href={`/brands/${id}/queue`}>
            <Button>Approval queue</Button>
          </Link>
          <Link href={`/brands/${id}/calendar`}>
            <Button variant="outline">Calendar</Button>
          </Link>
          <Link href={`/brands/${id}/settings`}>
            <Button variant="ghost">Settings</Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Brand workspace</CardTitle>
            <CardDescription>ID: {id}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-brand-muted">
              Run research and generate posts to populate your approval queue.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
