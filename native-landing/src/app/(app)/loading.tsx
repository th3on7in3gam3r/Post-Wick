import { BrandLoader } from "@/components/ui/brand-loader";

export default function AppSegmentLoading() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-cream px-6">
      <BrandLoader label="Loading your workspace…" size="lg" />
    </div>
  );
}
