import { comparisonProPriceLabel, plans } from "@/lib/pricing";

const before = [
  "You create all content yourself",
  "You plan and schedule every post manually",
  "You need to master every platform's algorithm",
  "Requires a dedicated marketing hire or agency",
  "High cost with unpredictable results",
  "Time-consuming and pulls focus from your business",
];

const after = [
  "AI creates tailored content for your brand",
  "Automatic scheduling and posting across all platforms",
  "Platform-optimized content for maximum reach",
  "No need for a marketing team or agency",
  "One affordable price, consistent results",
  "Runs on autopilot, you focus on your business",
];

export function Comparison() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1000px] text-center">
        <h2 className="font-playfair text-[clamp(1.75rem,3.5vw,2.75rem)] italic leading-snug text-near-black">
          Traditional marketing is a full-time job
          <br />
          <span className="text-gold">Kerygma Social does it for you</span>
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-cream-dark p-8 text-left">
            <p className="step-label">Before</p>
            <h3 className="mt-2 font-playfair text-xl italic">Traditional social media</h3>
            <ul className="mt-6 space-y-3">
              {before.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-body">
                  <span className="text-gray-label">✕</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-panel-bg p-8 text-left ring-1 ring-gold/30">
            <p className="step-label">After</p>
            <h3 className="mt-2 font-playfair text-xl italic text-gold">With Kerygma Social</h3>
            <ul className="mt-6 space-y-3">
              {after.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-gray-body">
                  <span className="text-gold">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const rows = [
  { label: "Monthly cost", native: comparisonProPriceLabel, agency: "$1.5–5k+", employee: "$4.5–6k" },
  { label: "Time to start", native: "2 minutes", agency: "2–4 weeks", employee: "2–3 months" },
  { label: "Administration", native: "None", agency: "Meetings, email, approvals", employee: "Follow-up, 1:1, HR" },
  { label: "Commitment", native: "None", agency: "3–6 months", employee: "Notice period" },
];

export function ComparisonTable() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="relative overflow-hidden rounded-3xl border border-black/[0.06] shadow-[0_16px_48px_rgba(61,90,69,0.12)]">
          <div
            className="absolute inset-0 bg-cover bg-[50%_42%] bg-no-repeat"
            style={{ backgroundImage: "url('/images/comparison-autopilot-watercolor.png')" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[#F2EBD9]/15" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F2EBD9]/35 via-[#F2EBD9]/10 to-[#F2EBD9]/88" />

          <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
            <h2 className="text-center font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
              All your marketing, on autopilot
            </h2>
            <p className="body-copy mt-3 text-center">
              See how Kerygma Social compares to the alternatives
            </p>

            <div className="mt-12 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/95 shadow-card backdrop-blur-sm">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-[#eee]">
                    <th className="p-4 text-left font-medium text-gray-label" />
                    <th className="p-4 text-left font-playfair text-lg italic text-gold">
                      Kerygma Social
                    </th>
                    <th className="p-4 text-left font-medium text-near-black">Agency</th>
                    <th className="p-4 text-left font-medium text-near-black">Employee</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b border-[#eee] last:border-0">
                      <td className="p-4 font-medium text-near-black">{row.label}</td>
                      <td className="p-4 font-medium text-gold">{row.native}</td>
                      <td className="p-4 text-gray-body">{row.agency}</td>
                      <td className="p-4 text-gray-body">{row.employee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-center text-xs text-gray-label">
              {comparisonProPriceLabel} on Pro, billed yearly (${plans.pro.monthly}/mo on
              monthly billing). Agency prices typically include retainer and project costs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
