"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, KeyRound, Loader2, Trash2 } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";
import { CADENCE_SETTINGS_URL } from "@/lib/growth-stack";
import { MCP_SETUP_STEPS } from "@/lib/mcp";
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
  const [creating, setCreating] = useState<"assistant" | "cadence" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<"key" | "mcp" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mcpUrl, setMcpUrl] = useState("/api/mcp");

  useEffect(() => {
    setMcpUrl(`${window.location.origin}/api/mcp`);
  }, []);

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

  async function createKey(name: "Assistant" | "Cadence") {
    setCreating(name === "Assistant" ? "assistant" : "cadence");
    setError(null);
    setCopied(null);
    try {
      const response = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
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
      setCreating(null);
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
    setCopied("key");
    window.setTimeout(() => setCopied(null), 2000);
  }

  async function copyMcpUrl() {
    await navigator.clipboard.writeText(mcpUrl);
    setCopied("mcp");
    window.setTimeout(() => setCopied(null), 2000);
  }

  const busy = creating !== null || loading;
  const setupSteps = useMemo(() => MCP_SETUP_STEPS, []);

  return (
    <PanelCard
      title="API keys & AI assistants"
      description="One address for Claude or ChatGPT, plus keys for Cadence and other partners."
      action={
        <div className="flex flex-wrap gap-2">
          <TextureButton
            type="button"
            variant="primary"
            size="sm"
            disabled={busy}
            onClick={() => void createKey("Assistant")}
          >
            {creating === "assistant" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="mr-2 h-4 w-4" />
            )}
            Create assistant key
          </TextureButton>
          <TextureButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void createKey("Cadence")}
          >
            {creating === "cadence" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="mr-2 h-4 w-4" />
            )}
            Create Cadence key
          </TextureButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-black/[0.08] bg-cream/50 p-4">
          <p className="text-sm font-medium text-near-black">Remote MCP URL</p>
          <p className="mt-1 text-xs text-gray-body">
            Add this address to Claude (Custom connector) or ChatGPT remote MCP. Authenticate with{" "}
            <code className="rounded bg-white px-1 py-0.5 text-[11px]">
              Authorization: Bearer ks_live_…
            </code>
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="block min-w-0 flex-1 truncate rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-xs text-near-black">
              {mcpUrl}
            </code>
            <TextureButton type="button" variant="secondary" size="sm" onClick={() => void copyMcpUrl()}>
              <Copy className="mr-2 h-4 w-4" />
              {copied === "mcp" ? "Copied" : "Copy URL"}
            </TextureButton>
          </div>
          <ol className="mt-3 list-decimal space-y-1 pl-4 text-xs text-gray-body">
            {setupSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <p className="text-sm text-gray-body">
          Keys start with <code className="rounded bg-cream px-1.5 py-0.5 text-xs">ks_live_</code>.
          Use an Assistant key in Claude/ChatGPT, or paste a Cadence key into{" "}
          <a
            href={CADENCE_SETTINGS_URL}
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
                {copied === "key" ? "Copied" : "Copy"}
              </TextureButton>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-gray-body">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading keys…
          </p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-gray-body">
            No active keys yet. Create an assistant key for Claude/ChatGPT, or a Cadence key for the
            growth stack.
          </p>
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
