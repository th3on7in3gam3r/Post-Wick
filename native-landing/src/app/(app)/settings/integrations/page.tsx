import { Plug, Sparkles } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { PanelCard } from "@/components/app/panel-card";
import { SettingsShell } from "@/components/app/settings-shell";
import { TextureButton } from "@/components/ui/texture-button";

const upcomingPlatforms = [
  { name: "Instagram", status: "In development" },
  { name: "Facebook", status: "Planned" },
  { name: "X (Twitter)", status: "Planned" },
  { name: "TikTok", status: "Planned" },
  { name: "Pinterest", status: "Planned" },
  { name: "Google Business", status: "Planned" },
] as const;

export default function IntegrationsPage() {
  return (
    <SettingsShell
      title="Integrations"
      description="Connect more platforms to expand your autopilot reach."
    >
      <EmptyState
        icon={Plug}
        title="Integrations are on the way"
        description="LinkedIn is available today under Connections. We're building a full integrations hub for Instagram, Facebook, X, TikTok, and more."
        action={
          <Link href="/settings/connections">
            <TextureButton type="button" variant="primary" size="sm">
              Go to Connections
            </TextureButton>
          </Link>
        }
      />

      <PanelCard
        title="Coming soon"
        description="These platforms will appear here as integrations roll out."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {upcomingPlatforms.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-cream/30 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white p-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                </div>
                <p className="text-sm font-medium text-near-black">{platform.name}</p>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-label">
                {platform.status}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-gray-body">
          Want early access? Email{" "}
          <a
            href="mailto:hello@postwick.com"
            className="font-medium text-gold underline decoration-gold/40 underline-offset-2"
          >
            hello@postwick.com
          </a>{" "}
          and tell us which platforms matter most for your business.
        </p>
      </PanelCard>
    </SettingsShell>
  );
}
