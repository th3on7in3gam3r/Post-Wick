import type { ReactNode } from "react";
import { AppHeaderActions } from "@/components/app/app-header-actions";

export function AppHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-black/[0.06] bg-cream/80 px-6 py-4 backdrop-blur-sm md:px-8">
      <div className="min-w-0">
        <h1 className="truncate font-playfair text-2xl italic text-near-black">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-gray-body">{description}</p>
        ) : null}
      </div>
      <AppHeaderActions action={action} />
    </header>
  );
}
