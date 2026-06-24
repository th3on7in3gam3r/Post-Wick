"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2 } from "lucide-react";
import {
  formatScheduleLabel,
  scheduleSlotOnDay,
} from "@/lib/scheduling/slots";
import { ExternalPostLink } from "@/components/app/external-post-link";
import { cn } from "@/lib/utils";

type CalendarPost = {
  id: string;
  brandName: string;
  platform: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  externalPostId: string | null;
};

const POST_ID_MIME = "application/x-post-wick-post-id";

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

function canReschedule(post: CalendarPost) {
  return post.status === "approved" && Boolean(post.scheduledAt);
}

export function CalendarClient({ posts: initialPosts }: { posts: CalendarPost[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

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

  async function reschedulePost(postId: string, day: Date) {
    const post = posts.find((item) => item.id === postId);
    if (!post || !canReschedule(post)) return;

    const scheduledAt = scheduleSlotOnDay(day);
    if (post.scheduledAt && dayKey(new Date(post.scheduledAt)) === dayKey(day)) {
      return;
    }

    setReschedulingId(postId);
    setMessage(null);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt }),
      });
      const data = (await response.json()) as { error?: string; scheduledAt?: string };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to reschedule post",
        );
      }

      setPosts((current) =>
        current.map((item) =>
          item.id === postId ? { ...item, scheduledAt: data.scheduledAt ?? scheduledAt } : item,
        ),
      );
      setMessage(`Moved to ${formatScheduleLabel(scheduledAt)}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not reschedule post");
    } finally {
      setReschedulingId(null);
      setDraggingId(null);
      setDropTarget(null);
    }
  }

  function handleDrop(day: Date, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const postId =
      event.dataTransfer.getData(POST_ID_MIME) ||
      event.dataTransfer.getData("text/plain");
    if (!postId) return;
    void reschedulePost(postId, day);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-body">
        Drag <span className="font-medium text-near-black">approved</span> posts to another day
        to reschedule. Posts publish at 10:00 AM on the day you choose.
      </p>

      {message ? (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            message.startsWith("Moved")
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700",
          )}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-7">
        {days.map((day) => {
          const key = dayKey(day);
          const dayPosts = postsByDay.get(key) ?? [];
          const isToday = key === dayKey(new Date());
          const isDropTarget = dropTarget === key;

          return (
            <div
              key={key}
              onDragOver={(event) => {
                if (!draggingId) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDropTarget(key);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node)) return;
                setDropTarget((current) => (current === key ? null : current));
              }}
              onDrop={(event) => handleDrop(day, event)}
              className={cn(
                "min-h-[180px] rounded-2xl border bg-white p-4 shadow-card transition-colors",
                isToday ? "border-gold/40 bg-cream/30" : "border-black/[0.06]",
                isDropTarget && "border-gold bg-gold/5 ring-2 ring-gold/30",
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
                <p className="text-xs text-gray-label">
                  {isDropTarget ? "Drop to schedule here" : "No posts"}
                </p>
              ) : (
                <div className="space-y-3">
                  {dayPosts.map((post) => {
                    const draggable = canReschedule(post);
                    const isDragging = draggingId === post.id;
                    const isSaving = reschedulingId === post.id;

                    return (
                      <article
                        key={post.id}
                        draggable={draggable && !isSaving}
                        onDragStart={(event) => {
                          if (!draggable) return;
                          event.dataTransfer.setData(POST_ID_MIME, post.id);
                          event.dataTransfer.setData("text/plain", post.id);
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingId(post.id);
                          setMessage(null);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropTarget(null);
                        }}
                        className={cn(
                          "rounded-xl border border-black/[0.06] bg-cream/50 p-3 transition-opacity",
                          draggable && "cursor-grab active:cursor-grabbing",
                          isDragging && "opacity-50",
                          isSaving && "opacity-70",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {draggable ? (
                              <GripVertical
                                className="h-3.5 w-3.5 shrink-0 text-gray-label"
                                aria-hidden
                              />
                            ) : null}
                            <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gold">
                              {post.platform}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                            ) : null}
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide",
                                post.status === "published"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : post.status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : post.status === "approved"
                                      ? "bg-white text-gray-body"
                                      : "bg-white text-gray-body",
                              )}
                            >
                              {post.status}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-near-black">
                          {post.content}
                        </p>
                        {post.scheduledAt ? (
                          <p className="mt-2 text-[0.65rem] text-gray-label">
                            {formatScheduleLabel(post.scheduledAt)}
                          </p>
                        ) : null}
                        {post.status === "published" ? (
                          <ExternalPostLink
                            platform={post.platform}
                            externalPostId={post.externalPostId}
                            className="mt-2 text-[0.65rem]"
                          />
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
