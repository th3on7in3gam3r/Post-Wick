import { Header } from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BrandSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header title="Brand settings" />
      <div className="mx-auto max-w-lg flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-brand-muted">
              Configure posting frequency, platforms, and research preferences
              for brand {id}.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
