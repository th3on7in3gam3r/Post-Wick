import { UserButton } from "@clerk/nextjs";

export function Header({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-brand-border px-6">
      <h1 className="font-serif text-2xl italic text-brand-text">{title}</h1>
      <UserButton />
    </header>
  );
}
