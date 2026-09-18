// ---------------------------------------------------------------------------
// SCORE — totals, the new-filming decision, and the four picks
//
// All computed in code:
//   ease    5 when it's office A-roll over existing B-roll; 2 if field filming
//   reuse   from the footage match (footage.mjs reuseScore)
//   total   weighted 0–100, weights in config.producer.weights (Mikey's
//           priority order: engagement > followers > shares > saves > DMs >
//           trust > ease > reuse)
//
// New filming is YES only when the model asked for it, the idea is
// exceptional (total ≥ exceptionalScore) AND the library can't cover it.
// Otherwise it's NO, and the brief says why.
// ---------------------------------------------------------------------------

import { reuseScore } from "./footage.mjs";

export function weightedTotal(scores, weights) {
  let num = 0;
  let den = 0;
  for (const [k, w] of Object.entries(weights)) {
    if (scores[k] === undefined || scores[k] === null) continue;
    num += w * scores[k];
    den += w * 5;
  }
  return den ? Math.round((num / den) * 100) : 0;
}

/** Minutes to record one piece of A-roll: setup, 3–4 takes, resets. */
export function recordingMinutes(spokenSeconds) {
  const s = Math.min(75, Math.max(30, spokenSeconds || 50));
  return Math.round(6 + s / 10);
}

export function finalize(assessments, matches, config) {
  const p = config.producer;
  return assessments.map((a) => {
    const match = matches.get(a.candidateId);
    const reuse = reuseScore(match);
    const base = { ...a.scores, reuse, ease: 5 };
    const provisional = a.scores ? weightedTotal(base, p.weights) : null;
    let newFilming = { required: false, why: "", shots: [] };
    if (a.newFilmingRequest?.needed) {
      if (!match.covered && provisional !== null && provisional >= p.exceptionalScore) {
        newFilming = { required: true, why: a.newFilmingRequest.why, shots: a.newFilmingRequest.shots };
      } else {
        newFilming = {
          required: false,
          why: match.covered
            ? `Asked for new footage, but ${match.coverage} existing clips already cover it.`
            : `Asked for new footage, but the idea isn't strong enough (${provisional}/100) to justify a shoot.`,
          shots: [],
        };
      }
    }
    const scores = { ...base, ease: newFilming.required ? 2 : 5 };
    const total = a.scores ? weightedTotal(scores, p.weights) : null;
    return {
      ...a,
      scores,
      total,
      newFilming,
      recordingMinutes: recordingMinutes(a.spokenSeconds),
      footage: match,
    };
  });
}

/**
 * Four picks: best totals first (pre-score as a tiebreak and in rules-only
 * mode), no more than `maxPerFormat` of one format, at most `maxNewsPicks`
 * news items, and never two picks from the same source page.
 */
export function selectPicks(finalized, candidatesById, config) {
  const p = config.producer;
  const ranked = [...finalized].sort(
    (a, b) => (b.total ?? -1) - (a.total ?? -1) || (candidatesById.get(b.candidateId)?.prescore ?? 0) - (candidatesById.get(a.candidateId)?.prescore ?? 0),
  );
  const picks = [];
  const formats = new Map();
  const routes = new Set();
  let news = 0;
  const skipped = [];
  for (const a of ranked) {
    if (picks.length >= p.picks) break;
    const f = formats.get(a.format) ?? 0;
    if (f >= p.maxPerFormat) {
      skipped.push({ candidateId: a.candidateId, reason: `already ${f} "${a.format}" picks` });
      continue;
    }
    if (a.isNews && news >= p.maxNewsPicks) {
      skipped.push({ candidateId: a.candidateId, reason: "news cap reached" });
      continue;
    }
    if (a.sourceRoutes.some((r) => routes.has(r))) {
      skipped.push({ candidateId: a.candidateId, reason: "same source page as a stronger pick" });
      continue;
    }
    // "Summerlin vs Henderson" and "Summerlin vs Henderson vs Southwest" are the
    // same video twice: same format, two or more of the same areas.
    const areasA = candidatesById.get(a.candidateId)?.areas ?? [];
    const twin = picks.find((q) => q.format === a.format && (candidatesById.get(q.candidateId)?.areas ?? []).filter((x) => x !== "valley-wide" && areasA.includes(x)).length >= 2);
    if (twin) {
      skipped.push({ candidateId: a.candidateId, reason: `too close to "${twin.title}"` });
      continue;
    }
    picks.push(a);
    formats.set(a.format, f + 1);
    a.sourceRoutes.forEach((r) => routes.add(r));
    if (a.isNews) news += 1;
  }
  const minutes = picks.reduce((n, a) => n + a.recordingMinutes, 0);
  const budgetNote =
    minutes > p.budget.max ? `About ${minutes} min of A-roll: over the ${p.budget.max}-minute budget. Record the top three and hold #4.` :
    minutes < p.budget.min ? `About ${minutes} min of A-roll: under budget, room for extra takes.` :
    `About ${minutes} min of A-roll: inside the ${p.budget.min}–${p.budget.max} minute budget.`;
  return { picks, skipped, minutes, budgetNote, runnersUp: ranked.filter((a) => !picks.includes(a)).slice(0, 3) };
}
