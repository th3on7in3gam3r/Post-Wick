import { NextResponse } from "next/server";
import { getImageGenerationProviders, isImageGenerationConfigured } from "@/lib/ai/images";

export async function GET() {
  const providers = getImageGenerationProviders();
  const onVercel = Boolean(process.env.VERCEL);
  const warnings: string[] = [];

  if (!isImageGenerationConfigured()) {
    warnings.push(
      onVercel
        ? "No image API keys found. Add OPENAI_API_KEY and/or IDEOGRAM_API_KEY in Vercel env vars, then redeploy."
        : "No image API keys found in environment.",
    );
  }

  if (providers.openai && onVercel && !providers.blob) {
    warnings.push(
      "OPENAI_API_KEY is set but BLOB_READ_WRITE_TOKEN is missing. OpenAI gpt-image-1 returns base64 on Vercel — create a Blob store in Vercel Storage, or rely on IDEOGRAM_API_KEY fallback (returns hosted URLs).",
    );
  }

  if (providers.ideogram && !providers.openai) {
    warnings.push("Only Ideogram is configured. OpenAI is not set as primary.");
  }

  return NextResponse.json({
    ok: isImageGenerationConfigured(),
    order: ["openai", "ideogram"],
    onVercel,
    providers,
    warnings,
  });
}
