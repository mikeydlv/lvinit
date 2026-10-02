// ---------------------------------------------------------------------------
// INTERNAL-LINK SUGGESTIONS — proposals inside the draft, nothing applied
//
// This is not the Internal Linking Agent. It never edits a published page. It
// only proposes, for the one draft it produced:
//
//   outbound   existing pages the new / updated copy should link to: the
//              cluster's parent hub or area pillar, the closest related pages,
//              and pages the video itself keeps naming
//   inbound    existing pages that would naturally link TO a new article —
//              listed for the Publisher (who links a new article properly) and
//              for the Internal Linking Agent's next run. Not applied here.
//
// Every anchor is checked against the shared Fair Housing rules.
// ---------------------------------------------------------------------------

import { entityInfo } from "../../content-briefs/lib/intent.mjs";

import { NEW_URL_ACTIONS } from "../config.mjs";
import { fairHousing } from "./compliance.mjs";

/** Cluster → the page that anchors it today (CLAUDE.md / cluster map). */
export const CLUSTER_PARENTS = {
  relocation: "/guides/moving-to-las-vegas",
  "rent-vs-buy": "/guides/moving-to-las-vegas",
  "neighborhood-orientation": null,
  "area-comparison": "/guides/summerlin-vs-henderson-vs-southwest-las-vegas",
  "new-vs-resale": "/guides/new-build-vs-resale-las-vegas",
  "cost-of-housing": "/guides/las-vegas-down-payment-assistance-programs-2026",
  market: "/guides/is-las-vegas-a-buyers-market",
  development: null,
};

const anchorFor = (page) => String(page.title ?? page.route).replace(/\s*[|:—–-]\s*(LVINIT|A Local.*)$/i, "").trim();

function placementFor(route, entityKey, sections) {
  if (!entityKey) return null;
  const sec = (sections ?? []).find((s) => s.headingSource !== "opening" && (s.entities ?? []).includes(entityKey));
  return sec ? `section ${sec.order}: "${sec.heading}"` : null;
}

/**
 * @returns {{outbound:Array, inbound:Array, notes:string[]}}
 */
export function suggestLinks({ action, target, proposedRoute, group, overlap, inventory, sections, config }) {
  const self = proposedRoute ?? target ?? null;
  const outbound = [];
  const add = (page, relation, reason, entityKey = null) => {
    if (!page || page.route === self || outbound.some((l) => l.route === page.route)) return;
    const anchor = anchorFor(page);
    const fh = fairHousing(anchor);
    outbound.push({
      route: page.route,
      title: page.title,
      relation,
      anchorSuggestion: fh.blocked ? null : anchor,
      anchorBlocked: fh.blocked ? { category: fh.category, matched: fh.matched } : null,
      placement: placementFor(page.route, entityKey, sections) ?? (relation === "parent" ? "in the intro, where the article sets up the bigger decision" : "where the copy first touches this topic"),
      reason,
    });
  };

  const parentRoute = CLUSTER_PARENTS[group.cluster] ?? null;
  if (parentRoute && inventory.byRoute.has(parentRoute)) add(inventory.byRoute.get(parentRoute), "parent", `anchors the ${group.cluster} cluster`);

  for (const key of group.places ?? []) {
    const info = entityInfo(key);
    const pillar = info ? inventory.byRoute.get(`/neighborhoods/${info.slug}`) : null;
    if (pillar) add(pillar, "pillar", `the area pillar for ${info.label}`, key);
  }

  // Related pages: substantial ones always; at most two adjacent ones, and only
  // clearly adjacent (a borderline score is a shared word, not a reader path).
  let adjacentAdded = 0;
  for (const m of overlap.topMatches ?? []) {
    if (m.relation === "distinct" || m.route === self) continue;
    if (m.relation === "adjacent" && (adjacentAdded >= 2 || m.overlap < 0.35)) continue;
    const before = outbound.length;
    add(inventory.byRoute.get(m.route), m.label.toLowerCase(), `${m.label} to this video's question (overlap ${m.overlap}) — link to it and stay distinct from it`);
    if (m.relation === "adjacent" && outbound.length > before) adjacentAdded += 1;
  }

  // Pages the video keeps naming.
  for (const key of (group.dominantEntities ?? []).filter((k) => !k.startsWith("facet:"))) {
    const info = entityInfo(key);
    if (!info) continue;
    const page = inventory.pages.find((p) => p.route.split("/").pop() === info.slug || p.route.endsWith(`/${info.slug}`) || (p.profile?.[key]?.route && p.route.startsWith("/neighborhoods/")));
    if (page) add(page, "mentioned", `the video names ${info.label} ${group.transcriptEntities?.[key] ?? "several"} times`, key);
  }

  const inbound = NEW_URL_ACTIONS.has(action)
    ? outbound
        .filter((l) => ["parent", "pillar", "adjacent", "substantial"].includes(l.relation))
        .map((l) => ({
          from: l.route,
          reason: l.relation === "parent" ? "the hub should point readers to its supporting piece" : "a related page whose readers have this exact next question",
          appliedBy: "Publisher (new article linking) / Internal Linking Agent (later back-links) — not this pipeline",
        }))
    : [];

  return {
    outbound: outbound.slice(0, config.draft.maxLinks),
    inbound,
    conversion: [
      { route: "/search", reason: "standing Search Homes CTA" },
      { route: "/contact", reason: "standing Contact CTA" },
    ],
    notes: ["Suggestions only. This pipeline never edits a published page; final link implementation is the Publisher's."],
  };
}
