"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/app/header";
import { BrandForm } from "@/components/brands/brand-form";
import { toast } from "sonner";

export default function NewBrandPage() {
  const router = useRouter();

  async function handleSubmit(data: { name: string; websiteUrl: string }) {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Failed to create brand");
      return;
    }

    const brand = await res.json();
    toast.success("Brand created");
    router.push(`/brands/${brand.id}`);
  }

  return (
    <>
      <Header title="Add brand" />
      <div className="mx-auto max-w-lg flex-1 p-6">
        <BrandForm onSubmit={handleSubmit} />
      </div>
    </>
  );
}
