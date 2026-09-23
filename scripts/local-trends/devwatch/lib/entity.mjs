// ---------------------------------------------------------------------------
// ENTITY RESOLUTION — which project is this item about?
//
// In order:
//
//   1. a KNOWN project (seed, LVINIT roster, or one Development Watch has
//      tracked before) named by one of its aliases. Aliases are matched
//      case-sensitively as whole names, so "life time" in a sentence is not
//      the Life Time gym; context aliases also need their context word.
//   2. a Clark County agenda applicant: DEV-CC-<APPLICANT>-<PLANNING AREA>,
//      stable across every hearing of the same application.
//   3. a NAMED project the text introduces ("a community called X", "the X
//      master plan", “X”) — a new tracked project.
//   4. otherwise PROVISIONAL: keyed by area, topic and the headline's words.
//      Provisional projects are capped at Low confidence and never handed off.
//
// Nothing is invented: a provisional name is labelled as such.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

import { titleSimilarity, titleTokens } from "../../lib/classify.mjs";
import { aliasRegex, slugId } from "./coverage.mjs";

function caseSensitiveAlias(alias) {
  const esc = alias
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+(?:&|and)\s+/gi, " (?:&|and) ")
    .replace(/\s+/g, "\\s+")
    .replace(/'/g, "['’]");
  return new RegExp(`(?<![\\w-])${esc}(?![\\w-])`);
}

/**
 * Best known-entity match in an item's text.
 * @returns {{entity:object, alias:string, inTitle:boolean}|null}
 */
export function matchKnownEntity(item, entities) {
  const title = String(item.title ?? "");
  const body = `${item.snippet ?? ""} ${item.excerpt ?? ""}`;
  const all = `${title} ${body}`;
  const allCaps = item.via === "legistar";
  let best = null;
  for (const e of entities) {
    const candidates = [
      ...(e.aliases ?? []).map((alias) => ({ alias, requires: null })),
      ...(e.contextAliases ?? []).map((c) => ({ alias: c.alias, requires: c.requires })),
    ];
    for (const { alias, requires } of candidates) {
      if (!alias || alias.length < 4) continue;
      const re = allCaps ? aliasRegex(alias) : caseSensitiveAlias(alias);
      const inTitle = re.test(title);
      if (!inTitle && !re.test(body)) continue;
      if (requires && !requires.test(all)) continue;
      const score = alias.length + (inTitle ? 100 : 0) + (requires ? 0 : 5);
      if (!best || score > best.score) best = { entity: e, alias, inTitle, score };
    }
  }
  return best ? { entity: best.entity, alias: best.alias, inTitle: best.inTitle } : null;
}

// Capitalized words that are places, institutions, publishers or calendar
// words — never a project name by themselves.
const NOT_A_NAME = new Set(
  "Las Vegas North South East West Henderson Nevada Clark County City Council Commission Planning Zoning Summerlin Southwest Northwest Valley Southern Strip Downtown Boulevard Blvd Road Parkway Street Avenue Drive Highway Freeway Interstate The A An New Developer Developers Builder Builders Homes Home Project Plan Plans Mayor Board Commissioners Review-Journal Sun News KTNV Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December Update Report Photos Video Watch Breaking Exclusive Opinion LLC Inc Corp Company Group Partners Communities Community Housing Authority Department Office County's City's State Federal BLM NDOT RTC UNLV CCSD Metro Police Airport Harry Reid International Nellis Resort Casino Hotel Phoenix Arizona California Reno Utah Boulder Mesquite Laughlin Pahrump Proposed Planned Major Massive Huge Luxury Local Popular Historic Former Future Latest First Final Affordable Big Mixed-Use Council Crews Officials Commissioners"
    .split(" ")
);

/** Proper-name endings: "Gholson Landing", "Commercial Center", "Monument Hills". */
const NAME_SUFFIX = "(?:Center|Centre|Park|Commons|Station|Village|Plaza|District|Crossing|Heights|Ranch|Landing|Square|Towers?|Resort|Campus|Hills|Ridge|Springs|Canyon|Place|Pointe?|Gardens|Estates|Trails?|Vista|Terrace|Residences|Apartments|Lofts|Flats|Mesa|Highlands|Reserve|Preserve|Market|Yards|Collection|Walk|Row|Quarter)";

const DEV_NOUN = "(?:master[- ]planned community|master plan|community|project|development|subdivision|apartment complex|apartments|neighborhood|village|district|resort|campus|plaza|station|interchange|towers?|park|center|centre|crossing|commons)";

