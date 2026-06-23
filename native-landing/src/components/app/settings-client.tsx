"use client";

import { useState } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import {
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Globe,
  Link2,
  Loader2,
  Plug,
  Shield,
  User,
} from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { CookieSettingsTrigger } from "@/components/cookie-settings-trigger";
import { TextureButton } from "@/components/ui/texture-button";
import { getPlanLimits, type SubscriptionTier } from "@/lib/plans";
import {
  POSTING_FREQUENCY_OPTIONS,
  TIMEZONE_OPTIONS,
  type UserSettingsPayload,
} from "@/lib/user-settings";
import { cn } from "@/lib/utils";

function SettingsToggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-gold" : "bg-black/15",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card transition hover:border-gold/30 hover:shadow-md"
    >
      <div className="rounded-full bg-cream p-3">
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-near-black">{title}</p>
          {badge ? (
            <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-gray-body">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-gray-body">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-label transition group-hover:text-gold" />
    </Link>
  );
}

function formatMemberSince(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function SettingsClient({
  profile,
  workspace,
  initialSettings,
}: {
  profile: {
    fullName: string | null;
    email: string | null;
    imageUrl: string | null;
    memberSince: string;
  };
  workspace: {
    tier: SubscriptionTier;
    brandCount: number;
    connectionCount: number;
  };
  initialSettings: UserSettingsPayload;
}) {
  const { openUserProfile } = useClerk();
  const [settings, setSettings] = useState(initialSettings);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const plan = getPlanLimits(workspace.tier);

  async function saveSettings(
    patch: Partial<UserSettingsPayload>,
    key: string,
  ) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSavingKey(key);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to save settings",
        );
      }
      setSettings(data.settings);
      setSavedMessage("Settings saved.");
    } catch (error) {
      setSettings(settings);
      alert(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {savedMessage ? (
        <div className="flex items-center gap-2 rounded-xl border border-gold/25 bg-cream/60 px-4 py-3 text-sm text-near-black">
          <CheckCircle2 className="h-4 w-4 text-gold" />
          {savedMessage}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <QuickLinkCard
          href="/settings/integrations"
          icon={Plug}
          title="Integrations"
          description="Connect LinkedIn, Instagram, Facebook, and more."
        />
        <QuickLinkCard
          href="/settings/billing"
          icon={CreditCard}
          title="Billing"
          description={`You're on ${plan.label}. Manage your subscription.`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PanelCard
          title="Account"
          description="Profile and sign-in are managed through Clerk."
          action={
            <TextureButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => openUserProfile()}
            >
              Manage account
            </TextureButton>
          }
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream">
              {profile.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-gold" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-near-black">
                {profile.fullName ?? "Post-Wick user"}
              </p>
              <p className="mt-1 text-sm text-gray-body">
                {profile.email ?? "No email on file"}
              </p>
              <p className="mt-3 text-xs text-gray-label">
                Member since {formatMemberSince(profile.memberSince)}
              </p>
            </div>
          </div>
        </PanelCard>

        <PanelCard
          title="Workspace"
          description="A snapshot of your autopilot workspace."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-black/[0.06] bg-cream/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-label">
                Plan
              </p>
              <p className="mt-2 font-playfair text-2xl italic text-near-black">
                {plan.label}
              </p>
            </div>
            <div className="rounded-xl border border-black/[0.06] bg-cream/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-label">
                Brands
              </p>
              <p className="mt-2 flex items-center gap-2 font-playfair text-2xl italic text-near-black">
                <Building2 className="h-5 w-5 text-gold" />
                {workspace.brandCount}
              </p>
            </div>
            <div className="rounded-xl border border-black/[0.06] bg-cream/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-label">
                Channels
              </p>
              <p className="mt-2 flex items-center gap-2 font-playfair text-2xl italic text-near-black">
                <Link2 className="h-5 w-5 text-gold" />
                {workspace.connectionCount}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/brands">
              <TextureButton type="button" variant="minimal" size="sm">
                View brands
              </TextureButton>
            </Link>
            <Link href="/settings/billing">
              <TextureButton type="button" variant="minimal" size="sm">
                View billing
              </TextureButton>
            </Link>
          </div>
        </PanelCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PanelCard
          title="Autopilot defaults"
          description="Applied to new brands you create."
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="settings-timezone"
                className="flex items-center gap-2 text-sm font-medium text-near-black"
              >
                <Globe className="h-4 w-4 text-gold" />
                Timezone
              </label>
              <p className="mt-1 text-sm text-gray-body">
                Used for scheduling posts on your calendar.
              </p>
              <div className="relative mt-3">
                <select
                  id="settings-timezone"
                  value={settings.timezone}
                  disabled={savingKey === "timezone"}
                  onChange={(event) =>
                    void saveSettings({ timezone: event.target.value }, "timezone")
                  }
                  className="w-full appearance-none rounded-xl border border-black/[0.1] bg-white px-4 py-2.5 pr-10 text-sm text-near-black outline-none focus:border-gold/50"
                >
                  {TIMEZONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {savingKey === "timezone" ? (
                  <Loader2 className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-label" />
                ) : null}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-near-black">
                <CalendarClock className="h-4 w-4 text-gold" />
                Default posting frequency
              </label>
              <p className="mt-1 text-sm text-gray-body">
                How often new brands post once content is approved.
              </p>
              <div className="mt-3 space-y-2">
                {POSTING_FREQUENCY_OPTIONS.map((option) => {
                  const selected = settings.defaultPostingFrequency === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={savingKey === "frequency"}
                      onClick={() =>
                        void saveSettings(
                          { defaultPostingFrequency: option.value },
                          "frequency",
                        )
                      }
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                        selected
                          ? "border-gold/40 bg-cream/70"
                          : "border-black/[0.08] bg-white hover:border-black/[0.12]",
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-near-black">
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-body">{option.description}</p>
                      </div>
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full border",
                          selected
                            ? "border-gold bg-gold"
                            : "border-black/20 bg-white",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </PanelCard>

        <PanelCard
          title="Notifications"
          description="Choose what Post-Wick should email you about."
        >
          <div className="space-y-4">
            {[
              {
                key: "notifyQueue" as const,
                title: "Approval queue reminders",
                description: "When posts are waiting for your review.",
              },
              {
                key: "notifyPublish" as const,
                title: "Publish confirmations",
                description: "When autopilot successfully publishes a post.",
              },
              {
                key: "notifyWeeklyDigest" as const,
                title: "Weekly digest",
                description: "A summary of scheduled and published content.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4 rounded-xl border border-black/[0.06] bg-cream/30 p-4"
              >
                <div className="flex gap-3">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="text-sm font-medium text-near-black">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-body">{item.description}</p>
                  </div>
                </div>
                <SettingsToggle
                  checked={settings[item.key]}
                  disabled={savingKey === item.key}
                  label={item.title}
                  onChange={(value) => void saveSettings({ [item.key]: value }, item.key)}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-label">
            Email delivery is rolling out. Your preferences are saved now so notifications
            work as soon as they launch.
          </p>
        </PanelCard>
      </div>

      <PanelCard
        title="Privacy & cookies"
        description="Control how Post-Wick uses optional cookies and review legal policies."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-sm font-medium text-near-black">Cookie preferences</p>
              <p className="mt-1 text-sm text-gray-body">
                Manage analytics and optional cookies anytime.
              </p>
            </div>
          </div>
          <CookieSettingsTrigger className="text-sm font-medium text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold" />
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <Link
            href="/privacy"
            className="font-medium text-near-black underline decoration-black/25 underline-offset-2 hover:decoration-black/50"
          >
            Privacy Policy
          </Link>
          <Link
            href="/cookies"
            className="font-medium text-near-black underline decoration-black/25 underline-offset-2 hover:decoration-black/50"
          >
            Cookie Policy
          </Link>
          <Link
            href="/terms"
            className="font-medium text-near-black underline decoration-black/25 underline-offset-2 hover:decoration-black/50"
          >
            Terms of Service
          </Link>
        </div>
      </PanelCard>
    </div>
  );
}
