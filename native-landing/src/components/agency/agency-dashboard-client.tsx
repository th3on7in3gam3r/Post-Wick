"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Loader2, Users } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";
import type { AgencyRecord, AgencyReferralRow } from "@/lib/db";
import { cn } from "@/lib/utils";

type AgencyDashboardClientProps = {
  agency: AgencyRecord;
  referralUrl: string;
  stats: {
    totalReferred: number;
    activeSubscriptions: number;
  };
  referrals: AgencyReferralRow[];
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function tierLabel(tier: AgencyReferralRow["subscriptionTier"]) {
  if (tier === "max") return "Max";
  if (tier === "pro") return "Pro";
  return "Free";
}

export function AgencyDashboardClient({
  agency,
  referralUrl,
  stats,
  referrals,
}: AgencyDashboardClientProps) {
  const [copied, setCopied] = useState(false);
  const [whiteLabelName, setWhiteLabelName] = useState(agency.whiteLabelName ?? "");
  const [whiteLabelSaving, setWhiteLabelSaving] = useState(false);
  const [whiteLabelMessage, setWhiteLabelMessage] = useState<string | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleWhiteLabelSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWhiteLabelSaving(true);
    setWhiteLabelMessage(null);

    try {
      const response = await fetch("/api/agency/white-label", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whiteLabelName: whiteLabelName.trim() || null,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save white-label name");
      }

      setWhiteLabelMessage("Saved. Full white-label theming is coming soon.");
    } catch (error) {
      setWhiteLabelMessage(
        error instanceof Error ? error.message : "Could not save white-label name",
      );
    } finally {
      setWhiteLabelSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card">
          <p className="text-sm text-gray-body">Total referred clients</p>
          <p className="mt-2 font-playfair text-4xl italic text-near-black">
            {stats.totalReferred}
          </p>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card">
          <p className="text-sm text-gray-body">Active subscriptions</p>
          <p className="mt-2 font-playfair text-4xl italic text-near-black">
            {stats.activeSubscriptions}
          </p>
        </div>
      </div>

      <PanelCard
        title="Referral link"
        description="Share this link so new clients are attributed to your agency."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={referralUrl}
            className="min-w-0 flex-1 rounded-xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-near-black"
          />
          <TextureButton type="button" variant="secondary" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </>
            )}
          </TextureButton>
        </div>
        <p className="mt-3 text-xs text-gray-body">
          Referral code: <span className="font-mono text-near-black">{agency.referralCode}</span>
        </p>
      </PanelCard>

      <PanelCard
        title="White-label (preview)"
        description="Set the name your clients will see. Custom domains and branding are on the roadmap."
      >
        <form onSubmit={handleWhiteLabelSave} className="space-y-4">
          <input
            value={whiteLabelName}
            onChange={(event) => setWhiteLabelName(event.target.value)}
            maxLength={80}
            placeholder="Your agency brand name"
            className="w-full rounded-xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-near-black outline-none ring-gold/30 transition focus:border-gold/40 focus:ring-2"
          />
          {whiteLabelMessage ? (
            <p className="text-sm text-gray-body">{whiteLabelMessage}</p>
          ) : null}
          <TextureButton type="submit" variant="secondary" disabled={whiteLabelSaving}>
            {whiteLabelSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save white-label name"
            )}
          </TextureButton>
        </form>
      </PanelCard>

      <PanelCard
        title="Referred clients"
        description="Everyone who signed up using your referral link."
      >
        {referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-black/10 bg-[#faf8f3]/60 px-6 py-12 text-center">
            <Users className="mb-3 h-8 w-8 text-gray-body/70" />
            <p className="text-sm text-gray-body">
              No referred clients yet. Share your link to start tracking signups.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-gray-body">
                  <th className="px-2 py-3 font-medium">Client</th>
                  <th className="px-2 py-3 font-medium">Plan</th>
                  <th className="px-2 py-3 font-medium">Signed up</th>
                  <th className="px-2 py-3 font-medium">Converted</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-black/[0.04]">
                    <td className="px-2 py-3 text-near-black">
                      {referral.email ?? "Unknown email"}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          referral.subscriptionTier === "free"
                            ? "bg-black/[0.04] text-gray-body"
                            : "bg-gold/15 text-gold",
                        )}
                      >
                        {tierLabel(referral.subscriptionTier)}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-gray-body">
                      {formatDate(referral.signupAt)}
                    </td>
                    <td className="px-2 py-3 text-gray-body">
                      {formatDate(referral.convertedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>
    </div>
  );
}
