export const SLOT_HOUR = 10;
const SLOT_DAYS = [1, 3, 5]; // Monday, Wednesday, Friday

function isSlotDay(date: Date) {
  return SLOT_DAYS.includes(date.getDay());
}

function atSlotTime(date: Date) {
  const next = new Date(date);
  next.setHours(SLOT_HOUR, 0, 0, 0);
  return next;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function sameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function scheduleSlotOnDay(day: Date, hour = SLOT_HOUR) {
  const slot = new Date(day);
  slot.setHours(hour, 0, 0, 0);
  return slot.toISOString();
}

export function getNextScheduleSlot(existingScheduledAt: string[]): string {
  const taken = existingScheduledAt
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);

  for (let i = 0; i < 120; i += 1) {
    if (isSlotDay(cursor)) {
      const slot = atSlotTime(cursor);
      const occupied = taken.some((date) => sameDay(date, slot));
      if (!occupied && slot.getTime() > Date.now()) {
        return slot.toISOString();
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const fallback = atSlotTime(new Date());
  fallback.setDate(fallback.getDate() + 7);
  return fallback.toISOString();
}

export function formatScheduleLabel(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatScheduleTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Relative label within ±7 calendar days; absolute date beyond that. */
export function formatRelativeScheduleLabel(iso: string, now = new Date()) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / (24 * 60 * 60 * 1000),
  );
  const absDiff = Math.abs(diffDays);

  if (absDiff > 7) {
    return formatScheduleLabel(iso);
  }

  const time = formatScheduleTime(iso);

  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Tomorrow, ${time}`;
  if (diffDays === -1) return `Yesterday, ${time}`;
  if (diffDays > 1) return `In ${diffDays} days`;
  return `${absDiff} days ago`;
}

export function formatUpdatedAgo(updatedAt: number, now = Date.now()) {
  const minutes = Math.floor((now - updatedAt) / 60_000);
  if (minutes < 1) return "Updated just now";
  if (minutes === 1) return "Updated 1 min ago";
  return `Updated ${minutes} min ago`;
}
