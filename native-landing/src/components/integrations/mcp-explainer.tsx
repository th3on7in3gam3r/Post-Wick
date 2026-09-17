import Link from "next/link";
import { TextureButton } from "@/components/ui/texture-button";
import { McpCopyField } from "@/components/integrations/mcp-copy-field";
import { McpSayPrompts } from "@/components/integrations/mcp-say-prompts";
import { McpCapabilitySandboxes } from "@/components/integrations/mcp-capability-sandboxes";
import { McpUnlockSandboxes } from "@/components/integrations/mcp-unlock-sandboxes";
import { SITE_NAME } from "@/lib/brand";

const FAQS = [
  {
    q: "What is MCP, in plain words?",
    a: "An open standard that lets an AI assistant use real tools instead of only talking. Think of it as a socket: Kerygma Social exposes one, your assistant plugs in, and it can work in your account rather than only tell you how.",
  },
  {
    q: "Which assistants can I use?",
    a: "Claude (Desktop and web custom connectors) and ChatGPT remote MCP / connectors when your account supports them. Claude Code can also add the same HTTP endpoint.",
  },
  {
    q: "Do I need an API key?",
    a: "Yes. Create a ks_live_ key in Kerygma Settings, then authenticate with Authorization: Bearer ks_live_…. The MCP URL alone is not enough.",
  },
  {
    q: "Do I need to be a developer?",
    a: "No. Copy the URL, create a key in Settings, paste both into your assistant’s connector settings, and talk normally.",
  },
  {
    q: "Can it post something without asking me?",
    a: "New drafts start as pending. Approving schedules them. Publishing still needs social accounts connected in Kerygma — the assistant cannot skip that step.",
  },
  {
    q: "Can it reach my other brands, or anyone else’s?",
    a: "Only brands on the account tied to your API key. It cannot see other customers’ data.",
  },
  {
    q: "Can I disconnect it?",
    a: "Yes. Revoke the API key in Settings, or remove the custom connector from Claude / ChatGPT.",
  },
  {
    q: "What does it cost?",
    a: "MCP uses your existing Kerygma plan limits for generation and weekly scheduling. There is no separate MCP fee.",
  },
] as const;

export function McpExplainer({ mcpUrl }: { mcpUrl: string }) {
  return (
    <div className="space-y-24 pb-8">
      <header className="mx-auto max-w-3xl pt-6 text-center md:pt-10">
        <p className="step-label">New · Claude &amp; ChatGPT</p>
        <h1 className="mt-4 font-playfair text-[clamp(2.25rem,5vw,3.5rem)] italic leading-[1.15] text-near-black">
          Run your social media by talking to your assistant.
        </h1>
        <p className="body-copy mx-auto mt-5 max-w-2xl text-base md:text-lg">
          Add one address to Claude or ChatGPT, and the assistant you already use can
          work inside {SITE_NAME}: read your brand, write posts, and schedule them.
        </p>
      </header>

      <section>
        <h2 className="text-center font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          What MCP unlocks in {SITE_NAME}
        </h2>
        <McpUnlockSandboxes />
      </section>

      <section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
            What it can do
          </h2>
          <p className="body-copy mt-3">
            The same workflow you use in the app — available as tools inside your assistant.
          </p>
        </div>
        <McpCapabilitySandboxes />
      </section>

      <section className="text-center">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Things you could just say
        </h2>
        <p className="body-copy mx-auto mt-3 max-w-xl">
          No syntax to learn. You talk, and the work happens in {SITE_NAME}.
        </p>
        <McpSayPrompts />
      </section>

      <section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
            Connecting it
          </h2>
          <p className="body-copy mt-3">
            One address, added once. Create a key in Settings, then paste both into your
            assistant. It takes about a minute.
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card">
            <p className="text-sm font-semibold text-near-black">Claude Desktop and web</p>
            <p className="body-copy mt-2 text-sm">
              Settings → Connectors → Add custom connector. Name it {SITE_NAME} and paste
              this address. Authenticate with{" "}
              <code className="rounded bg-cream px-1 text-xs">Bearer ks_live_…</code>
            </p>
            <McpCopyField label="URL" value={mcpUrl} />
          </article>
          <article className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card">
            <p className="text-sm font-semibold text-near-black">ChatGPT Connectors</p>
            <p className="body-copy mt-2 text-sm">
              Add a remote MCP server with the same address and Bearer API key when your
              ChatGPT account supports connectors.
            </p>
            <McpCopyField label="URL" value={mcpUrl} />
          </article>
          <article className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card">
            <p className="text-sm font-semibold text-near-black">Claude Code CLI and IDE</p>
            <p className="body-copy mt-2 text-sm">One line in your terminal:</p>
            <McpCopyField
              label="BASH"
              value={`claude mcp add --transport http kerygma ${mcpUrl}`}
            />
          </article>
        </div>
        <p className="body-copy mx-auto mt-6 max-w-2xl text-center text-sm">
          Create or revoke keys anytime in{" "}
          <Link href="/sign-in" className="font-medium text-gold underline-offset-2 hover:underline">
            Settings → API keys
          </Link>{" "}
          after you sign in.
        </p>
      </section>

      <section>
        <h2 className="text-center font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Questions about MCP
        </h2>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-black/[0.06] bg-white p-5 shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-playfair text-lg italic text-near-black [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="mt-1 text-sm text-gray-label transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="body-copy mt-3 text-sm">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="text-center">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          More integrations
        </h2>
        <p className="body-copy mt-3">{SITE_NAME} plugs into the tools you already use.</p>
        <p className="mt-8 font-playfair text-xl italic text-gray-label">coming soon...</p>
      </section>

      <section className="rounded-3xl border border-black/[0.06] bg-white px-6 py-12 text-center shadow-card md:px-10">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Start today. MCP is ready when you are.
        </h2>
        <p className="body-copy mx-auto mt-3 max-w-xl">
          Drop in your website and see real posts for your own brand — then connect Claude
          or ChatGPT from Settings.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <TextureButton asChild variant="accent" size="lg">
            <Link href="/get-started">Get started →</Link>
          </TextureButton>
          <TextureButton asChild variant="secondary" size="lg">
            <Link href="/pricing">See pricing</Link>
          </TextureButton>
        </div>
        <p className="mt-4 text-sm italic text-gray-label">Free to try. No card needed.</p>
      </section>
    </div>
  );
}
