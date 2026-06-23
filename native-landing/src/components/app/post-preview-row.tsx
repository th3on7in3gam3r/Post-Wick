import { ImageOff } from "lucide-react";
import { resolvePostImageUrl } from "@/lib/posts/image-url";

type PostPreviewRowProps = {
  platform: string;
  meta: string;
  content: string;
  imageUrl?: string | null;
};

export function PostPreviewRow({
  platform,
  meta,
  content,
  imageUrl,
}: PostPreviewRowProps) {
  const src = resolvePostImageUrl(imageUrl);

  return (
    <article className="relative flex gap-3 rounded-xl border border-black/[0.06] bg-cream/50 p-3">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg border border-black/[0.06] object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-black/[0.08] bg-cream/80 text-gray-label"
          aria-hidden
        >
          <ImageOff className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
            {platform}
          </p>
          <p className="shrink-0 text-[11px] text-gray-label">{meta}</p>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-near-black">{content}</p>
      </div>
    </article>
  );
}
