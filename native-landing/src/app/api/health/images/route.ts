import { NextResponse } from "next/server";
import {
  getImageGenerationProviders,
  getImageProviderCircuitHealth,
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
        ? "No image API keys found. Add OPENAI_API_KEY (and optionally GEMINI_API_KEY / IDEOGRAM_API_KEY) in Vercel env vars, then redeploy."
        : "No image API keys found in environment.",
    );
  }

  const needsBlob = providers.openai || providers.gemini;
  if (needsBlob && onVercel && !providers.blob) {
    warnings.push(
      "OPENAI_API_KEY or GEMINI_API_KEY is set but BLOB_READ_WRITE_TOKEN is missing. Create a Blob store in Vercel Storage so generated images can be saved.",
    );
  }

  if (providers.ideogram && !providers.openai && !providers.gemini) {
    warnings.push(
      "Only Ideogram is configured. Add OPENAI_API_KEY or GEMINI_API_KEY as primary providers.",
    );
  }

  const probe = runProbe ? await probeImageProviders() : null;

  if (probe?.openai?.configured && !probe.openai.ok) {
    warnings.push(
      `OpenAI key is set but rejected the API (${probe.openai.status}: ${probe.openai.message}).`,
    );
  }

  if (probe?.gemini?.configured && !probe.gemini.ok) {
    warnings.push(
      `Gemini key is set but rejected the API (${probe.gemini.status}: ${probe.gemini.message}). Create a key at aistudio.google.com.`,
    );
  }

  if (probe?.ideogram?.configured && !probe.ideogram.ok) {
    warnings.push(
      `Ideogram key is set but rejected the API (${probe.ideogram.status}: ${probe.ideogram.message}). Generate a new key at ideogram.ai.`,
    );
  }

  const ok =
    isImageGenerationConfigured() &&
    (!probe ||
      Boolean(
        (probe.openai?.ok ?? false) ||
          (probe.gemini?.ok ?? false) ||
          (probe.ideogram?.ok ?? false),
      ));

  return NextResponse.json({
    ok,
    order: ["openai", "gemini", "ideogram"],
    onVercel,
    providers,
    circuits: getImageProviderCircuitHealth(),
    warnings,
    probe,
    probeHint: runProbe
      ? null
      : "Add ?probe=1 to test API keys (Ideogram probe uses a small amount of credits).",
  });
}
