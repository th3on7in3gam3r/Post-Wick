import Link from "next/link";
import { TextureButton } from "@/components/ui/texture-button";
import { postwickBaseUrl } from "@/lib/directory/public-brands";

function postwickPromoHref() {
  return postwickBaseUrl() ?? "https://postwick.kerygmasocial.com";
}

export function PostwickPromoSection() {
  return (
    <section className="bg-cream px-6 py-16 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card md:flex-row md:items-center md:p-10">
          <div className="max-w-xl">
            <p className="step-label">New</p>
            <h2 className="mt-2 font-playfair text-[clamp(1.75rem,3vw,2.25rem)] italic text-near-black">
              Discover Postwick
            </h2>
            <p className="body-copy mt-3">
              The public posts network for brands — a sister product to Kerygma Social
              where your published work can find a wider audience.
            </p>
          </div>
          <TextureButton asChild variant="accent" size="lg" className="shrink-0">
            <Link href={postwickPromoHref()} target="_blank" rel="noopener noreferrer">
              Visit Postwick →
            </Link>
          </TextureButton>
        </div>
      </div>
    </section>
  );
}
