import { Bookmark, Heart, MessageCircle, Repeat2, Send, Share2, ThumbsUp } from "lucide-react";
import { resolvePostImageUrl } from "@/lib/posts/image-url";
import { cn } from "@/lib/utils";

type PlatformPostPreviewProps = {
  platform: string;
  content: string;
  imageUrl?: string | null;
  accountName: string;
  accountAvatarUrl?: string | null;
  accountInitials?: string;
  className?: string;
};

function PreviewAvatar({
  name,
  logoUrl,
  initials,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  initials?: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className={cn("shrink-0 rounded-full object-cover", className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-cream text-xs font-semibold text-gold",
        className,
      )}
      aria-hidden
    >
      {initials ?? name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function PreviewImage({
  src,
  aspectClass,
  roundedClass = "rounded-none",
}: {
  src: string;
  aspectClass: string;
  roundedClass?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn("w-full border-y border-black/[0.06] object-cover", aspectClass, roundedClass)}
      referrerPolicy="no-referrer"
    />
  );
}

function NoImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-square w-full items-center justify-center border-y border-dashed border-black/[0.08] bg-cream/60 px-6 text-center text-xs text-gray-label">
      {label}
    </div>
  );
}

function ProfileRow({
  accountName,
  accountAvatarUrl,
  accountInitials,
  platformLabel,
  meta,
}: {
  accountName: string;
  accountAvatarUrl?: string | null;
  accountInitials?: string;
  platformLabel: string;
  meta?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <PreviewAvatar
        name={accountName}
        logoUrl={accountAvatarUrl}
        initials={accountInitials}
        className="h-10 w-10"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-near-black">{accountName}</p>
        <p className="truncate text-xs text-gray-label">
          {meta ?? platformLabel}
        </p>
      </div>
    </div>
  );
}

export function PlatformPostPreview({
  platform,
  content,
  imageUrl,
  accountName,
  accountAvatarUrl,
  accountInitials,
  className,
}: PlatformPostPreviewProps) {
  const normalized = platform.toLowerCase();
  const imageSrc = resolvePostImageUrl(imageUrl, { display: true });
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  if (normalized === "instagram") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card",
          className,
        )}
      >
        <ProfileRow
          accountName={accountName}
          accountAvatarUrl={accountAvatarUrl}
          accountInitials={accountInitials}
          platformLabel="Instagram"
          meta="Just now"
        />
        {imageSrc ? (
          <PreviewImage src={imageSrc} aspectClass="aspect-square" />
        ) : (
          <NoImagePlaceholder label="Instagram posts need an image" />
        )}
        <div className="flex items-center gap-4 px-4 py-3 text-near-black">
          <Heart className="h-5 w-5" />
          <MessageCircle className="h-5 w-5" />
          <Send className="h-5 w-5" />
          <Bookmark className="ml-auto h-5 w-5" />
        </div>
        <p className="px-4 pb-4 text-sm leading-relaxed text-near-black">
          <span className="font-semibold">{accountName}</span> {content}
        </p>
      </article>
    );
  }

  if (normalized === "facebook") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card",
          className,
        )}
      >
        <ProfileRow
          accountName={accountName}
          accountAvatarUrl={accountAvatarUrl}
          accountInitials={accountInitials}
          platformLabel="Facebook Page"
          meta="Just now · 🌐"
        />
        <p className="px-4 pb-3 text-sm leading-relaxed text-near-black">{content}</p>
        {imageSrc ? (
          <PreviewImage src={imageSrc} aspectClass="aspect-[4/3]" />
        ) : null}
        <div className="flex items-center justify-around border-t border-black/[0.06] px-2 py-2 text-xs font-medium text-gray-body">
          <span className="inline-flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4" /> Like
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" /> Comment
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Share2 className="h-4 w-4" /> Share
          </span>
        </div>
      </article>
    );
  }

  if (normalized === "linkedin") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card",
          className,
        )}
      >
        <ProfileRow
          accountName={accountName}
          accountAvatarUrl={accountAvatarUrl}
          accountInitials={accountInitials}
          platformLabel="LinkedIn"
          meta="Company · Just now"
        />
        <p className="px-4 pb-3 text-sm leading-relaxed text-near-black">{content}</p>
        {imageSrc ? (
          <PreviewImage src={imageSrc} aspectClass="aspect-[1.91/1]" />
        ) : null}
        <div className="flex items-center gap-4 border-t border-black/[0.06] px-4 py-2 text-xs text-gray-body">
          <span>Like</span>
          <span>Comment</span>
          <span>Repost</span>
          <span>Send</span>
        </div>
      </article>
    );
  }

  if (normalized === "pinterest") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card",
          className,
        )}
      >
        {imageSrc ? (
          <PreviewImage src={imageSrc} aspectClass="aspect-[2/3]" roundedClass="rounded-t-2xl border-y-0" />
        ) : (
          <NoImagePlaceholder label="Pinterest pins need an image" />
        )}
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#BD081C]">
            Pinterest Pin
          </p>
          <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug text-near-black">
            {content}
          </p>
          <p className="mt-2 truncate text-xs text-gray-label">{accountName}</p>
        </div>
      </article>
    );
  }

  if (normalized === "twitter" || normalized === "x") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card",
          className,
        )}
      >
        <div className="flex gap-3 px-4 py-4">
          <PreviewAvatar
            name={accountName}
            logoUrl={accountAvatarUrl}
            initials={accountInitials}
            className="h-10 w-10"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-near-black">
              <span className="font-semibold">{accountName}</span>{" "}
              <span className="text-gray-label">@{(accountName.replace(/\s+/g, "").slice(0, 12) || "brand").toLowerCase()}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-near-black">{content}</p>
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt=""
                className="mt-3 aspect-video w-full rounded-2xl border border-black/[0.06] object-cover"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <div className="mt-3 flex items-center gap-5 text-gray-label">
              <MessageCircle className="h-4 w-4" />
              <Repeat2 className="h-4 w-4" />
              <Heart className="h-4 w-4" />
              <Share2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (normalized === "bluesky") {
    const handle =
      accountName.startsWith("@")
        ? accountName
        : `@${(accountName.replace(/\s+/g, "").slice(0, 24) || "brand").toLowerCase()}`;
    return (
      <article
        className={cn(
          "overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card",
          className,
        )}
      >
        <div className="flex gap-3 px-4 py-4">
          <PreviewAvatar
            name={accountName}
            logoUrl={accountAvatarUrl}
            initials={accountInitials}
            className="h-10 w-10"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-near-black">
              <span className="font-semibold">{accountName.replace(/^@/, "")}</span>{" "}
              <span className="text-gray-label">{handle}</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-near-black">{content}</p>
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt=""
                className="mt-3 aspect-video w-full rounded-2xl border border-black/[0.06] object-cover"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <div className="mt-3 flex items-center gap-5 text-[#1185FE]/80">
              <MessageCircle className="h-4 w-4" />
              <Repeat2 className="h-4 w-4" />
              <Heart className="h-4 w-4" />
              <Share2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card",
        className,
      )}
    >
      <ProfileRow
        accountName={accountName}
        accountAvatarUrl={accountAvatarUrl}
        accountInitials={accountInitials}
        platformLabel={platformLabel}
      />
      {imageSrc ? (
        <PreviewImage src={imageSrc} aspectClass="aspect-square" />
      ) : null}
      <p className="px-4 py-4 text-sm leading-relaxed text-near-black">{content}</p>
    </article>
  );
}
