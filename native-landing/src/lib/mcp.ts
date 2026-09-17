import { siteUrl } from "@/lib/brand";

/** Remote MCP endpoint for Claude / ChatGPT custom connectors. */
export function mcpServerUrl(origin = siteUrl()) {
  return `${origin.replace(/\/+$/, "")}/api/mcp`;
}

export const MCP_SETUP_STEPS = [
  "Create an API key in Kerygma Social Settings (starts with ks_live_).",
  "In Claude: Settings → Connectors → Add custom connector → paste the MCP URL.",
  "Authenticate with Authorization: Bearer ks_live_… (your full API key).",
  "In ChatGPT: add a remote MCP / custom action connector with the same URL and Bearer key when supported.",
  "Ask the assistant to list brands, draft posts, approve to schedule, or check the calendar.",
] as const;
