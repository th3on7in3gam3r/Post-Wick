import { Header } from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <>
      <Header title="Billing" />
      <div className="mx-auto max-w-lg flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-brand-muted">You&apos;re on the Free plan.</p>
            <Button>Upgrade to Pro</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
