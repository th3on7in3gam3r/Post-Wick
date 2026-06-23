import { NextResponse } from "next/server";
import {
  getImageGenerationProviders,
  isImageGenerationConfigured,
  probeImageProviders,
} from "@/lib/ai/images";

export async function GET(req: Request) {
  const providers = getImageGenerationProviders();
  const onVercel = Boolean(process.env.VERCEL);
  const warnings: string[] = [];
  const { searchParams } = new URL(req.url);
  const runProbe = searchParams.get("probe") === "1";

  if (!isImageGenerationConfigured()) {
    warnings.push(
      onVercel
        ? "No image API keys found. Add OPENAI_API_KEY and/or IDEOGRAM_API_KEY in Vercel env vars, then redeploy."
        : "No image API keys found in environment.",
    );
  }

  if (providers.openai && onVercel && !providers.blob) {
    warnings.push(
      "OPENAI_API_KEY is set but BLOB_READ_WRITE_TOKEN is missing. Create a Blob store in Vercel Storage so OpenAI images can be saved.",
    );
  }

  if (providers.ideogram && !providers.openai) {
    warnings.push(
      "Only Ideogram is configured. OpenAI is not set — if Ideogram fails, there is no fallback.",
    );
  }

  const probe = runProbe ? await probeImageProviders() : null;

  if (probe?.ideogram?.configured && !probe.ideogram.ok) {
    warnings.push(
      `Ideogram key is set but rejected the API (${probe.ideogram.status}: ${probe.ideogram.message}). Generate a new key at ideogram.ai.`,
    );
  }

  if (probe?.openai?.configured && !probe.openai.ok) {
    warnings.push(
      `OpenAI key is set but rejected the API (${probe.openai.status}: ${probe.openai.message}).`,
    );
  }

  const ok =
    isImageGenerationConfigured() &&
    (!probe ||
      Boolean(
        (probe.ideogram?.ok ?? false) || (probe.openai?.ok ?? false),
      ));

  return NextResponse.json({
    ok,
    order: ["openai", "ideogram"],
    onVercel,
    providers,
    warnings,
    probe,
    probeHint: runProbe
      ? null
      : "Add ?probe=1 to test API keys (uses a small amount of credits).",
  });
}
