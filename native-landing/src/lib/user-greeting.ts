export function userFirstName(firstName?: string | null, fullName?: string | null) {
  const first = firstName?.trim();
  if (first) return first;
  const full = fullName?.trim();
  if (!full) return null;
  return full.split(/\s+/)[0] ?? null;
}

export function sidebarWelcomeLabel(hasBrands: boolean, firstName?: string | null) {
  const prefix = hasBrands ? "Welcome back" : "Welcome";
  return firstName ? `${prefix}, ${firstName}` : prefix;
}

export function greetingForHour(hour: number, firstName?: string | null) {
  const period = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return firstName ? `${period}, ${firstName}` : period;
}
