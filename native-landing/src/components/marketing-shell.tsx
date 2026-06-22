import { Navbar } from "./navbar";
import { Footer } from "./sections";

export function MarketingShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <Navbar />
      <main className="relative z-0 min-h-screen bg-cream px-6 pb-32 pt-32 md:px-10">
        <div className={`mx-auto ${wide ? "max-w-[1100px]" : "max-w-[720px]"}`}>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
