// ---------------------------------------------------------------------------
// FOOTAGE — which existing clips go under Mikey's A-roll
//
// The default production is a 30–60 second talking head from the office with
// existing B-roll laid over it. For each candidate this ranks the sanitized
// catalog and returns:
//
//   clips        the best B-roll, at most two per folder so the edit has
//                variety (drone establishing shot + ground detail)
//   coverage     how many clips genuinely fit (drives the "reuse" score and
//                whether new filming could ever be justified)
//   readyShorts  Shorts already cut from a related published video
//   carousel     graphics/thumbnails from the related video project
//
// Only facts from the catalog are used: folder, place, area, subject from the
// file name, camera, orientation, duration, time of day. Nothing in the frame
// is guessed at.
// ---------------------------------------------------------------------------

const BROLL_ROLES = new Set(["b-roll", "photo"]);

function tokens(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

export function scoreClip(clip, cand) {
  let s = 0;
  const why = [];
  const areas = cand.areas ?? [];
  if (clip.area && areas.includes(clip.area)) {
    s += 4;
    why.push(clip.place ?? clip.area);
  } else if (areas.includes("valley-wide") && ["valley-wide", "strip"].includes(clip.area)) {
    s += 2;
    why.push(clip.place ?? "valley-wide");
  } else if (areas.includes("valley-wide") && clip.area) {
    s += 1;
  }
  const hay = new Set(tokens(`${clip.subject ?? ""} ${clip.place ?? ""} ${clip.folder}`));
  const hits = [...new Set([...(cand.keywords ?? []), ...(cand.footageWords ?? [])])].filter((k) => hay.has(k));
  if (hits.length) {
    s += Math.min(9, hits.length * 3);
    why.push(`matches "${hits.slice(0, 3).join(", ")}"`);
  }
  if (clip.type === "video") {
    if (clip.camera === "drone") {
      s += 1.5;
      why.push("drone");
    }
    if (clip.timeOfDay === "golden-hour" || clip.timeOfDay === "sunrise") {
      s += 1;
      why.push(clip.timeOfDay);
    }
    if (clip.orientation === "vertical") {
      s += 1;
      why.push("already 9:16");
    }
    const d = clip.durationSec ?? 0;
    if (d >= 4 && d <= 180) s += 0.5;
    if (d > 300) s -= 1; // long raw takes need scrubbing
    if (d > 600) s -= 1;
  } else {
    s -= 1; // stills are a fallback under talking-head video
  }
  return { score: Math.round(s * 10) / 10, why };
}

/** Extra catalog vocabulary implied by what the video is about. */
export function footageWordsFor(cand, config) {
  const text = `${cand.title} ${(cand.headings ?? []).slice(0, 6).join(" ")}`;
  return [...new Set((config.producer.conceptFootage ?? []).filter((c) => c.re.test(text)).flatMap((c) => c.words))];
}

export function matchFootage(cand, catalog, config, { limit = 8 } = {}) {
  cand = { ...cand, footageWords: footageWordsFor(cand, config) };
  const items = (catalog?.items ?? []).filter((c) => !c.duplicateOf);
  const ranked = items
    .filter((c) => BROLL_ROLES.has(c.role))
    .map((c) => ({ c, ...scoreClip(c, cand) }))
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score || (b.c.durationSec ?? 0) - (a.c.durationSec ?? 0));

  // A comparison needs every side on screen: seed one strong clip per named
  // area first, then fill by score.
  const named = (cand.areas ?? []).filter((a) => a !== "valley-wide");
  const seeded = [];
  if (named.length > 1) {
    for (const area of named) {
      const best = ranked.find((x) => x.c.area === area && !seeded.includes(x));
      if (best) seeded.push(best);
    }
  }
  const ordered = [...seeded, ...ranked.filter((x) => !seeded.includes(x))];

  const perFolder = new Map();
  const clips = [];
  for (const x of ordered) {
    const n = perFolder.get(x.c.folder) ?? 0;
    if (n >= 2) continue;
    perFolder.set(x.c.folder, n + 1);
    clips.push({
      id: x.c.id,
      path: x.c.path,
      place: x.c.place ?? null,
      area: x.c.area ?? null,
      camera: x.c.camera ?? null,
      orientation: x.c.orientation ?? null,
      durationSec: x.c.durationSec ?? null,
      timeOfDay: x.c.timeOfDay ?? null,
      subject: x.c.subject ?? null,
      caution: x.c.caution ?? null,
      score: x.score,
      why: x.why.join(", "),
    });
    if (clips.length >= limit) break;
  }
  const coverage = ranked.filter((x) => x.score >= 5).length;

  const project = cand.video?.localProject;
  const carousel = project
    ? items.filter((c) => (c.role === "graphic" || c.role === "thumbnail") && c.path.startsWith(project + "/")).slice(0, 6).map((c) => c.path)
    : [];
  return {
    clips,
    coverage,
    covered: coverage >= config.producer.minClipsForCoverage,
    readyShorts: (cand.video?.shortPaths ?? []).slice(0, 6),
    carousel,
  };
}

/** Reuse score, 1–5, from how well the library covers the idea. */
export function reuseScore(match) {
  if (match.readyShorts.length && match.coverage >= 3) return 5;
  if (match.coverage >= 6) return 5;
  if (match.coverage >= 3) return 4;
  if (match.coverage >= 1) return 3;
  if (match.clips.length) return 2;
  return 1;
}
