import { Header } from "@/components/app/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountSettingsPage() {
  return (
    <>
      <Header title="Account settings" />
      <div className="mx-auto max-w-lg flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-brand-muted">
              Manage your account via the user menu in the header.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
