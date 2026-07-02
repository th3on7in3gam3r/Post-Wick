"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Building2, Loader2 } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { signInHref } from "@/lib/auth-routes";

type AgencyRegisterClientProps = {
  defaultEmail?: string | null;
};

export function AgencyRegisterClient({ defaultEmail }: AgencyRegisterClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState(defaultEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/agency/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contactEmail: contactEmail.trim() || null,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not register agency");
      }

      router.push("/agency/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register agency");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-card">
          <Building2 className="h-6 w-6 text-gold" />
        </div>
        <h1 className="font-playfair text-4xl italic text-near-black sm:text-5xl">
          Agency partner program
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-gray-body">
          Register your agency, get a referral link, and track clients who sign up through you.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-5 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card sm:p-8"
      >
        <div>
          <label htmlFor="agency-name" className="block text-sm font-medium text-near-black">
            Agency name
          </label>
          <input
            id="agency-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={120}
            placeholder="Acme Marketing Co."
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-near-black outline-none ring-gold/30 transition focus:border-gold/40 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="agency-email" className="block text-sm font-medium text-near-black">
            Contact email
          </label>
          <input
            id="agency-email"
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="you@agency.com"
            className="mt-2 w-full rounded-xl border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm text-near-black outline-none ring-gold/30 transition focus:border-gold/40 focus:ring-2"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <TextureButton
          type="submit"
          variant="accent"
          className="w-full"
          disabled={submitting || !name.trim()}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating agency…
            </>
          ) : (
            "Create agency account"
          )}
        </TextureButton>
      </form>
    </div>
  );
}

export function AgencyRegisterGuest() {
  return (
    <div className="mx-auto max-w-[640px] text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-card">
        <Building2 className="h-6 w-6 text-gold" />
      </div>
      <h1 className="font-playfair text-4xl italic text-near-black sm:text-5xl">
        Agency partner program
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-gray-body">
        Sign in to register your agency and start referring clients to Kerygma Social.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <TextureButton asChild variant="accent">
          <Link href={signInHref({ redirectPath: "/agency/register" })}>Sign in to register</Link>
        </TextureButton>
        <TextureButton asChild variant="secondary">
          <Link href="/sign-up?redirect_url=/agency/register">Create account</Link>
        </TextureButton>
      </div>
    </div>
  );
}
