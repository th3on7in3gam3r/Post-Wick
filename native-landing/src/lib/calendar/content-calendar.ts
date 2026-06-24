export type ContentCalendarPost = {
  id: string;
  caption: string;
  imageUrl: string | null;
  platform: string;
  scheduledAt: string;
  status?: string;
  brandName?: string;
  externalPostId?: string | null;
};

const DATE_LOCALE = "en-US";

export const POST_ID_MIME = "application/x-post-wick-post-id";

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const WEEKDAY_LABELS_SHORT = ["S", "M", "T", "W", "T", "F", "S"] as const;

export const PLATFORM_DOT_COLORS: Record<string, string> = {
  facebook: "bg-[#1877F2]",
  instagram: "bg-[#E4405F]",
  linkedin: "bg-[#0A66C2]",
  twitter: "bg-near-black",
  x: "bg-near-black",
  tiktok: "bg-near-black",
};

export function platformDotColor(platform: string) {
  return PLATFORM_DOT_COLORS[platform.toLowerCase()] ?? "bg-gold";
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildMonthGrid(month: Date) {
  const firstOfMonth = startOfMonth(month);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function formatMonthHeading(month: Date) {
  return month.toLocaleDateString(DATE_LOCALE, { month: "long", year: "numeric" });
}

export function captionPreview(caption: string, maxLength = 30) {
  const trimmed = caption.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export function groupPostsByDay(posts: ContentCalendarPost[]) {
  const map = new Map<string, ContentCalendarPost[]>();
  for (const post of posts) {
    if (!post.scheduledAt) continue;
    const key = dayKey(new Date(post.scheduledAt));
    const bucket = map.get(key) ?? [];
    bucket.push(post);
    map.set(key, bucket);
  }
  return map;
}
