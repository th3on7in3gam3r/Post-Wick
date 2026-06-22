import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
          color: "#F0F0F0",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontStyle: "italic",
            marginBottom: 16,
          }}
        >
          Post-Wick
        </div>
        <div style={{ fontSize: 24, color: "#666666" }}>
          Social media on autopilot
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
