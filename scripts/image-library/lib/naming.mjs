// ---------------------------------------------------------------------------
// NAMING — SEO/AEO filenames that describe what is actually visible
//
//   lowercase, hyphen-separated, plain English, 3–10 words, no IDs, no camera
//   names, no keyword stuffing, and NO place name the evidence doesn't support.
// ---------------------------------------------------------------------------

import { PLACE_TERMS } from "../config.mjs";

const STUFFING = /\b(best|top|cheap|cheapest|buy|buying|sell|selling|for-sale|real-estate|realtor|homes-for-sale|luxury-real-estate|deal|deals|amazing|stunning|beautiful|gorgeous|dream)\b/;
const GENERIC = /^(img|dsc|dji|gopro|mvi|vid|video|frame|still|screenshot|image|photo|untitled|clip|export)(-|$)|\b(img|dsc|dji|gopro|mvi|vid|frame|still|clip)_?\d+\b|\b\d{4,}\b|\b(v\d+|final|copy|edit)\b/;

export function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Place terms appearing in a slug. */
export function placesIn(slug) {
  const s = `-${slug}-`;
  return PLACE_TERMS.filter((p) => s.includes(`-${p}-`));
}

/**
 * Which place terms the evidence allows: the folder's documented place, plus
 * any place Claude read on visible signage. Everything else is unproven.
 */
export function allowedPlaces({ place, signage = [] }) {
  const text = slugify([place ?? "", ...signage].join(" "));
  const allowed = new Set(placesIn(text));
  // A documented sub-place implies its city / area.
  if (allowed.has("inspirada") || allowed.has("macdonald-highlands") || allowed.has("green-valley") || allowed.has("lake-las-vegas")) allowed.add("henderson");
  if (allowed.has("grand-park") || allowed.has("downtown-summerlin") || allowed.has("mesa-ridge")) allowed.add("summerlin");
  if (allowed.has("sandstone") || allowed.has("tule-springs")) allowed.add("north-las-vegas");
  if (allowed.has("skye-canyon") || allowed.has("monument-hills") || allowed.has("centennial") || allowed.has("sunstone")) allowed.add("northwest");
  if (allowed.has("southern-highlands") || allowed.has("the-bend") || allowed.has("uncommons") || allowed.has("durango")) allowed.add("southwest");
  return allowed;
}

/** Returns { ok, slug, problems[] }. `evidence` = { place, signage[] }. */
export function checkSlug(raw, evidence) {
  const problems = [];
  const slug = slugify(raw).replace(/-(jpg|jpeg|png|webp)$/, "");
  const words = slug.split("-").filter(Boolean);
  if (words.length < 3) problems.push("too few words");
  if (words.length > 11 || slug.length > 90) problems.push("too long");
  if (STUFFING.test(slug.replace(/-/g, " ")) || STUFFING.test(slug)) problems.push("keyword stuffing / sales words");
  if (GENERIC.test(slug)) problems.push("generic or ID-like name");
  const counts = {};
  for (const w of words) if (w.length > 3) counts[w] = (counts[w] ?? 0) + 1;
  if (Object.values(counts).some((c) => c > 2)) problems.push("repeated words");
  const allowed = allowedPlaces(evidence);
  const unproven = placesIn(slug).filter((p) => !allowed.has(p));
  if (unproven.length) problems.push(`unproven place: ${unproven.join(", ")}`);
  return { ok: problems.length === 0, slug, problems };
}

/** First name in `names` that is free (not in `taken`); adds "-2", "-3"… only as a last resort. */
export function uniqueName(slug, taken) {
  if (!taken.has(slug)) return slug;
  for (let i = 2; i < 50; i++) if (!taken.has(`${slug}-${i}`)) return `${slug}-${i}`;
  throw new Error(`No free filename for ${slug}`);
}
