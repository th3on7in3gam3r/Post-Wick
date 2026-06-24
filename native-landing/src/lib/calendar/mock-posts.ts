import type { ContentCalendarPost } from "@/lib/calendar/content-calendar";

function at(day: number, hour = 10) {
  const date = new Date();
  date.setDate(day);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const MOCK_CALENDAR_POSTS: ContentCalendarPost[] = [
  {
    id: "mock-1",
    caption: "Slow mornings, fresh roast, and the regulars who know your order by heart.",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=640&q=80",
    platform: "instagram",
    scheduledAt: at(3),
    status: "approved",
    brandName: "Ember & Oak Coffee",
  },
  {
    id: "mock-2",
    caption: "Why consistency beats intensity for small business social media.",
    imageUrl: null,
    platform: "linkedin",
    scheduledAt: at(5),
    status: "approved",
    brandName: "Harbor Pilates Studio",
  },
  {
    id: "mock-3",
    caption: "Book your Saturday slot — walk-ins welcome before noon.",
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c7757c?auto=format&fit=crop&w=640&q=80",
    platform: "facebook",
    scheduledAt: at(8),
    status: "approved",
    brandName: "The Gentlemen's Cut",
  },
  {
    id: "mock-4",
    caption: "New seasonal blend drops Friday. Notes of cocoa, cedar, and honey.",
    imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=640&q=80",
    platform: "instagram",
    scheduledAt: at(12),
    status: "approved",
    brandName: "Roast House Co.",
  },
  {
    id: "mock-5",
    caption: "Wednesday 6:30 AM rooftop flow — bring your mat.",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=640&q=80",
    platform: "instagram",
    scheduledAt: at(15),
    status: "approved",
    brandName: "Sunrise Yoga Collective",
  },
  {
    id: "mock-6",
    caption: "Staff pick this week: a coastal novel that reads like a long conversation.",
    imageUrl: null,
    platform: "facebook",
    scheduledAt: at(18),
    status: "approved",
    brandName: "Chapter & Verse Books",
  },
  {
    id: "mock-7",
    caption: "Spring linen just arrived — oatmeal, sage, and terracotta on the rack.",
    imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=640&q=80",
    platform: "instagram",
    scheduledAt: at(22),
    status: "approved",
    brandName: "Linen & Loom",
  },
  {
    id: "mock-8",
    caption: "Sourdough out of the oven at 7 AM sharp. Still warm at 8.",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=640&q=80",
    platform: "facebook",
    scheduledAt: at(26),
    status: "approved",
    brandName: "Hearth & Crumb Bakery",
  },
];