/** One capitalized word at the very start of a sentence is sentence case, not a name. */
function sentenceInitial(name, text) {
  return !name.includes(" ") && new RegExp(`(^|[.!?]\\s+)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text);
}

function isTitleCase(text) {
  const words = String(text).split(/\s+/).filter((w) => /^[A-Za-z]/.test(w) && w.length > 3);
  if (words.length < 4) return false;
  return words.filter((w) => /^[A-Z]/.test(w)).length / words.length > 0.6;
}

function cleanName(raw) {
  const words = String(raw ?? "")
    .replace(/['’]s$/, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  while (words.length && /^(the|a|an|at|of|and)$/i.test(words[0])) words.shift();
  while (words.length && /^(at|of|the|and|&)$/i.test(words.at(-1))) words.pop();
  const name = words.join(" ");
  // "Las Vegas-to-Phoenix" is two places, not a name: check hyphenated parts too.
  const parts = words.flatMap((w) => w.replace(/[’',.]/g, "").split("-"));
  // A place-type ending alone is not distinctive: "Casino Center" is a street, "Commercial Center" a place.
  const suffixWord = new RegExp(`^${NAME_SUFFIX}$`);
  const meaningful = parts.filter((w) => /^[A-Z0-9]/.test(w) && !NOT_A_NAME.has(w) && !suffixWord.test(w));
  if (!name || name.length < 4 || name.length > 60 || !meaningful.length) return null;
  // A street is where something is, not what it is.
  if (/\b(Boulevard|Blvd|Road|Rd|Street|St|Avenue|Ave|Parkway|Pkwy|Drive|Dr|Highway|Hwy|Lane|Ln|Way)\.?$/.test(name)) return null;
  return name;
}

/** "Casa" → "Casa de Shenandoah" when the text carries the full name. */
function extendName(name, text) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = String(text).match(new RegExp(`${esc}((?:\\s+(?:de|del|la|at|of|on)\\s+[A-Z][\\w'’-]+)+)`));
  return m ? `${name}${m[1]}` : name;
}

/**
 * A project name the text introduces, or null. Conservative: it would rather
 * return nothing than name a project "Las Vegas City Council".
 */
export function extractProjectName(item) {
  const title = String(item.title ?? "");
  const body = `${item.snippet ?? ""} ${item.excerpt ?? ""}`;
  const found = findName(title, body);
  return found ? extendName(found, `${title} ${body}`) : null;
}

function findName(title, body) {
  // A title-case headline capitalizes every word, so only the structural
  // patterns (quotes, "called X", "X, a … community") run on it.
  for (const text of [title, body]) {
    const titleCased = text === title && isTitleCase(title);
    const quoted = text.match(/[“"]([A-Z][^”"]{3,50})[”"]/);
    if (quoted) {
      const n = cleanName(quoted[1]);
      if (n && n.split(" ").length <= 6) return n;
    }
    const called = text.match(/\b(?:called|named|dubbed|known as|branded as|to be called)\s+((?:the\s+)?[A-Z][\w'’&.-]*(?:\s+(?:at|of|the|&|[A-Z][\w'’&.-]*)){0,5})/);
    if (called) {
      const n = cleanName(called[1]);
      if (n) return n;
    }
    // "Fixture Ridge, a 350-home community" / "Breaks Ground on Jewel, New Luxury Mixed-Use Community"
    const appositive = text.match(new RegExp(`\\b((?:[A-Z][\\w'’&.-]+\\s+(?:at\\s+|of\\s+)?){0,4}[A-Z][\\w'’&.-]+),\\s+(?:a|an|the|new|New)\\s+(?:[\\w$+,.-]+\\s+){0,5}(?:${DEV_NOUN}|Community|Project|Development)\\b`));
    if (appositive) {
      const n = cleanName(appositive[1].split(/\s+(?:on|at|of)\s+/i).at(-1));
      if (n && !sentenceInitial(n, text)) return n;
    }
    if (titleCased) continue;
    // "Gholson Landing", "the historic Commercial Center": a capitalized name with a place-name ending.
    // Lowercase connectors keep "Casa de Shenandoah" whole; a street ("Casino Center Boulevard") is not a project.
    // A landmark the project is NEAR ("near Sunset Park") is not the project.
    const suffixed = text.match(new RegExp(`(?<!\\b(?:near|by|off|beside|behind|next to|across from|adjacent to|(?:south|north|east|west) of)\\s)\\b((?:[A-Z][\\w'’&.-]+\\s+(?:at\\s+|of\\s+|de\\s+|del\\s+|la\\s+)?){0,4}${NAME_SUFFIX})\\b(?!\\s+(?:Blvd|Boulevard|Drive|Dr|Road|Rd|Street|St|Avenue|Ave|Parkway|Pkwy|Way|Lane|Ln)\\b)`));
    if (suffixed) {
      const n = cleanName(suffixed[1]);
      if (n && n.split(" ").length >= 2) return n;
    }
    // "the Fixture Commons mixed-use project", "Fixture Vista homes"
    const before = text.match(new RegExp(`\\b((?:[A-Z][\\w'’&.-]+\\s+(?:at\\s+|of\\s+|de\\s+|del\\s+|la\\s+)?){0,4}[A-Z][\\w'’&.-]+)\\s+(?:[a-z][\\w-]*\\s+){0,2}(?:${DEV_NOUN}|homes)\\b`));
    if (before) {
      const n = cleanName(before[1]);
      if (n && !sentenceInitial(n, text)) return n;
    }
  }
  return null;
}

/** Legistar titles: "TM-26-500098-ROOHANI KHUSROW FAMILY TRUST ET AL: TENTATIVE MAP ... within Enterprise." */
export function legistarApplicant(title) {
  const m = String(title ?? "").match(/^[A-Z]{2,4}-\d{2}-\d{3,7}(?:\s*\([^)]*\))?-([^:]{3,120}):/);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

export function legistarPlanningArea(title) {
  const m = String(title ?? "").match(/\bwithin (?:the )?([A-Z][A-Za-z -]+?)(?: Planning Area)?(?: \(|\.|,|$)/);
  return m ? m[1].trim() : null;
}

function shortHash(text) {
  return createHash("sha1").update(text).digest("hex").slice(0, 8).toUpperCase();
}

/**
 * Resolve every gate-passing item to an entity. New named or provisional
 * entities are created here (in memory); the state module persists them.
 *
 * @param items     gate-passing items (with areas, topics)
 * @param known     Map id → entity (seeds + roster + tracked)
 * @returns {{assignments: Map<string, {entityId, how, alias?}>, created: Map<string, object>}}
 */
export function resolveEntities(items, known, { areaLabel = (k) => k } = {}) {
  const assignments = new Map();
  const created = new Map();
  const knownList = [...known.values()];

  for (const it of items) {
    const m = matchKnownEntity(it, [...knownList, ...created.values()]);
    if (m) {
      assignments.set(it.id, { entityId: m.entity.id, how: m.entity.provisional ? "provisional" : "known", alias: m.alias });
      continue;
    }

    if (it.via === "legistar") {
      const applicant = legistarApplicant(it.title) ?? "UNKNOWN APPLICANT";
      const area = legistarPlanningArea(it.title) ?? "Clark County";
      const id = slugId(`CC ${applicant} ${area}`).slice(0, 56);
      if (!known.has(id) && !created.has(id)) {
        created.set(id, {
          id,
          name: `${area}: ${it.legistar?.summary ?? "agenda item"} (${applicant})`,
          aliases: [],
          contextAliases: [],
          area: it.areas?.[0] ?? null,
          jurisdiction: "Clark County",
          developer: applicant,
          type: it.topics?.[0] ?? null,
          origin: "legistar",
          provisional: false,
          routes: [],
          roster: [],
          baseline: null,
          matterFiles: [],
        });
      }
      assignments.set(it.id, { entityId: id, how: "agenda applicant" });
      continue;
    }

    const name = extractProjectName(it);
    if (name) {
      const id = slugId(name);
      const existing = known.get(id) ?? created.get(id);
      if (!existing) {
        created.set(id, { id, name, aliases: [name], contextAliases: [], area: it.areas?.[0] ?? null, jurisdiction: null, developer: null, type: it.topics?.[0] ?? null, origin: "discovered", provisional: false, routes: [], roster: [], baseline: null });
      }
      assignments.set(it.id, { entityId: id, how: "named in source" });
      continue;
    }

    // Provisional: the same story from another outlet should land on the same
    // provisional project, so compare headlines against provisional ones.
    const area = it.areas?.[0] ?? "valley";
    const twin = [...knownList, ...created.values()].find((e) => e.provisional && (e.area ?? "valley") === area && titleSimilarity(e.headline ?? e.name, it.title) >= 0.55);
    if (twin) {
      assignments.set(it.id, { entityId: twin.id, how: "provisional" });
      continue;
    }
    const tokens = titleTokens(it.title).slice(0, 4).join(" ");
    const id = `DEV-P-${shortHash(`${area}|${tokens}`)}`;
    if (!created.has(id) && !known.has(id)) {
      created.set(id, {
        id,
        name: `Unnamed ${String(it.topics?.[0] ?? "development").replace(/-/g, " ")} (${areaLabel(area)}) — "${it.title.slice(0, 90)}"`,
        headline: it.title,
        aliases: [],
        contextAliases: [],
        area,
        jurisdiction: null,
        developer: null,
        type: it.topics?.[0] ?? null,
        origin: "discovered",
        provisional: true,
        routes: [],
        roster: [],
        baseline: null,
      });
    }
    assignments.set(it.id, { entityId: id, how: "provisional" });
  }
  return { assignments, created };
}
