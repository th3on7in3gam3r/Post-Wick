import { MarketingHeader } from "@/components/marketing/header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <MarketingHeader />
      <main>{children}</main>
    </div>
  );
}
