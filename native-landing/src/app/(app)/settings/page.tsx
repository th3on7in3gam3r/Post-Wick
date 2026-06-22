import { Settings } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { PanelCard } from "@/components/app/panel-card";

export default function SettingsPage() {
  return (
    <>
      <AppHeader title="Settings" description="Workspace preferences and account." />
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <PanelCard title="Account" description="Managed through Clerk.">
          <p className="text-sm text-gray-body">
            Use the avatar menu in the top right to manage your profile and sign
            out.
          </p>
        </PanelCard>
        <PanelCard title="Workspace" description="More controls ship in Phase 2.">
          <div className="flex items-center gap-3 text-sm text-gray-body">
            <Settings className="h-4 w-4 text-gold" />
            Brand voice, posting frequency, and notifications will live here.
          </div>
        </PanelCard>
      </div>
    </>
  );
}
