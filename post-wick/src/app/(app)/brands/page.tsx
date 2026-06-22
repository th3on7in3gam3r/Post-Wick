import Link from "next/link";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";

export default function BrandsPage() {
  return (
    <>
      <Header title="Brands" />
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-brand-muted">Manage your brand workspaces</p>
          <Link href="/brands/new">
            <Button>Add brand</Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-serif text-2xl italic text-brand-muted">
            No brands yet
          </p>
          <p className="mt-2 text-sm text-brand-muted">
            Add your first brand to start generating content.
          </p>
          <Link href="/brands/new" className="mt-6">
            <Button>Add your first brand</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
