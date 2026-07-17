export type SamplePostPlatform = "instagram" | "linkedin";

export type SamplePost = {
  id: string;
  type: SamplePostPlatform;
  brand: string;
  caption: string;
  image: string;
  timestamp?: string;
  showActions?: boolean;
  share?: boolean;
  status?: boolean;
  /** When true, caption renders above the image (LinkedIn style). */
  copyAbove?: boolean;
};

function unsplash(photoId: string, width = 640) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

export const samplePosts: SamplePost[] = [
  {
    id: "braid-co",
    type: "instagram",
    brand: "Braid & Co",
    status: true,
    showActions: true,
    share: true,
    image: unsplash("1522337360788-8b13dee7a37e"),
    caption:
      "Our hair ties are made to last — without pulling, snagging, or damaging your hair.",
  },
  {
    id: "roast-house",
    type: "instagram",
    brand: "Roast House Co.",
    status: true,
    showActions: true,
    image: unsplash("1495474472287-4d71bcdd2085"),
    caption:
      "Small-batch beans, roasted fresh every Tuesday and Friday. This week: Ethiopia Yirgacheffe — blueberry, honey, and a clean finish.",
  },
  {
    id: "sunrise-yoga",
    type: "instagram",
    brand: "Sunrise Yoga Collective",
    status: true,
    showActions: true,
    image: unsplash("1544367567-0f2fcb009e0b"),
    caption:
      "6:30 AM rooftop flow every Wednesday. Bring your mat — leave with clearer breath and a quieter mind.",
  },
  {
    id: "chapter-verse",
    type: "linkedin",
    brand: "Chapter & Verse Books",
    timestamp: "3h",
    copyAbove: true,
    image: unsplash("1481627834876-b7833e8f5570"),
    caption:
      "Staff pick this week: a coastal novel that reads like a long conversation with an old friend. 20% off for locals through Sunday.",
  },
  {
    id: "gentlemens-cut",
    type: "instagram",
    brand: "The Gentlemen's Cut",
    status: true,
    showActions: true,
    image: "/images/sample-posts/gentlemens-cut.jpg",
    caption:
      "Classic scissor cuts and straight-razor shaves. Walk-ins welcome before noon — leave looking like you planned it.",
  },
  {
    id: "linen-loom",
    type: "instagram",
    brand: "Linen & Loom",
    status: true,
    showActions: true,
    image: unsplash("1445205170230-053b83016050"),
    caption:
      "Spring linen just arrived — lightweight layers in oatmeal, sage, and terracotta. New on the rack, old favorites restocked.",
  },
  {
    id: "paws-polish",
    type: "linkedin",
    brand: "Paws & Polish Grooming",
    timestamp: "5h",
    copyAbove: true,
    image: "/images/sample-posts/paws-polish.jpg",
    caption:
      "Spa day for the four-legged members of your family. Bath, brush, nail trim, and all the tail wags you can handle.",
  },
  {
    id: "greenpress",
    type: "instagram",
    brand: "GreenPress Juice Bar",
    status: true,
    showActions: true,
    image: "/images/sample-posts/greenpress.jpg",
    caption:
      "Cold-pressed citrus-ginger immunity shots are back on the menu. Made fresh every morning — grab one before your commute.",
  },
  {
    id: "hearth-crumb",
    type: "instagram",
    brand: "Hearth & Crumb Bakery",
    status: true,
    showActions: true,
    image: unsplash("1509440159596-0249088772ff"),
    caption:
      "Sourdough out of the oven at 7 AM sharp. Still warm at 8. Tell us you want the heel — we'll pretend we didn't hear.",
  },
  {
    id: "strongform",
    type: "linkedin",
    brand: "StrongForm Fitness",
    timestamp: "1h",
    copyAbove: true,
    image: "/images/sample-posts/strongform.jpg",
    caption:
      "Progress isn't linear — but showing up is. We build programs around your schedule, your goals, and the life you already have.",
  },
  {
    id: "clay-kiln",
    type: "instagram",
    brand: "Clay & Kiln Studio",
    status: true,
    showActions: true,
    image: unsplash("1578662996442-48f60103fc96"),
    caption:
      "Wheel-throwing workshop this Saturday — no experience needed, aprons provided. Leave with a mug that is charmingly imperfect.",
  },
  {
    id: "nordlys-sauna",
    type: "linkedin",
    brand: "Nordlys Sea Sauna",
    timestamp: "2h",
    copyAbove: true,
    image: unsplash("1540555700478-4be289fbecef"),
    caption:
      "After a long day in the sauna, nothing beats the fresh sea air. Experiences you'll remember long after you towel off.",
  },
  {
    id: "bloom-stem",
    type: "instagram",
    brand: "Bloom & Stem Florist",
    status: true,
    showActions: true,
    image: "/images/sample-posts/bloom-stem.jpg",
    caption:
      "Farmer's market peonies are in — limited buckets at the shop all weekend. First come, first carried home smiling.",
  },
  {
    id: "harbor-pizza",
    type: "linkedin",
    brand: "Harbor View Pizza Co.",
    timestamp: "4h",
    copyAbove: true,
    image: unsplash("1513104890138-7c749659a591"),
    caption:
      "Friday night means wood-fired margherita and a corner booth by the window. Dough proofed 48 hours — worth every minute.",
  },
  {
    id: "bluebird-vinyl",
    type: "instagram",
    brand: "Bluebird Vinyl Records",
    status: true,
    showActions: true,
    image: unsplash("1493225457124-a3eb161ffa5f"),
    caption:
      "New arrivals in jazz and soul — crate-digging encouraged, headphones at the listening station, judgment-free.",
  },
];
