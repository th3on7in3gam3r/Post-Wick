export const WEEKLY_SCHEDULE_LIMIT_MESSAGE =
  "You've reached your plan's weekly autopilot limit for this brand. Upgrade for more posts per week.";

export class WeeklyScheduleLimitError extends Error {
  constructor(message = WEEKLY_SCHEDULE_LIMIT_MESSAGE) {
    super(message);
    this.name = "WeeklyScheduleLimitError";
  }
}
