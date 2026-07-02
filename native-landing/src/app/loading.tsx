import { BrandLoader } from "@/components/ui/brand-loader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <BrandLoader label="Loading…" size="lg" />
    </div>
  );
}
