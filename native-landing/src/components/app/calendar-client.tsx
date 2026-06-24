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
const DATE_LOCALE = "en-US";

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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayHeading(day: Date) {
  return {
    weekday: day.toLocaleDateString(DATE_LOCALE, { weekday: "short" }),
    label: day.toLocaleDateString(DATE_LOCALE, { month: "short", day: "numeric" }),
  };
}

function canReschedule(post: CalendarPost) {
  return post.status === "approved" && Boolean(post.scheduledAt);
}

function buildCalendarDays() {
  const start = startOfDay(new Date());
  return Array.from({ length: 14 }, (_, index) => addDays(start, index));
}

export function CalendarClient({ posts: initialPosts }: { posts: CalendarPost[] }) {
  const router = useRouter();
  const [days] = useState(buildCalendarDays);
  const [posts, setPosts] = useState(initialPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedPostId(null);
        setDraggingId(null);
        setDropTarget(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  const todayKey = dayKey(new Date());
  const hasSelection = Boolean(selectedPostId);

  async function reschedulePost(postId: string, day: Date) {
    const post = posts.find((item) => item.id === postId);
    if (!post || !canReschedule(post)) return;

    const scheduledAt = scheduleSlotOnDay(day);
    if (post.scheduledAt && dayKey(new Date(post.scheduledAt)) === dayKey(day)) {
      setSelectedPostId(null);
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
      setSelectedPostId(null);
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

  function handleDayClick(day: Date) {
    if (!selectedPostId || reschedulingId) return;
    void reschedulePost(selectedPostId, day);
  }

  function togglePostSelection(postId: string) {
    setSelectedPostId((current) => (current === postId ? null : postId));
    setMessage(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-body">
        <span className="font-medium text-near-black">Click an approved post</span>, then click a
        day to move it — or drag it there. Posts publish at 10:00 AM on the day you choose. Press{" "}
        <kbd className="rounded border border-black/10 bg-white px-1.5 py-0.5 text-xs">Esc</kbd> to
        cancel.
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
          const isToday = key === todayKey;
          const isDropTarget = dropTarget === key;
          const isMoveTarget = hasSelection && !isDropTarget;
          const heading = formatDayHeading(day);

          return (
            <div
              key={key}
              role={hasSelection ? "button" : undefined}
              tabIndex={hasSelection ? 0 : undefined}
              onKeyDown={(event) => {
                if (!hasSelection) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleDayClick(day);
                }
              }}
              onClick={() => handleDayClick(day)}
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
              onDrop={(event) => {
                event.stopPropagation();
                handleDrop(day, event);
              }}
              className={cn(
                "min-h-[180px] rounded-2xl border bg-white p-4 shadow-card transition-colors",
                isToday ? "border-gold/40 bg-cream/30" : "border-black/[0.06]",
                isDropTarget && "border-gold bg-gold/5 ring-2 ring-gold/30",
                isMoveTarget && "cursor-pointer border-gold/30 hover:border-gold/60 hover:bg-gold/5",
              )}
            >
              <div className="mb-3 border-b border-black/[0.06] pb-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                  {heading.weekday}
                </p>
                <p className="font-playfair text-lg italic text-near-black">{heading.label}</p>
              </div>

              {dayPosts.length === 0 ? (
                <p className="text-xs text-gray-label">
                  {isDropTarget
                    ? "Drop to schedule here"
                    : isMoveTarget
                      ? "Click to move here"
                      : "No posts"}
                </p>
              ) : (
                <div className="space-y-3">
                  {dayPosts.map((post) => {
                    const movable = canReschedule(post);
                    const isDragging = draggingId === post.id;
                    const isSelected = selectedPostId === post.id;
                    const isSaving = reschedulingId === post.id;

                    return (
                      <article
                        key={post.id}
                        draggable={movable && !isSaving}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!movable || isSaving) return;
                          togglePostSelection(post.id);
                        }}
                        onDragStart={(event) => {
                          if (!movable) return;
                          event.stopPropagation();
                          event.dataTransfer.setData(POST_ID_MIME, post.id);
                          event.dataTransfer.setData("text/plain", post.id);
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingId(post.id);
                          setSelectedPostId(post.id);
                          setMessage(null);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropTarget(null);
                        }}
                        className={cn(
                          "rounded-xl border bg-cream/50 p-3 transition-all",
                          movable && "cursor-pointer select-none",
                          movable && !isSelected && "border-black/[0.06] hover:border-gold/30",
                          isSelected && "border-gold ring-2 ring-gold/25",
                          isDragging && "opacity-50",
                          isSaving && "opacity-70",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {movable ? (
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
