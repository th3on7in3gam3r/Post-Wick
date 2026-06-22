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
          <span className="text-gold">Native does it for you</span>
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
            <h3 className="mt-2 font-playfair text-xl italic text-gold">With Native</h3>
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

export function Testimonial() {
  return (
    <section id="about" className="bg-cream-dark px-10 py-24">
      <div className="mx-auto max-w-[800px] text-center">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Social media without the Sunday scramble
        </h2>
        <p className="body-copy mt-3">
          Post-Wick is for owners who&apos;d rather run their business than
          wrestle with captions every week.
        </p>
        <blockquote className="mt-10 font-playfair text-[1.15rem] italic leading-relaxed text-near-black">
          &ldquo;Drop your URL, review the posts, approve what fits — and get
          back to work. That&apos;s the whole idea.&rdquo;
        </blockquote>
        <p className="mt-6 font-semibold text-near-black">
          <a
            href="https://biblefunlandstudio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold"
          >
            Biblefunland Studios
          </a>
        </p>
        <p className="text-sm text-gray-body">
          Built for local shops, studios, and service businesses
        </p>
      </div>
    </section>
  );
}

const rows = [
  { label: "Monthly cost", native: "799 kr", agency: "15–50k+", employee: "45–60k" },
  { label: "Time to start", native: "2 minutes", agency: "2–4 weeks", employee: "2–3 months" },
  { label: "Administration", native: "None", agency: "Meetings, email, approvals", employee: "Follow-up, 1:1, HR" },
  { label: "Commitment", native: "None", agency: "3–6 months", employee: "Notice period" },
];

export function ComparisonTable() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1000px]">
        <h2 className="text-center font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          All your marketing, on autopilot
        </h2>
        <p className="body-copy mt-3 text-center">
          See how Native compares to the alternatives
        </p>

        <div className="mt-12 overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#eee]">
                <th className="p-4 font-medium text-gray-label" />
                <th className="p-4 font-playfair text-lg italic text-gold">Native</th>
                <th className="p-4 font-medium text-near-black">Agency</th>
                <th className="p-4 font-medium text-near-black">Employee</th>
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
          Prices based on market research and may vary. Agency prices typically
          include retainer and project costs.
        </p>
      </div>
    </section>
  );
}
