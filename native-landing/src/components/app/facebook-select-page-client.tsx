"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

type FacebookPageOption = {
  id: string;
  name: string;
  pictureUrl: string | null;
};

export function FacebookSelectPageClient({ brandId }: { brandId: string }) {
  const router = useRouter();
  const [pages, setPages] = useState<FacebookPageOption[]>([]);
  const [brandName, setBrandName] = useState("");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPages() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/social/meta/pending-pages?brandId=${encodeURIComponent(brandId)}`,
          { credentials: "same-origin" },
        );
        const data = (await response.json().catch(() => ({}))) as {
          brandName?: string;
          pages?: FacebookPageOption[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Could not load your Facebook Pages",
          );
        }

        if (cancelled) return;

        const nextPages = data.pages ?? [];
        setBrandName(data.brandName ?? "");
        setPages(nextPages);
        setSelectedPageId(nextPages[0]?.id ?? null);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your Facebook Pages",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPages();
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  async function handleConfirm() {
    if (!selectedPageId || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/social/meta/select-page", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, pageId: selectedPageId }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not connect the selected Page",
        );
      }

      router.push("/settings/integrations?connected=facebook");
      router.refresh();
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : "Could not connect the selected Page",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PanelCard
      title="Choose a Facebook Page"
      description={
        brandName
          ? `Select which Page to connect for ${brandName}.`
          : "Select which Page Kerygma Social should publish to."
      }
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center text-gray-body">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading your Pages…
        </div>
      ) : error ? (
        <div className="space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <Link
            href="/settings/integrations"
            className="text-sm font-medium text-[#1877F2] hover:underline"
          >
            Back to integrations
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="space-y-3">
            {pages.map((page) => {
              const selected = page.id === selectedPageId;
              return (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedPageId(page.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-[#1877F2] bg-[#1877F2]/5"
                        : "border-black/[0.06] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/[0.03]",
                    )}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#1877F2]/10">
                      {page.pictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={page.pictureUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#1877F2]">
                          {page.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-near-black">
                        {page.name}
                      </span>
                      <span className="block text-xs text-gray-body">Facebook Page</span>
                    </span>
                    {selected ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1877F2]" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <TextureButton
              type="button"
              disabled={!selectedPageId || submitting}
              onClick={() => void handleConfirm()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                "Connect this Page"
              )}
            </TextureButton>
            <Link
              href="/settings/integrations"
              className="text-sm font-medium text-gray-body hover:text-near-black"
            >
              Cancel
            </Link>
          </div>
        </div>
      )}
    </PanelCard>
  );
}
