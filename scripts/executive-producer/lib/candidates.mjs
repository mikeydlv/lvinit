// ---------------------------------------------------------------------------
// CANDIDATES — what Mikey COULD say on camera this week
//
// Deliberately not news-first. Candidates come from:
//
//   page     every published LVINIT page: a 45-second take on something Mikey
//            already researched and stands behind
//   video    a published YouTube video with no companion page: re-cut one
//            strong point as a talking-head Short
//   search   a real question people typed into Google that LVINIT ranks for
//            but doesn't answer head-on
//   trend    a Local Trend Agent topic (background research; capped at one
//            pick a week, and only if people would actually care)
//
// A cheap rules pass pre-scores them so the judgment step only sees a short
// list. The pre-score is a triage, not the recommendation: the model (or the
// sample judgment) decides with the spouse test and the full scoring.
// ---------------------------------------------------------------------------

import { daysBetween } from "./inputs.mjs";

const AREA_PATTERNS = [
  ["summerlin", /summerlin|red rock/i],
  ["henderson", /henderson|green valley|inspirada|lake las vegas|water street|fiesta|four seasons|macdonald/i],
  ["southwest", /southwest|enterprise|southern highlands|mountains? ?edge|durango|sohi/i],
  ["north-las-vegas", /north las vegas|tule springs|sandstone|civic center|aliante/i],
  ["northwest", /northwest|monument hills|skye canyon|centennial/i],
  ["downtown", /downtown|arts district|fremont/i],
  ["strip", /\bthe strip\b|las vegas strip/i],
];

export function areasFor(text) {
  const found = AREA_PATTERNS.filter(([, re]) => re.test(text)).map(([a]) => a);
  return found.length ? found : ["valley-wide"];
}

const STOP = new Set("the a an and or of in to for is are you your it its what why how does do don't dont not with from this that on at be by vs las vegas nevada 2026 2025 new guide actually really should which where here".split(" "));

export function keywordsFor(text, limit = 12) {
  const words = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9$% ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP.has(w));
  return [...new Set(words)].slice(0, limit);
}

/** Title/heading language that matches what performs for LVINIT (the Summerlin vs Henderson pattern). */
export function formatSignals(text) {
  const t = String(text).toLowerCase();
  const s = [];
  if (/\bvs\.?\b|versus|compare|comparison| or /.test(t)) s.push({ format: "neighborhood debate", pts: 20 });
  if (/don'?t|myth|actually|really|why aren'?t|may not|mistake|nobody|truth|wrong/.test(t)) s.push({ format: "myth vs reality", pts: 15 });
  if (/new build|new-build|resale|rent first|buy first|down payment|20%|incentive/.test(t)) s.push({ format: "relocation decision", pts: 12 });
  if (/cost|tax|hoa|fee|lid|sid|afford|utilit|bill/.test(t)) s.push({ format: "hidden cost", pts: 10 });
  if (/summer|heat|first|daily life|commute|weekend|parade/.test(t)) s.push({ format: "lifestyle difference", pts: 8 });
  return s;
}

const CATEGORY_POINTS = {
  Comparisons: 15,
  "Buyer Guide": 10,
  "Cost of Living": 10,
  "Moving Here": 10,
  Neighborhoods: 6,
  "Local Feature": 3,
  "Market Watch": -5, // "generic market update" risk; the myth angle can still win it back
};

function recentlyPicked(history, { id, routes }, today, weeks) {
  for (const h of history) {
    if (!h.date || daysBetween(h.date, today) > weeks * 7) continue;
    for (const p of h.picks) {
      if (p.candidateId === id) return h.date;
      if (routes.length && p.sourceRoutes?.some((r) => routes.includes(r))) return h.date;
    }
  }
  return null;
}

function demandFor(search, route, words) {
  return search.queries
    .filter((q) => q.landingPage === route || keywordsFor(q.query).filter((w) => words.includes(w)).length >= 2)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 4);
}

