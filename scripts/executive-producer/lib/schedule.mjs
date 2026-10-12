// ---------------------------------------------------------------------------
// SCHEDULE — the permanent weekly mix (Mikey, 2026-10-12)
//
//   Mon carousel · Tue short video · Wed carousel · Thu short video
//   Fri carousel · Sat short video · Sun no social post
//
// 3 carousels + 3 finished short videos. Every step that used to assume
// "seven posts, Monday–Sunday" reads this instead.
// ---------------------------------------------------------------------------

export const WEEK_MIX = [
  { day: "Mon", format: "carousel" },
  { day: "Tue", format: "short" },
  { day: "Wed", format: "carousel" },
  { day: "Thu", format: "short" },
  { day: "Fri", format: "carousel" },
  { day: "Sat", format: "short" },
];
export const POST_DAYS = WEEK_MIX.map((s) => s.day);
export const NO_POST_DAYS = ["Sun"];
export const formatFor = (day) => WEEK_MIX.find((s) => s.day === day)?.format ?? null;
/** "montage" is the older name for a short video. */
export const isVideo = (p) => p?.format === "short" || p?.format === "montage";
export const formatOf = (p) => (isVideo(p) ? "short" : "carousel");
export const MIX_LABEL = "3 carousels (Mon/Wed/Fri) + 3 short videos (Tue/Thu/Sat), no Sunday post";

/**
 * Put planned posts on their days by format, in plan order: carousels on
 * Mon/Wed/Fri, shorts on Tue/Thu/Sat. Returns { posts, missing } where
 * missing are the slots nothing could fill (they get written separately).
 */
export function assignToSlots(planned) {
  const pools = { carousel: planned.filter((p) => !isVideo(p)), short: planned.filter(isVideo) };
  const posts = [];
  const missing = [];
  for (const slot of WEEK_MIX) {
    const p = pools[slot.format].shift();
    if (p) posts.push({ ...p, day: slot.day, format: slot.format });
    else missing.push(slot);
  }
  return { posts, missing, extra: [...pools.carousel, ...pools.short] };
}

/** First backup of the right format (removed from the list), or null. */
export function takeBackup(backups, format) {
  const i = backups.findIndex((b) => formatOf(b) === format);
  return i < 0 ? null : backups.splice(i, 1)[0];
}
