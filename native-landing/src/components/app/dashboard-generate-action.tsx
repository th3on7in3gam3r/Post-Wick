"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, X } from "lucide-react";
import { useActiveClient } from "@/components/app/client-context";
import { TextureButton } from "@/components/ui/texture-button";
import { GENERATE_PLATFORMS, generatePlatformLabel } from "@/lib/platforms";

export function DashboardGenerateAction({ generateMax }: { generateMax: number }) {
  const router = useRouter();
  const { clients, activeClient } = useActiveClient();
  const [open, setOpen] = useState(false);
  const [brandId, setBrandId] = useState(activeClient.id);
  const [platform, setPlatform] = useState("linkedin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeClient.id) {
      setBrandId(activeClient.id);
    }
  }, [activeClient.id]);

  if (clients.length === 0) return null;

  const buttonLabel = (
    <>
      Generate posts
      <ArrowRight className="ml-2 h-4 w-4" />
    </>
  );

  async function handleGenerate() {
    if (!brandId) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, count: generateMax }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to generate posts",
        );
      }

      const parts = [
        `Generated ${data.count} ${generatePlatformLabel(platform)} posts.`,
      ];

      if (data.imagesGenerated > 0) {
        parts.push(`${data.imagesGenerated} include images.`);
      }

      setMessage(parts.join(" "));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    if (loading) return;
    setOpen(false);
    setMessage(null);
  }

  if (clients.length === 1) {
    return (
      <TextureButton asChild variant="primary" size="sm">
        <Link href={`/brands/${clients[0]!.id}`}>{buttonLabel}</Link>
      </TextureButton>
    );
  }

  return (
    <>
      <TextureButton
        type="button"
        variant="primary"
        size="sm"
        onClick={() => {
          setBrandId(activeClient.id || clients[0]!.id);
          setMessage(null);
          setOpen(true);
        }}
      >
        {buttonLabel}
      </TextureButton>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-near-black/40 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-generate-title"
            className="relative w-full max-w-md rounded-2xl border border-black/[0.08] bg-white p-6 shadow-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="dashboard-generate-title"
                  className="font-playfair text-xl italic text-near-black"
                >
                  Generate posts
                </h2>
                <p className="mt-1 text-sm text-gray-body">
                  Pick a brand and platform without leaving the dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="rounded-lg p-1 text-gray-label transition hover:bg-cream hover:text-near-black disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  className="text-sm font-medium text-near-black"
                  htmlFor="dashboard-generate-brand"
                >
                  Brand
                </label>
                <select
                  id="dashboard-generate-brand"
                  value={brandId}
                  disabled={loading}
                  onChange={(event) => setBrandId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-near-black"
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="text-sm font-medium text-near-black"
                  htmlFor="dashboard-generate-platform"
                >
                  Platform
                </label>
                <select
                  id="dashboard-generate-platform"
                  value={platform}
                  disabled={loading}
                  onChange={(event) => setPlatform(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-near-black"
                >
                  {GENERATE_PLATFORMS.map((item) => (
                    <option key={item} value={item}>
                      {generatePlatformLabel(item)}
                    </option>
                  ))}
                </select>
              </div>

              {message ? <p className="text-sm text-gray-body">{message}</p> : null}

              <div className="flex flex-wrap gap-2 pt-1">
                <TextureButton
                  type="button"
                  variant="primary"
                  size="default"
                  disabled={loading || !brandId}
                  onClick={() => void handleGenerate()}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {loading ? "Generating…" : `Generate ${generateMax}`}
                </TextureButton>
                {brandId ? (
                  <TextureButton asChild variant="secondary" size="default">
                    <Link href={`/brands/${brandId}`} onClick={closeModal}>
                      Open brand page
                    </Link>
                  </TextureButton>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