export function buildCandidates({ inputs, config, today }) {
  const cfg = config.producer;
  const { pages, inventory, trends, search, history } = inputs;
  const videos = inventory?.videos ?? [];
  const out = [];

  const videoFor = (route) => videos.find((v) => v.embeddedOn.includes(route)) ?? null;
  const videoInfo = (v) =>
    v && {
      youtubeId: v.youtubeId,
      title: v.title,
      url: v.url,
      readyShorts: v.localAssets?.shorts ?? 0,
      shortPaths: v.localAssets?.shortPaths ?? [],
      localProject: v.localProject,
    };

  // --- pages ---------------------------------------------------------------
  for (const p of pages) {
    // Signals from the headline and dek only: body headings are too broad.
    const text = `${p.title} ${p.description ?? ""}`;
    const words = keywordsFor(`${p.title} ${p.description ?? ""}`);
    const v = videoFor(p.route);
    out.push({
      id: `page:${p.route}`,
      kind: "page",
      title: p.title,
      category: p.category ?? (p.route.startsWith("/neighborhoods/") ? "Neighborhoods" : null),
      route: p.route,
      areas: areasFor(`${p.route} ${p.title}`),
      keywords: words,
      headings: p.headings,
      excerpt: p.excerpt,
      sourceRoutes: [p.route],
      sourceText: p.fullText,
      video: videoInfo(v),
      demand: demandFor(search, p.route, words),
      formats: formatSignals(text).map((f) => f.format),
      _signals: formatSignals(text),
    });
  }

  // --- videos with no companion page ----------------------------------------
  for (const v of videos) {
    if (v.embeddedOn.length) continue;
    const words = keywordsFor(v.title ?? "");
    out.push({
      id: `video:${v.youtubeId}`,
      kind: "video",
      title: v.title,
      category: "Video",
      route: null,
      areas: v.area && v.area !== "valley-wide" ? [v.area] : areasFor(v.title ?? ""),
      keywords: words,
      headings: [],
      excerpt: `Published YouTube video: "${v.title}".`,
      sourceRoutes: [],
      sourceText: v.title ?? "",
      video: videoInfo(v),
      demand: demandFor(search, null, words),
      formats: formatSignals(v.title).map((f) => f.format),
      _signals: formatSignals(v.title),
    });
  }

  // --- search questions LVINIT ranks for but doesn't answer head-on -----------
  const covered = new Set(out.map((c) => c.route).filter(Boolean));
  const seen = new Set();
  for (const q of search.queries.sort((a, b) => b.impressions - a.impressions)) {
    if (q.landingPage && covered.has(q.landingPage) && q.landingPage !== "/") continue;
    const key = keywordsFor(q.query).sort().join(" ");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    // Ground it in the pages that share the most words with the question.
    const words = keywordsFor(q.query);
    const related = pages
      .map((p) => ({ p, n: words.filter((w) => `${p.title} ${p.description ?? ""}`.toLowerCase().includes(w)).length }))
      .filter((x) => x.n >= 1)
      .sort((a, b) => b.n - a.n)
      .slice(0, 2)
      .map((x) => x.p);
    out.push({
      id: `search:${key.replace(/\s+/g, "-").slice(0, 60)}`,
      kind: "search",
      title: q.query,
      category: "Search question",
      route: null,
      areas: areasFor(q.query),
      keywords: words,
      headings: related.flatMap((p) => p.headings.slice(0, 5)),
      excerpt: related.map((p) => `${p.title}: ${p.excerpt.slice(0, 500)}`).join("\n"),
      sourceRoutes: related.map((p) => p.route),
      sourceText: related.map((p) => p.fullText).join("\n"),
      video: null,
      demand: [q],
      formats: formatSignals(q.query).map((f) => f.format),
      _signals: formatSignals(q.query),
    });
    if (seen.size >= 6) break;
  }

  // --- trend topics (background research) -----------------------------------
  for (const t of trends.topics) {
    if (!["P1", "P2", "P3"].includes(t.priority ?? t.band)) continue;
    const text = `${t.name} ${t.whyItMatters ?? ""}`;
    out.push({
      id: `trend:${t.key}`,
      kind: "trend",
      title: t.name,
      category: t.category ?? "Trend",
      route: null,
      areas: areasFor(`${t.area ?? ""} ${t.name}`),
      keywords: keywordsFor(t.name),
      headings: [],
      excerpt: [t.whyItMatters, t.whyPeopleCare, t.status ? `Status: ${t.status}` : null, ...(t.sources ?? []).map((s) => `Source: ${s.sourceName}, "${s.title}" (${s.published})`)].filter(Boolean).join("\n"),
      sourceRoutes: (t.existingContent ?? []).map((e) => e.route).filter(Boolean).slice(0, 2),
      sourceText: [t.name, t.whyItMatters, t.statusEvidence, ...(t.sources ?? []).map((s) => s.title)].filter(Boolean).join("\n"),
      video: null,
      demand: [],
      isNews: t.kind === "project",
      trend: { priority: t.priority ?? t.band, total: t.total, status: t.status, rulesOnly: t.rulesOnly, sources: t.sources ?? [] },
      formats: formatSignals(text).map((f) => f.format),
      _signals: formatSignals(text),
    });
  }

  // --- pre-score --------------------------------------------------------------
  for (const c of out) {
    const reasons = [];
    let s = 30;
    for (const sig of c._signals) {
      s += sig.pts;
      reasons.push(`${sig.format} +${sig.pts}`);
    }
    const cat = CATEGORY_POINTS[c.category] ?? 0;
    if (cat) {
      s += cat;
      reasons.push(`${c.category} ${cat > 0 ? "+" : ""}${cat}`);
    }
    if (c.video?.readyShorts) {
      s += 6;
      reasons.push(`${c.video.readyShorts} Shorts already cut +6`);
    } else if (c.video) {
      s += 3;
      reasons.push("published video +3");
    }
    const impressions = c.demand.reduce((n, q) => n + (q.impressions ?? 0), 0);
    if (impressions) {
      const pts = Math.min(10, Math.round(Math.log10(impressions + 1) * 4));
      s += pts;
      reasons.push(`search demand (${impressions} impressions) +${pts}`);
    }
    if (c.kind === "trend") {
      const pts = c.trend.priority === "P1" ? 10 : c.trend.priority === "P2" ? 0 : -15;
      s += pts;
      reasons.push(`trend ${c.trend.priority} ${pts >= 0 ? "+" : ""}${pts}`);
      if (c.trend.rulesOnly) {
        s -= 10;
        reasons.push("trend judged rules-only −10");
      }
    }
    const repeat = recentlyPicked(history, { id: c.id, routes: c.sourceRoutes }, today, cfg.repeatWindowWeeks);
    if (repeat) {
      s -= 40;
      reasons.push(`already recommended ${repeat} −40`);
      c.recentlyPicked = repeat;
    }
    c.prescore = s;
    c.prescoreReasons = reasons;
    delete c._signals;
  }
  return out.sort((a, b) => b.prescore - a.prescore);
}

/** The short list the judgment step sees: best pre-scores, no more than 3 news items or 3 market updates. */
export function shortlist(candidates, config) {
  const n = config.producer.shortlist;
  const picked = [];
  let news = 0;
  let market = 0;
  for (const c of candidates) {
    if (picked.length >= n) break;
    if (c.recentlyPicked) continue;
    if (c.kind === "trend" && news >= 3) continue;
    if (c.category === "Market Watch" && market >= 3) continue;
    if (c.kind === "trend") news += 1;
    if (c.category === "Market Watch") market += 1;
    picked.push(c);
  }
  return picked;
}
