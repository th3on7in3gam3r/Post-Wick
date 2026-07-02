export const INDUSTRY_SLUGS = [
  "yoga-studios",
  "coffee-shops",
  "local-churches",
  "boutique-retail",
] as const;

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

export type IndustryVertical = {
  slug: IndustrySlug;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  paragraphs: string[];
  highlights: string[];
};

export function isIndustrySlug(slug: string): slug is IndustrySlug {
  return (INDUSTRY_SLUGS as readonly string[]).includes(slug);
}

export function slugToReadableTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const INDUSTRY_VERTICALS: Record<IndustrySlug, IndustryVertical> = {
  "yoga-studios": {
    slug: "yoga-studios",
    title: "Yoga Studios",
    metaTitle: "Social Media Automation for Yoga Studios | Kerygma Social",
    metaDescription:
      "Put your yoga studio feed on autopilot. Kerygma Social drafts class promos, wellness tips, and member spotlights — you approve, we publish.",
    intro:
      "Your students live on Instagram — but you live on the mat. Kerygma Social helps yoga studio owners post consistently without hiring an agency or sacrificing evenings to caption writing.",
    paragraphs: [
      "Most studios lose momentum between teacher training seasons because posting feels like a second job. You are cueing breath, managing memberships, and adjusting class schedules — not brainstorming Reel hooks. Kerygma Social researches your website, learns your voice, and drafts a month of posts tailored to your community: new class launches, workshop reminders, instructor intros, and gentle encouragement that sounds like you — not a generic fitness template.",
      "Local discovery depends on rhythm. When prospects search for hot yoga near them or browse #YourCityYoga, an active feed signals that your studio is open, welcoming, and professional. Consistent visuals and captions improve trust before someone ever steps onto a mat. Our approval queue lets you swipe through drafts on your phone between classes, approve what fits, and skip what does not.",
      "Whether you run a boutique heated room, a donation-based community practice, or a multi-location franchise, the workflow is the same: drop your URL, confirm your brand voice, connect Instagram and Facebook, and let autopilot handle the weekly grind. Pro and Max plans scale batch sizes for studios running retreats, merch drops, or seasonal challenges.",
    ],
    highlights: [
      "Class schedule and workshop promo drafts",
      "Instructor spotlights and member milestones",
      "Instagram and Facebook publishing after approval",
    ],
  },
  "coffee-shops": {
    slug: "coffee-shops",
    title: "Coffee Shops",
    metaTitle: "Social Media Automation for Coffee Shops | Kerygma Social",
    metaDescription:
      "Automate social posts for your coffee shop. Seasonal drinks, slow mornings, and local events — drafted from your brand and ready to approve.",
    intro:
      "The beans are dialed in and the line is out the door — but your last post was three weeks ago. Kerygma Social keeps independent cafés and roasters visible without pulling baristas off the bar to take photos.",
    paragraphs: [
      "Coffee shops win on atmosphere as much as flavor. Customers want to see steam on a rainy morning, latte art from your weekend barista, and the pastry case before they walk over. That content is everywhere in your shop already; the bottleneck is turning it into captions and posts on a reliable schedule. Kerygma Social crawls your site, understands your neighborhood positioning, and generates posts that highlight seasonal menus, live music nights, and loyalty perks in your tone.",
      "Competing with chains means showing up daily in local feeds. Algorithms favor accounts that post regularly with clear location context — exactly what independent shops struggle to maintain when staffing is tight. With Kerygma Social, you batch-approve a month of content in minutes, schedule publishing to Instagram and Facebook, and stay top-of-mind when someone searches for a place to work or meet a friend.",
      "From single-location esoteric bars to multi-roaster brands with wholesale lines, our platform scales with your ambitions. Connect your channels, keep human approval in the loop, and turn social media from a guilt trip into a growth channel that runs while you pull shots.",
    ],
    highlights: [
      "Seasonal drink and pastry launch posts",
      "Neighborhood events and live music promos",
      "On-brand captions without Sunday-night writing sessions",
    ],
  },
  "local-churches": {
    slug: "local-churches",
    title: "Local Churches",
    metaTitle: "Church Social Media Automation | Kerygma Social",
    metaDescription:
      "Extend your ministry beyond Sunday. Automate church social posts for events, sermons, and volunteer needs — faithful tone, zero burnout.",
    intro:
      "Your congregation gathers on Sunday, but community happens all week online. Kerygma Social helps churches and faith communities share the Gospel, events, and care requests without exhausting volunteer comms teams.",
    paragraphs: [
      "Church social media is pastoral work in public. Members look for service times, baptism photos, youth group reminders, and scripture encouragement between weekends. Volunteers often rotate every few months, which leads to inconsistent posting and lost momentum. Kerygma Social researches your church website, learns your voice — reverent, welcoming, contemporary, or traditional — and drafts posts your team can review before anything goes live.",
      "Faith communities compete for attention with every other notification on a phone. Consistency builds trust with visitors researching churches online and keeps active members engaged with ministry opportunities. Share volunteer needs, mission trip updates, and community outreach stories with captions that honor your theology and your neighborhood context.",
      "Staff sizes vary from bi-vocational pastors to full comms directors; Kerygma Social meets you where you are. Approve posts in a simple queue, publish to Facebook and Instagram, and free your team to focus on people — not platform algorithms. Sensitive topics always stay in your control: nothing publishes without your explicit approval.",
    ],
    highlights: [
      "Sunday service and midweek event reminders",
      "Volunteer and giving campaign support content",
      "Faithful tone matched to your church website",
    ],
  },
  "boutique-retail": {
    slug: "boutique-retail",
    title: "Boutique Retail",
    metaTitle: "Social Media for Boutique Retail | Kerygma Social",
    metaDescription:
      "Automate boutique social media with AI that knows your catalog vibe. New arrivals, styling tips, and local promos — approved by you, posted on schedule.",
    intro:
      "Your rails tell a story — your feed should too. Kerygma Social helps independent boutiques and specialty retailers turn merchandising moments into consistent social content without a full-time content hire.",
    paragraphs: [
      "Boutique retail lives on discovery: a passerby scrolling Instagram sees a styled mannequin, clicks through, and visits on Saturday. But owners are buying inventory, training staff, and running the floor — not batch-editing carousel posts at midnight. Kerygma Social analyzes your website and brand positioning, then drafts posts for new arrivals, gift guides, owner picks, and local collabs that sound like your shop, not a department store.",
      "Visual consistency builds premium perception. When product shots, tone, and posting cadence align, customers assume the in-store experience matches the feed — and they are more likely to convert. Kerygma Social keeps your channels active through slow Tuesdays and busy holidays alike, with an approval workflow that respects your eye for detail.",
      "Sell apparel, home goods, gifts, or curated vintage — the platform adapts to your catalog rhythm. Connect social accounts, approve batches between shipments, and let autopilot handle the publishing calendar while you focus on buyers in real life.",
    ],
    highlights: [
      "New arrival and lookbook-style post drafts",
      "Local shopping event and sale promos",
      "Brand voice pulled from your boutique website",
    ],
  },
};

export function getIndustryVertical(slug: string) {
  if (!isIndustrySlug(slug)) {
    return null;
  }
  return INDUSTRY_VERTICALS[slug];
}

export const INDUSTRY_FOOTER_LINKS = INDUSTRY_SLUGS.map((slug) => ({
  slug,
  href: `/industries/${slug}`,
  label: INDUSTRY_VERTICALS[slug].title,
}));
