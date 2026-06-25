import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { OG_DEFAULT_DESCRIPTION, SITE_TAGLINE } from "@/lib/brand";

export const alt = "Kerygma Social — Social media on autopilot for local businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public/images/kerygma-social-logo.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f0ede4",
          padding: "48px 64px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse requires img */}
        <img
          src={logoSrc}
          width={560}
          height={134}
          alt=""
          style={{ objectFit: "contain" }}
        />
        <p
          style={{
            marginTop: 36,
            fontSize: 30,
            lineHeight: 1.35,
            color: "#6b6b6b",
            textAlign: "center",
            maxWidth: 920,
          }}
        >
          {SITE_TAGLINE}
        </p>
        <p
          style={{
            marginTop: 20,
            fontSize: 22,
            lineHeight: 1.45,
            color: "#999999",
            textAlign: "center",
            maxWidth: 920,
          }}
        >
          {OG_DEFAULT_DESCRIPTION}
        </p>
      </div>
    ),
    size,
  );
}
