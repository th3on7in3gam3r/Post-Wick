import { cn } from "@/lib/utils";

export function PanelCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-black/[0.06] bg-white shadow-card">
      <div className="border-b border-black/[0.06] px-4 py-4 sm:px-6 sm:py-5">
        <div
          className={cn(
            "flex flex-col gap-3",
            action && "sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4",
          )}
        >
          <div className="min-w-0 flex-1">
            <h2 className="overflow-visible font-playfair text-xl italic leading-snug text-near-black">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-gray-body">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6">{children}</div>
    </section>
  );
}
