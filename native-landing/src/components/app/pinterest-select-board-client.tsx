"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

type PinterestBoardOption = {
  id: string;
  name: string;
  pictureUrl: string | null;
};

export function PinterestSelectBoardClient({ brandId }: { brandId: string }) {
  const router = useRouter();
  const [boards, setBoards] = useState<PinterestBoardOption[]>([]);
  const [brandName, setBrandName] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBoards() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/social/pinterest/pending-boards?brandId=${encodeURIComponent(brandId)}`,
          { credentials: "same-origin" },
        );
        const data = (await response.json().catch(() => ({}))) as {
          brandName?: string;
          boards?: PinterestBoardOption[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Could not load your Pinterest boards",
          );
        }

        if (cancelled) return;

        const nextBoards = data.boards ?? [];
        setBrandName(data.brandName ?? "");
        setBoards(nextBoards);
        setSelectedBoardId(nextBoards[0]?.id ?? null);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your Pinterest boards",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBoards();
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  async function handleConfirm() {
    if (!selectedBoardId || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/social/pinterest/select-board", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, boardId: selectedBoardId }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not connect the selected board",
        );
      }

      router.push("/settings/integrations?connected=pinterest");
      router.refresh();
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : "Could not connect the selected board",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PanelCard
      title="Choose a Pinterest board"
      description={
        brandName
          ? `Select which board to pin to for ${brandName}.`
          : "Select which board Kerygma Social should publish pins to."
      }
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center text-gray-body">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading your boards…
        </div>
      ) : error ? (
        <div className="space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <Link
            href="/settings/integrations"
            className="text-sm font-medium text-[#BD081C] hover:underline"
          >
            Back to integrations
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="space-y-3">
            {boards.map((board) => {
              const selected = board.id === selectedBoardId;
              return (
                <li key={board.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedBoardId(board.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-[#BD081C] bg-[#BD081C]/5"
                        : "border-black/[0.06] hover:border-[#BD081C]/40 hover:bg-[#BD081C]/[0.03]",
                    )}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#BD081C]/10">
                      {board.pictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={board.pictureUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#BD081C]">
                          {board.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-near-black">
                        {board.name}
                      </span>
                      <span className="block text-xs text-gray-body">Pinterest board</span>
                    </span>
                    {selected ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#BD081C]" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <TextureButton
              type="button"
              disabled={!selectedBoardId || submitting}
              onClick={() => void handleConfirm()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                "Connect this board"
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
