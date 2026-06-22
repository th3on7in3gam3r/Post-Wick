"use client";

import { useMemo } from "react";
import { formatScheduleLabel } from "@/lib/scheduling/slots";
import { cn } from "@/lib/utils";

type CalendarPost = {
  id: string;
  brandName: string;
  platform: string;
  content: string;
  status: string;
  scheduledAt: string | null;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function CalendarClient({ posts }: { posts: CalendarPost[] }) {
  const days = useMemo(() => {
    const start = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, index) => addDays(start, index));
  }, []);

  const postsByDay = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    for (const post of posts) {
      if (!post.scheduledAt) continue;
      const key = dayKey(new Date(post.scheduledAt));
      const bucket = map.get(key) ?? [];
      bucket.push(post);
      map.set(key, bucket);
    }
    return map;
  }, [posts]);

  return (
    <div className="grid gap-4 lg:grid-cols-7">
      {days.map((day) => {
        const key = dayKey(day);
        const dayPosts = postsByDay.get(key) ?? [];
        const isToday = key === dayKey(new Date());

        return (
          <div
            key={key}
            className={cn(
              "min-h-[180px] rounded-2xl border bg-white p-4 shadow-card",
              isToday ? "border-gold/40 bg-cream/30" : "border-black/[0.06]",
            )}
          >
            <div className="mb-3 border-b border-black/[0.06] pb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p className="font-playfair text-lg italic text-near-black">
                {day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
            </div>

            {dayPosts.length === 0 ? (
              <p className="text-xs text-gray-label">No posts</p>
            ) : (
              <div className="space-y-3">
                {dayPosts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-black/[0.06] bg-cream/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold">
                        {post.platform}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide",
                          post.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : post.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-white text-gray-body",
                        )}
                      >
                        {post.status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-near-black">
                      {post.content}
                    </p>
                    {post.scheduledAt ? (
                      <p className="mt-2 text-[0.65rem] text-gray-label">
                        {formatScheduleLabel(post.scheduledAt)}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
