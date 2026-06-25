import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

const GENERATED_FILENAME = /^[0-9a-f-]{36}\.png$/i;

async function findBlobUrl(filename: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) return null;

  const pathname = `generated/${filename}`;
  const { blobs } = await list({ prefix: pathname, token });
  const match = blobs.find((blob) => blob.pathname === pathname);
  return match?.url ?? null;
}

async function readLocalGenerated(filename: string) {
  const filePath = join(process.cwd(), "public", "generated", filename);
  return readFile(filePath);
}

async function readBlobBytes(blobUrl: string) {
  const response = await fetch(blobUrl);
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

export async function GET(
  _req: Request,
  { params }: { params: { filename: string } },
) {
  const filename = params.filename;
  if (!GENERATED_FILENAME.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const blobUrl = await findBlobUrl(filename);
    if (blobUrl) {
      const buffer = await readBlobBytes(blobUrl);
      if (buffer) {
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }
  } catch {
    // Fall through to local dev files.
  }

  try {
    const buffer = await readLocalGenerated(filename);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
