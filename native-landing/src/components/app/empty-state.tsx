import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-black/[0.1] bg-cream/50 px-6 py-12 text-center">
      <div className="rounded-full bg-white p-3 shadow-card">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <p className="mt-4 font-playfair text-lg italic text-near-black">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-body">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
