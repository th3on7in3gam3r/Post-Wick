"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, Loader2, Trash2 } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";
import { CADENCE_URL } from "@/lib/growth-stack";
import { cn } from "@/lib/utils";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/settings/api-keys");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Failed to load keys");
      }
      setKeys(Array.isArray(data.keys) ? data.keys : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  async function createKey() {
    setCreating(true);
    setError(null);
    setCopied(false);
    try {
      const response = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Cadence" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not create API key",
        );
      }
      setRawKey(typeof data.rawKey === "string" ? data.rawKey : null);
      setNotice(
        typeof data.notice === "string"
          ? data.notice
          : "Copy this key now — it won’t be shown again.",
      );
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create API key");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    setError(null);
    try {
      const response = await fetch("/api/settings/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not revoke key");
      }
      if (rawKey) setRawKey(null);
      await loadKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke key");
    }
  }

  async function copyRawKey() {
    if (!rawKey) return;
    await navigator.clipboard.writeText(rawKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <PanelCard
      title="API keys"
      description="Generate a key to paste into Cadence → Settings → Growth stack API keys → Kerygma Social."
      action={
        <TextureButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={creating || loading}
          onClick={() => void createKey()}
        >
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
          Create key
        </TextureButton>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-body">
          Keys start with <code className="rounded bg-cream px-1.5 py-0.5 text-xs">ks_live_</code>.
          Paste the full key into{" "}
          <a
            href={`${CADENCE_URL}/app/settings`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold hover:underline"
          >
            Cadence Settings
          </a>
          .
        </p>

        {rawKey ? (
          <div className="rounded-xl border border-gold/30 bg-gold/[0.06] p-4">
            <p className="text-sm font-medium text-near-black">Your new API key</p>
            {notice ? <p className="mt-1 text-xs text-gray-body">{notice}</p> : null}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="block min-w-0 flex-1 truncate rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-xs text-near-black">
                {rawKey}
              </code>
              <TextureButton type="button" variant="primary" size="sm" onClick={() => void copyRawKey()}>
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </TextureButton>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-gray-body">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading keys…
          </p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-gray-body">No active keys yet. Create one for Cadence.</p>
        ) : (
          <ul className="space-y-2">
            {keys.map((key) => (
              <li
                key={key.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-cream/40 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-near-black">
                    {key.name}{" "}
                    <span className="font-normal text-gray-label">· {key.keyPrefix}…</span>
                  </p>
                  <p className="text-xs text-gray-label">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt
                      ? ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                      : " · Never used"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void revokeKey(key.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium",
                    "text-red-700 transition hover:bg-red-50",
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </PanelCard>
  );
}
