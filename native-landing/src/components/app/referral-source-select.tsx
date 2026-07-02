"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { REFERRAL_SOURCES } from "@/lib/onboarding/referral-sources";
import { cn } from "@/lib/utils";

export function ReferralSourceSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    REFERRAL_SOURCES.find((item) => item.value === value)?.label ?? "Select one…";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id="referral-source"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3 text-left text-sm transition",
          "outline-none ring-gold/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
          value ? "text-near-black" : "text-gray-label",
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-gray-label transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-card"
          role="listbox"
          aria-label="Where did you hear about us?"
        >
          <div className="border-b border-black/[0.06] px-3 py-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
              Where did you hear about us?
            </p>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {REFERRAL_SOURCES.map((item) => {
              const selected = item.value === value;
              return (
                <li key={item.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition",
                      selected ? "bg-cream/80 text-near-black" : "text-gray-body hover:bg-cream/50",
                    )}
                  >
                    <span>{item.label}</span>
                    {selected ? <Check className="h-4 w-4 shrink-0 text-gold" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
