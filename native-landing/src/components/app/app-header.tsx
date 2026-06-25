import type { ReactNode } from "react";
import { AppHeaderActions } from "@/components/app/app-header-actions";
import { cn } from "@/lib/utils";

export function AppHeader({
  title,
  description,
  action,
  clientHero = false,
  leading,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  clientHero?: boolean;
  leading?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b border-black/[0.06] bg-cream/80 px-6 py-4 backdrop-blur-sm md:px-8">
      <div className="min-w-0">
        {leading ?? (
          <>
            <h1
              className={cn(
                "truncate text-near-black",
                clientHero ? "text-lg font-semibold" : "font-playfair text-2xl italic",
              )}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  "mt-1 line-clamp-2 text-sm",
                  clientHero ? "text-gray-label" : "text-gray-body",
                )}
              >
                {description}
              </p>
            ) : null}
          </>
        )}
      </div>
      <AppHeaderActions action={action} />
    </header>
  );
}
