const SLOT_DAYS = [1, 3, 5]; // Monday, Wednesday, Friday
const SLOT_HOUR = 10;

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
