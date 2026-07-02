export type SocialGradeBreakdown = {
  label: string;
  score: number;
};

export type SocialGradeResult = {
  score: number;
  grade: string;
  input: string;
  tips: string[];
  breakdown: SocialGradeBreakdown[];
  timestamp: string;
};

const TIP_POOL = [
  "Post more consistently — aim for at least 3 times per week.",
  "Use a stronger hook in the first line of every caption.",
  "Add a clear call-to-action so followers know what to do next.",
  "Mix photos, carousels, and short video to keep the feed fresh.",
  "Reply to comments within 24 hours to boost reach.",
  "Pin your best-performing post to the top of your profile.",
  "Use on-brand hashtags sparingly (5–10 max per post).",
  "Schedule posts during your audience's peak hours.",
  "Share customer stories or testimonials to build trust.",
  "Keep visuals on-brand with consistent colors and lighting.",
] as const;

function hashInput(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function letterGrade(score: number) {
  if (score >= 78) return "B+";
  if (score >= 72) return "B";
  if (score >= 66) return "C+";
  if (score >= 60) return "C";
  return "C-";
}

function pickTips(hash: number) {
  const indices = [
    hash % TIP_POOL.length,
    (hash + 3) % TIP_POOL.length,
    (hash + 7) % TIP_POOL.length,
  ];

  const tips: string[] = [];
  for (const index of indices) {
    const tip = TIP_POOL[index]!;
    if (!tips.includes(tip)) {
      tips.push(tip);
    }
  }

  return tips.slice(0, 3);
}

export function gradeSocialPresence(rawInput: string): SocialGradeResult {
  const input = rawInput.trim();
  if (!input) {
    throw new Error("Enter your website URL or social handle.");
  }

  const normalized = input.toLowerCase();
  const hash = hashInput(normalized);
  const score = 50 + (hash % 31);

  const breakdown: SocialGradeBreakdown[] = [
    { label: "Posting consistency", score: 42 + (hash % 28) },
    { label: "Visual quality", score: 45 + ((hash >> 3) % 26) },
    { label: "Engagement signals", score: 40 + ((hash >> 6) % 32) },
  ];

  return {
    score,
    grade: letterGrade(score),
    input,
    tips: pickTips(hash),
    breakdown,
    timestamp: new Date().toISOString(),
  };
}

export function graderSignUpHref() {
  return "/get-started?ref=grader";
}
