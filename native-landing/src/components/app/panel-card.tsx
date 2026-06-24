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
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
      <div className="border-b border-black/[0.06] px-4 py-4 sm:px-6 sm:py-5">
        <div
          className={cn(
            "flex flex-col gap-4",
            action && "lg:flex-row lg:items-start lg:justify-between",
          )}
        >
          <div className="min-w-0">
            <h2 className="font-playfair text-xl italic text-near-black">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-gray-body">{description}</p>
            ) : null}
          </div>
          {action ? (
            <div className="w-full shrink-0 lg:max-w-md lg:self-start">{action}</div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-6">{children}</div>
    </section>
  );
}
