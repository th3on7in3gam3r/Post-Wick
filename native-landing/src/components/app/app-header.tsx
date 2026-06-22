import { UserButton } from "@clerk/nextjs";

export function AppHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-black/[0.06] bg-cream/80 px-6 py-5 backdrop-blur-sm md:px-8">
      <div>
        <h1 className="font-playfair text-[clamp(1.5rem,3vw,2rem)] italic text-near-black">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-gray-body">{description}</p>
        ) : null}
      </div>
      <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
    </header>
  );
}
