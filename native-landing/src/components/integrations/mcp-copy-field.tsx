"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function McpCopyField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("mt-4", className)}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gray-label">
        {label}
      </p>
      <div className="mt-2 flex items-stretch gap-2 rounded-xl border border-black/[0.08] bg-white p-1.5 shadow-sm">
        <code className="min-w-0 flex-1 truncate px-3 py-2.5 text-xs text-near-black sm:text-sm">
          {value}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-cream px-3 py-2 text-xs font-medium text-near-black transition hover:bg-cream-dark"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-sage" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
