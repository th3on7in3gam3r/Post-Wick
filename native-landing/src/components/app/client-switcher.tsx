"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useActiveClient } from "@/components/app/client-context";
import { clientInitials } from "@/lib/clients";
import { cn } from "@/lib/utils";

function ClientAvatar({
  name,
  logoUrl,
  size = "md",
}: {
  name: string;
  logoUrl: string | null;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-7 w-7 text-[0.6rem]" : "h-8 w-8 text-xs";

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", sizeClass)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-cream font-semibold text-gold",
        sizeClass,
      )}
      aria-hidden
    >
      {clientInitials(name)}
    </div>
  );
}

export function ClientSwitcher({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "sidebar";
}) {
  const { clients, activeClient, setActiveClientId } = useActiveClient();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasClients = clients.length > 0;
  const isSidebar = tone === "sidebar";

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

  if (!hasClients) {
    return (
      <Link
        href="/onboarding?add=1"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-dashed px-3 py-2.5 text-sm font-medium transition",
          isSidebar
            ? "border-gold/40 bg-cream text-gold hover:bg-cream-dark"
            : "border-gold/40 bg-cream/60 text-gold hover:bg-cream",
          className,
        )}
      >
        <Plus className="h-4 w-4 shrink-0" />
        Add your first client
      </Link>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
          isSidebar
            ? "border-white/10 bg-white/10 hover:border-white/20 hover:bg-white/15"
            : "border-black/[0.06] bg-cream/60 hover:border-gold/30 hover:bg-cream",
        )}
      >
        <ClientAvatar name={activeClient.name} logoUrl={activeClient.logoUrl} />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm font-medium",
              isSidebar ? "text-cream" : "text-near-black",
            )}
          >
            {activeClient.name}
          </span>
          <span
            className={cn(
              "block truncate text-[0.65rem]",
              isSidebar ? "text-cream/60" : "text-gray-label",
            )}
          >
            {activeClient.industry}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition",
            isSidebar ? "text-cream/60" : "text-gray-label",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-card"
          role="listbox"
          aria-label="Switch client"
        >
          <div className="border-b border-black/[0.06] px-3 py-2">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
              Your clients
            </p>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {clients.map((client) => {
              const selected = client.id === activeClient.id;
              return (
                <li key={client.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setActiveClientId(client.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition",
                      selected ? "bg-cream/80" : "hover:bg-cream/50",
                    )}
                  >
                    <ClientAvatar name={client.name} logoUrl={client.logoUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-near-black">
                        {client.name}
                      </span>
                      <span className="block truncate text-xs text-gray-label">
                        {client.industry}
                      </span>
                    </span>
                    {selected ? <Check className="h-4 w-4 shrink-0 text-gold" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-black/[0.06] p-2">
            <Link
              href="/onboarding?add=1"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gold transition hover:bg-cream/70"
            >
              <Plus className="h-4 w-4" />
              Add new client +
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
