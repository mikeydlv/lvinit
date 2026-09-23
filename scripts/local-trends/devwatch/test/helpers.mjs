// Test helpers — synthetic items only.
import { loadDevConfig } from "../config.mjs";
import { inventoryFrom } from "../../lib/inventory.mjs";

export const TODAY = "2026-09-22";
export const config = loadDevConfig();

let n = 0;
/** A normalized, authority-tagged item, as triage() would produce. */
export function item(over = {}) {
  n += 1;
  return {
    id: over.id ?? `c-test${n}`,
    title: "Untitled",
    url: `https://news.example.com/story-${n}`,
    published: `${TODAY}T15:00:00.000Z`,
    snippet: "",
    sourceName: "Las Vegas Review-Journal",
    sourceDomain: "reviewjournal.com",
    via: "rj-business",
    tier: "news",
    authority: 8,
    authorityClass: "secondary",
    topics: ["residential"],
    areas: ["summerlin"],
    ...over,
  };
}

/** A raw feed item, before normalization. */
export function raw(over = {}) {
  n += 1;
  return {
    title: "Untitled",
    url: `https://news.example.com/raw-${n}?utm_source=x`,
    published: `${TODAY}T15:00:00.000Z`,
    snippet: "",
    sourceName: "Las Vegas Review-Journal — Business",
    sourceDomain: "reviewjournal.com",
    via: "rj-business",
    tier: "news",
    ...over,
  };
}

export function entity(over = {}) {
  return { id: "DEV-TEST", name: "Test Project", aliases: ["Test Project"], contextAliases: [], area: "summerlin", type: "residential", origin: "seed", routes: [], roster: [], baseline: null, ...over };
}

/** A small, fake coverage set so tests do not depend on the live site. */
export function coverage({ pages = [], rosters = [], texts = {} } = {}) {
  const inv = inventoryFrom({ pages: [{ route: "/neighborhoods/summerlin", title: "Summerlin" }, { route: "/neighborhoods/henderson", title: "Henderson" }, { route: "/neighborhoods/southwest-las-vegas", title: "Southwest Las Vegas" }, ...pages], videos: [] });
  return { pages: inv.pages, routes: inv.routes, rosters, textByRoute: new Map(Object.entries(texts)) };
}

export const emptyState = () => ({ projects: {}, events: {}, seen: {}, sources: { sources: {}, legistar: { events: {} }, entityQueries: {} } });
export const published = (fps = []) => ({ available: true, reason: "test", fingerprints: new Map(fps.map((f) => [f, { sha: "abc", date: TODAY }])) });
