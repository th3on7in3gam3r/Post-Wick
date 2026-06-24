"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentCalendar, type ContentCalendarPost } from "@/components/app/content-calendar";
import { dayKey, POST_ID_MIME } from "@/lib/calendar/content-calendar";
import {
  formatScheduleLabel,
  scheduleSlotOnDay,
} from "@/lib/scheduling/slots";
import { cn } from "@/lib/utils";

type CalendarPost = ContentCalendarPost & {
  brandName: string;
  content: string;
  status: string;
};

function canReschedule(post: CalendarPost) {
  return post.status === "approved" && Boolean(post.scheduledAt);
}

function toCalendarPost(post: CalendarPost): ContentCalendarPost {
  return {
    id: post.id,
    caption: post.caption || post.content,
    imageUrl: post.imageUrl,
    platform: post.platform,
    scheduledAt: post.scheduledAt,
    status: post.status,
    brandName: post.brandName,
    externalPostId: post.externalPostId,
  };
}

export function CalendarClient({ posts: initialPosts }: { posts: CalendarPost[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [movingPostId, setMovingPostId] = useState<string | null>(null);
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
        setMovingPostId(null);
        setDraggingId(null);
        setDropTarget(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const calendarPosts = useMemo(
    () => posts.map((post) => toCalendarPost(post)),
    [posts],
  );

  async function reschedulePost(postId: string, day: Date) {
    const post = posts.find((item) => item.id === postId);
    if (!post || !canReschedule(post)) return;

    const scheduledAt = scheduleSlotOnDay(day);
    if (post.scheduledAt && dayKey(new Date(post.scheduledAt)) === dayKey(day)) {
      setMovingPostId(null);
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
      setMovingPostId(null);
      setDraggingId(null);
      setDropTarget(null);
    }
  }

  function handleDrop(day: Date, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const postId =
      event.dataTransfer.getData(POST_ID_MIME) ||
      event.dataTransfer.getData("text/plain") ||
      draggingId;
    if (!postId) return;
    void reschedulePost(postId, day);
  }

  function handleScheduleEmptyDay() {
    if (movingPostId) return;
    setMessage("Open a post and choose Move to another day, or drag it on desktop.");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-body">
        <span className="md:hidden">
          <span className="font-medium text-near-black">Tap a post</span> for details. Use{" "}
          <span className="font-medium text-near-black">Move to another day</span>, then tap a
          date.
        </span>
        <span className="hidden md:inline">
          <span className="font-medium text-near-black">Click a chip</span> for the full post.{" "}
          <span className="font-medium text-near-black">Drag a chip</span> onto any day to
          reschedule.
        </span>{" "}
        Posts publish at 10:00 AM on the day you choose.
      </p>

      {message ? (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            message.startsWith("Moved")
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-gold/25 bg-cream/70 text-near-black",
          )}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <ContentCalendar
        posts={calendarPosts}
        movingPostId={movingPostId}
        draggingId={draggingId}
        dropTargetKey={dropTarget}
        reschedulingId={reschedulingId}
        canReschedule={(post) => {
          const full = posts.find((item) => item.id === post.id);
          return full ? canReschedule(full) : false;
        }}
        onStartMove={(postId) => {
          setMovingPostId(postId);
          setMessage(null);
        }}
        onCancelMove={() => setMovingPostId(null)}
        onRescheduleToDay={(day) => {
          if (!movingPostId) return;
          void reschedulePost(movingPostId, day);
        }}
        onScheduleEmptyDay={handleScheduleEmptyDay}
        onDragStart={(postId) => {
          setDraggingId(postId);
          setMessage(null);
        }}
        onDragEnd={() => {
          setDraggingId(null);
          setDropTarget(null);
        }}
        onDragOverDay={(key) => setDropTarget(key)}
        onDragLeaveDay={(key, event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setDropTarget((current) => (current === key ? null : current));
        }}
        onDropOnDay={handleDrop}
      />
    </div>
  );
}
