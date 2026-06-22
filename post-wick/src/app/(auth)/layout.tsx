export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-4 py-12">
      <div className="mb-8 text-center">
        <p className="font-serif text-2xl italic text-brand-text">Post-Wick</p>
        <p className="mt-1 text-sm text-brand-muted">
          Social media on autopilot
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-[420px] justify-center">
        {children}
      </div>
    </div>
  );
}
