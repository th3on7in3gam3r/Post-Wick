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
      <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-6 py-5">
        <div>
          <h2 className="font-playfair text-xl italic text-near-black">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-gray-body">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="flex flex-1 flex-col p-6">{children}</div>
    </section>
  );
}
