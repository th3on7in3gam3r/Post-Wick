export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-playfair text-xl italic text-near-black">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
