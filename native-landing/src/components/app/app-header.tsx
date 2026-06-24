import { UserButton } from "@clerk/nextjs";

export function AppHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] bg-cream/80 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5 md:px-8">
      <div className="min-w-0">
        <h1 className="truncate font-playfair text-[clamp(1.35rem,3vw,2rem)] italic text-near-black">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-gray-body">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">
      <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
      </div>
    </header>
  );
}
