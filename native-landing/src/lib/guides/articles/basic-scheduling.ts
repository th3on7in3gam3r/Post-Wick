import { planFacts, SCHEDULE_SLOT_DAYS, SCHEDULE_SLOT_TIME } from "@/lib/guides/plan-facts";
import type { GuideArticle } from "@/lib/guides/types";

export const basicSchedulingGuide: GuideArticle = {
  slug: "basic-scheduling",
  title: "Basic Scheduling",
  metaTitle: "Basic Scheduling for Social Posts | Kerygma Social",
  metaDescription:
    "Kerygma Social includes basic scheduling: approve AI posts, auto-place them on Mon/Wed/Fri slots, drag to reschedule on the calendar, and publish on autopilot.",
  publishedAt: "2026-07-09",
  summary:
    "How Kerygma Social’s built-in scheduling works — approval queue, calendar, autopilot slots, and publishing.",
  answerParagraph: `Kerygma Social includes basic scheduling on every plan: approve AI-generated posts in your queue, and Kerygma Social places them on ${SCHEDULE_SLOT_DAYS} at ${SCHEDULE_SLOT_TIME} in your timezone. Drag posts on the calendar to reschedule, or let autopilot publish up to ${planFacts.free.weekly} approved posts per week on the free plan. Kerygma Social handles the calendar — you keep final approval.`,
  sections: [
    {
      heading: "Who Kerygma Social is best for",
      paragraphs: [
        "Kerygma Social is built for owners who want basic scheduling without learning a complex social suite. You do not need to pick 50 time slots manually — approve good posts and Kerygma Social schedules them intelligently.",
        "If you searched for “basic scheduling,” you likely want reliable posting cadence without babysitting every publish time. That is the default Kerygma Social workflow.",
      ],
      bullets: [
        "Owners who want Mon/Wed/Fri consistency without manual slot picking",
        "Teams that approve content in batches, not one post at a time",
        "Local businesses moving off phone reminders and sticky notes",
        "Churches and boutiques that need simple, dependable publishing",
      ],
    },
    {
      heading: "How Kerygma Social compares to alternatives",
      bullets: [
        "vs. Buffer or Later — those tools schedule posts you write; Kerygma Social generates and schedules after your approval.",
        "vs. native platform schedulers — Kerygma Social works across Facebook, Instagram, LinkedIn, and Pinterest from one queue.",
        "vs. manual posting — basic scheduling on autopilot frees you from daily login reminders.",
        "vs. enterprise suites — Kerygma Social keeps scheduling simple: approve, calendar, publish.",
      ],
    },
    {
      heading: "Basic scheduling on Kerygma Social",
      paragraphs: [
        "Scheduling starts in the approval queue. When you approve a post, Kerygma Social assigns the next available slot on Monday, Wednesday, or Friday at 10:00 AM (in your account timezone). Open the calendar to drag approved posts to a different day.",
      ],
      bullets: [
        "Approval queue — review AI drafts before anything schedules",
        `Default slots: ${SCHEDULE_SLOT_DAYS} at ${SCHEDULE_SLOT_TIME}`,
        "Calendar view — see the month at a glance and drag to reschedule",
        `Autopilot weekly cap: ${planFacts.free.weekly} posts/week on free, ${planFacts.pro.weekly} on Pro, ${planFacts.max.weekly} on Max`,
        "Automatic publishing to connected Facebook, Instagram, LinkedIn, and Pinterest",
        "Email reminders when posts are waiting for approval",
      ],
    },
  ],
  proofPoints: [
    "Approve once — Kerygma Social picks the next open slot for you.",
    "Reschedule by dragging on the calendar when you need flexibility.",
    "Weekly caps match your plan so you never over-schedule accidentally.",
    "Publishing runs on autopilot after approval — no daily manual work.",
  ],
  faqs: [
    {
      q: "Does Kerygma Social include basic scheduling?",
      a: `Yes. Approve posts in the queue and Kerygma Social schedules them on ${SCHEDULE_SLOT_DAYS} at ${SCHEDULE_SLOT_TIME}. Use the calendar to drag posts to different days.`,
    },
    {
      q: "Can I choose my own publish times?",
      a: "Approved posts default to Mon/Wed/Fri at 10:00 AM in your timezone. Drag posts on the calendar to reschedule to another day within the scheduling window.",
    },
    {
      q: "Is scheduling included on the free plan?",
      a: `Yes. Basic scheduling and calendar rescheduling are included on every plan. The free plan schedules up to ${planFacts.free.weekly} approved posts per week on autopilot.`,
    },
    {
      q: "What happens after a post is scheduled?",
      a: "Kerygma Social publishes approved posts automatically to your connected social accounts at the scheduled time — no extra step required.",
    },
  ],
};
