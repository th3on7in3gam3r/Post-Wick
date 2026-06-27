import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { PLAN_LIMITS } from "@/lib/plans";

export function SidebarUpgradeNudge({ generateMax }: { generateMax: number }) {
  return (
    <div className="rounded-xl border border-gold/25 bg-cream px-3 py-3 shadow-sm">
      <p className="text-xs font-medium text-near-black">
        Free plan · {generateMax} posts/batch
      </p>
      <p className="mt-1 text-xs text-gray-body">
        Unlock up to {PLAN_LIMITS.max.generateMax} posts per batch
      </p>
      <TextureButton asChild variant="accent" size="sm" className="mt-3 w-full">
        <Link href="/settings/billing">
          Upgrade
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </TextureButton>
    </div>
  );
}
