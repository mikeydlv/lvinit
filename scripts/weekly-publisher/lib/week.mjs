// ---------------------------------------------------------------------------
// WEEK — which Monday-to-Sunday week a run plans, always in Las Vegas time
//
// The run is scheduled Sunday 8:00 PM Pacific, so on Saturday or Sunday it
// plans the week that starts the next day. Monday through Friday (a missed
// Sunday run catching up at the next startup) it plans the current week.
// Same rule as the Executive Producer's weekly.mjs, so both land on one week.
// ---------------------------------------------------------------------------

export const TZ = "America/Los_Angeles";
export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Calendar date (YYYY-MM-DD) in Las Vegas for an instant. */
export function laDate(now = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function mondayOf(now = new Date()) {
  const today = laDate(now);
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  if (dow === 0) return addDays(today, 1);
  if (dow === 6) return addDays(today, 2);
  return addDays(today, -(dow - 1));
}

export function assertMonday(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || new Date(`${iso}T00:00:00Z`).getUTCDay() !== 1) {
    throw new Error(`--week must be a Monday in YYYY-MM-DD form (got "${iso}").`);
  }
  return iso;
}

/** [{ day: "Monday", date: "2026-09-28", label: "Mon, Sep 28" }, …] */
export function weekDays(monday) {
  return DAY_NAMES.map((day, i) => {
    const date = addDays(monday, i);
    const label = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
    return { day, date, label };
  });
}

export function longDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export function pacificStamp(now = new Date()) {
  return `${now.toLocaleString("en-US", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" })} Pacific`;
}
