import { MarketingShell } from "@/components/marketing-shell";
import { McpExplainer } from "@/components/integrations/mcp-explainer";
import { SITE_NAME } from "@/lib/brand";
import { mcpServerUrl } from "@/lib/mcp";
import { createPageMetadata } from "@/lib/metadata";

const title = `MCP for Claude & ChatGPT | ${SITE_NAME}`;
const description =
  "Run your social media by talking to your assistant. Add one MCP address to Claude or ChatGPT — read your brand, write posts, and schedule them inside Kerygma Social.";

export const metadata = createPageMetadata({
  title: { absolute: title },
  description,
  ogTitle: title,
  ogDescription: description,
  path: "/integrations/mcp",
});

export default function McpIntegrationsPage() {
  return (
    <MarketingShell wide heroBackground>
      <McpExplainer mcpUrl={mcpServerUrl()} />
    </MarketingShell>
  );
}
