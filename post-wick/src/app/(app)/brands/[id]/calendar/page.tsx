import { Header } from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header title="Publishing calendar" />
      <div className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-brand-muted">
              No scheduled posts for brand {id}. Approve posts in the queue to
              schedule them.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
