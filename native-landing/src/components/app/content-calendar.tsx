"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, GripVertical, Loader2, Plus, X } from "lucide-react";
import { ExternalPostLink } from "@/components/app/external-post-link";
import { TextureButton } from "@/components/ui/texture-button";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  buildMonthGrid,
  captionPreview,
  dayKey,
  formatMonthHeading,
  groupPostsByDay,
  platformDotColor,
  POST_ID_MIME,
  startOfMonth,
  WEEKDAY_LABELS,
  WEEKDAY_LABELS_SHORT,
  type ContentCalendarPost,
} from "@/lib/calendar/content-calendar";
import { formatScheduleLabel } from "@/lib/scheduling/slots";
import { postHasBrokenImageUrl, resolvePostImageUrl } from "@/lib/posts/image-url";
import { cn } from "@/lib/utils";

export type ContentCalendarProps = {
  posts: ContentCalendarPost[];
  initialMonth?: Date;
  movingPostId?: string | null;
  draggingId?: string | null;
  dropTargetKey?: string | null;
  reschedulingId?: string | null;
  canReschedule?: (post: ContentCalendarPost) => boolean;
  onCancelMove?: () => void;
  onRescheduleToDay?: (day: Date) => void;
  onStartMove?: (postId: string) => void;
  onScheduleEmptyDay?: (day: Date) => void;
  onDragStart?: (postId: string) => void;
  onDragEnd?: () => void;
  onDragOverDay?: (key: string) => void;
  onDragLeaveDay?: (key: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDropOnDay?: (day: Date, event: React.DragEvent<HTMLDivElement>) => void;
};

function PostDetailModal({
  post,
  canMove,
  onClose,
  onMove,
}: {
  post: ContentCalendarPost;
  canMove: boolean;
  onClose: () => void;
  onMove: () => void;
}) {
  const imageBroken = postHasBrokenImageUrl(post.imageUrl);
  const imageSrc = resolvePostImageUrl(post.imageUrl, { display: true });
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [post.id, imageSrc]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-near-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-black/[0.06] bg-white p-5 shadow-card sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-detail-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-label transition hover:bg-cream hover:text-near-black"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 h-1 w-10 rounded-full bg-black/10 sm:hidden" aria-hidden />

        <div className="flex items-center gap-2 pr-8">
          <span
            className={cn("h-2.5 w-2.5 shrink-0 rounded-full", platformDotColor(post.platform))}
            aria-hidden
          />
          <p
            id="post-detail-title"
            className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-gold"
          >
            {post.platform}
          </p>
          {post.brandName ? (
            <span className="truncate text-sm text-gray-label">· {post.brandName}</span>
          ) : null}
        </div>

        {post.scheduledAt ? (
          <p className="mt-2 text-sm text-gray-body">{formatScheduleLabel(post.scheduledAt)}</p>
        ) : null}

        {imageSrc && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="mt-4 aspect-[4/3] w-full rounded-xl object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="mt-4 flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/[0.08] bg-cream/60 px-4 text-center text-sm text-gray-label">
            <span>{imageBroken ? "Image needs regeneration" : "No image"}</span>
            {imageBroken ? (
              <span className="text-xs">Use Fix images on the calendar or brand page</span>
            ) : null}
          </div>
        )}

        <p className="mt-4 whitespace-pre-wrap font-playfair text-base italic leading-relaxed text-near-black sm:text-lg">
          {post.caption}
        </p>

        {post.status === "published" ? (
          <ExternalPostLink
            platform={post.platform}
            externalPostId={post.externalPostId ?? null}
            className="mt-4 inline-block text-sm"
          />
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {canMove ? (
            <TextureButton type="button" variant="primary" size="default" onClick={onMove}>
              Move to another day
            </TextureButton>
          ) : null}
          <TextureButton type="button" variant="secondary" size="default" onClick={onClose}>
            Close
          </TextureButton>
        </div>
      </div>
    </div>
  );
}

function DayPostsModal({
  day,
  posts,
  onClose,
  onOpenPost,
}: {
  day: Date;
  posts: ContentCalendarPost[];
  onClose: () => void;
  onOpenPost: (post: ContentCalendarPost) => void;
}) {
  const label = day.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-near-black/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-black/[0.06] bg-white p-5 shadow-card sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Posts on ${label}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-gold">
              Scheduled
            </p>
            <h4 className="font-playfair text-lg italic text-near-black">{label}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-label hover:bg-cream"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
          {posts.map((post) => (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => onOpenPost(post)}
                className="flex w-full items-center gap-3 rounded-xl border border-black/[0.06] bg-cream/40 px-3 py-3 text-left transition hover:border-gold/30"
              >
                <span
                  className={cn("h-2.5 w-2.5 shrink-0 rounded-full", platformDotColor(post.platform))}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-wide text-gold">
                    {post.platform}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-near-black">
                    {post.caption}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PostChip({
  post,
  compact,
  draggable,
  isDragging,
  isMoving,
  isSaving,
  previewLength,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  post: ContentCalendarPost;
  compact: boolean;
  draggable: boolean;
  isDragging: boolean;
  isMoving: boolean;
  isSaving: boolean;
  previewLength: number;
  onOpen: () => void;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onClick={(event) => {
        event.stopPropagation();
        if (isSaving) return;
        onOpen();
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "flex w-full items-center rounded-lg border bg-white text-left transition-all",
        compact ? "gap-1 px-1 py-1" : "items-start gap-1.5 px-2 py-1.5",
        draggable && "cursor-grab active:cursor-grabbing",
        isMoving
          ? "border-gold ring-2 ring-gold/25"
          : "border-black/[0.06] hover:border-gold/30",
        isDragging && "opacity-50",
        isSaving && "opacity-70",
      )}
      aria-label={`${post.platform}: ${post.caption}`}
    >
      {draggable && !compact ? (
        <GripVertical className="mt-0.5 h-3 w-3 shrink-0 text-gray-label" aria-hidden />
      ) : null}
      <span
        className={cn(
          "shrink-0 rounded-full",
          compact ? "h-2 w-2" : "mt-1 h-2 w-2",
          platformDotColor(post.platform),
        )}
        aria-hidden
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-near-black",
          compact ? "text-[0.625rem] leading-tight" : "text-xs leading-snug",
        )}
      >
        {compact ? captionPreview(post.caption, previewLength) : captionPreview(post.caption, 30)}
      </span>
      {isSaving ? (
        <Loader2 className="h-3 w-3 shrink-0 animate-spin text-gold" aria-hidden />
      ) : null}
    </button>
  );
}

export function ContentCalendar({
  posts,
  initialMonth,
  movingPostId = null,
  draggingId = null,
  dropTargetKey = null,
  reschedulingId = null,
  canReschedule = () => true,
  onCancelMove,
  onRescheduleToDay,
  onStartMove,
  onScheduleEmptyDay,
  onDragStart,
  onDragEnd,
  onDragOverDay,
  onDragLeaveDay,
  onDropOnDay,
}: ContentCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(initialMonth ?? new Date()));
  const [detailPost, setDetailPost] = useState<ContentCalendarPost | null>(null);
  const [dayPostsModal, setDayPostsModal] = useState<{
    day: Date;
    posts: ContentCalendarPost[];
  } | null>(null);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const canDrag = useMediaQuery("(min-width: 768px) and (pointer: fine)");

  const monthGrid = useMemo(() => buildMonthGrid(month), [month]);
  const postsByDay = useMemo(() => groupPostsByDay(posts), [posts]);
  const todayKey = dayKey(new Date());
  const visibleMonth = month.getMonth();
  const isMoveMode = Boolean(movingPostId);
  const maxChipsPerDay = isMobile ? 1 : 2;
  const previewLength = isMobile ? 14 : 30;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMoveMode) {
        onCancelMove?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMoveMode, onCancelMove]);

  function goToPreviousMonth() {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function handleDayActivate(day: Date, dayPosts: ContentCalendarPost[]) {
    if (isMoveMode) {
      onRescheduleToDay?.(day);
      return;
    }
    if (isMobile && dayPosts.length > 1) {
      setDayPostsModal({ day, posts: dayPosts });
    }
  }

  return (
    <>
      {isMoveMode ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-cream px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-gold" aria-hidden />
            <p className="text-sm text-near-black">
              <span className="font-medium">Tap a day</span> to move this post
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelMove}
            className="shrink-0 text-sm font-medium text-gray-body transition hover:text-near-black"
          >
            Cancel
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-black/[0.06] bg-white p-3 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4">
          <TextureButton
            type="button"
            variant="minimal"
            size="sm"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </TextureButton>

          <h3 className="truncate text-center font-playfair text-lg italic text-near-black sm:text-2xl">
            {formatMonthHeading(month)}
          </h3>

          <TextureButton
            type="button"
            variant="minimal"
            size="sm"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </TextureButton>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-0.5 sm:mb-2 sm:gap-2">
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={label}
              className="py-1 text-center text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-gray-label sm:text-[0.65rem] sm:tracking-[0.12em]"
            >
              <span className="sm:hidden">{WEEKDAY_LABELS_SHORT[index]}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
          {monthGrid.map((day) => {
            const key = dayKey(day);
            const dayPosts = postsByDay.get(key) ?? [];
            const visiblePosts = dayPosts.slice(0, maxChipsPerDay);
            const overflowCount = dayPosts.length - visiblePosts.length;
            const isCurrentMonth = day.getMonth() === visibleMonth;
            const isToday = key === todayKey;
            const isDropTarget = dropTargetKey === key;
            const isMoveTarget = isMoveMode && isCurrentMonth;

            return (
              <div
                key={key}
                role={isMoveMode ? "button" : undefined}
                tabIndex={isMoveMode ? 0 : undefined}
                onKeyDown={(event) => {
                  if (!isMoveMode) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleDayActivate(day, dayPosts);
                  }
                }}
                onClick={() => handleDayActivate(day, dayPosts)}
                onDragOver={(event) => {
                  if (!draggingId) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  onDragOverDay?.(key);
                }}
                onDragLeave={(event) => {
                  onDragLeaveDay?.(key, event);
                }}
                onDrop={(event) => {
                  event.stopPropagation();
                  onDropOnDay?.(day, event);
                }}
                className={cn(
                  "flex min-h-[72px] flex-col rounded-lg border p-1 transition-colors sm:min-h-[108px] sm:rounded-xl sm:p-2 md:min-h-[124px] md:p-2.5",
                  isCurrentMonth ? "bg-cream/40" : "bg-cream/15",
                  isToday ? "border-gold/40" : "border-black/[0.06]",
                  isDropTarget && "border-gold bg-gold/5 ring-2 ring-gold/30",
                  isMoveTarget &&
                    "cursor-pointer border-gold/35 hover:border-gold hover:bg-gold/5",
                )}
              >
                <div className="mb-1 flex items-center justify-center sm:mb-2 sm:justify-start">
                  <span
                    className={cn(
                      "text-[0.7rem] font-medium sm:text-xs",
                      isToday
                        ? "flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[0.65rem] text-white sm:h-6 sm:w-6 sm:text-xs"
                        : isCurrentMonth
                          ? "text-near-black"
                          : "text-gray-label",
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-1 sm:gap-1.5">
                  {visiblePosts.map((post) => {
                    const movable = canReschedule(post);
                    const isDragging = draggingId === post.id;
                    const isMoving = movingPostId === post.id;
                    const isSaving = reschedulingId === post.id;

                    return (
                      <PostChip
                        key={post.id}
                        post={post}
                        compact={isMobile}
                        draggable={canDrag && movable && !isSaving && !isMoveMode}
                        isDragging={isDragging}
                        isMoving={isMoving}
                        isSaving={isSaving}
                        previewLength={previewLength}
                        onOpen={() => {
                          if (isMoveMode) return;
                          setDetailPost(post);
                        }}
                        onDragStart={(event) => {
                          if (!movable || !canDrag) return;
                          event.stopPropagation();
                          event.dataTransfer.setData(POST_ID_MIME, post.id);
                          event.dataTransfer.setData("text/plain", post.id);
                          event.dataTransfer.effectAllowed = "move";
                          onDragStart?.(post.id);
                        }}
                        onDragEnd={() => onDragEnd?.()}
                      />
                    );
                  })}

                  {overflowCount > 0 ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDayPostsModal({ day, posts: dayPosts });
                      }}
                      className="px-0.5 text-left text-[0.6rem] font-medium text-gold sm:px-1 sm:text-[0.65rem] sm:text-gray-label sm:hover:text-gold"
                    >
                      +{overflowCount} more
                    </button>
                  ) : null}

                  {dayPosts.length === 0 && !isMoveMode ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onScheduleEmptyDay?.(day);
                      }}
                      className="mt-auto flex h-6 w-full items-center justify-center rounded-md border border-dashed border-black/[0.08] text-gray-label transition hover:border-gold/40 hover:bg-white hover:text-gold sm:h-7 sm:rounded-lg"
                      aria-label={`Schedule a post for ${day.toLocaleDateString()}`}
                    >
                      <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detailPost ? (
        <PostDetailModal
          post={detailPost}
          canMove={canReschedule(detailPost)}
          onClose={() => setDetailPost(null)}
          onMove={() => {
            onStartMove?.(detailPost.id);
            setDetailPost(null);
          }}
        />
      ) : null}

      {dayPostsModal ? (
        <DayPostsModal
          day={dayPostsModal.day}
          posts={dayPostsModal.posts}
          onClose={() => setDayPostsModal(null)}
          onOpenPost={(post) => {
            setDayPostsModal(null);
            setDetailPost(post);
          }}
        />
      ) : null}
    </>
  );
}

export { MOCK_CALENDAR_POSTS } from "@/lib/calendar/mock-posts";
export type { ContentCalendarPost } from "@/lib/calendar/content-calendar";
