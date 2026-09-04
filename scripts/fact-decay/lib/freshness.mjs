// ---------------------------------------------------------------------------
// FRESHNESS / STALENESS MODEL
//
// Staleness answers one question, and it is a different question from risk:
//
//   How likely is it that this claim has moved since anybody last checked it?
//
// Four weighted signals, plus two hard overrides.
//
//   overdue      How far past its review cadence the claim is. The main signal.
//                The cadence comes from the claim's category — how fast that
//                KIND of fact moves — not from how important it is.
//   timeMarkers  "currently", "as of", "right now", "still". Language that ties
//                the sentence to the moment it was written.
//   yearDrift    An explicit year in the claim, compared with the current year.
//   sourceAge    How old the source the page cited for it is, when knowable.
//
// A signal with no data available is DROPPED and the remaining weights are
// renormalized, rather than scored as zero. Scoring an unknown as zero would
// quietly make content look fresher than anyone can actually claim it is.
//
// THE TWO HARD OVERRIDES are not probabilistic. They are arithmetic:
//
//   * a deadline written in the copy whose date has passed -> the sentence is
//     now false, not "possibly stale"
//   * a "scheduled to be considered on <date>" whose date has passed -> the
//     outcome is knowable and the page does not know it
//
// BEING DUE IS NOT BEING WRONG. Passing a cadence means nobody has checked
// recently enough to say the claim still holds. The report says exactly that,
// and never asserts a claim is false on age alone.
// ---------------------------------------------------------------------------

import { parseHumanDate, daysBetween, yearOf } from "./dates.mjs";

const unit = (n) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

/**
 * Overdue curve.
 *
 * Approaching the cadence contributes a little; passing it contributes a lot.
 *
 *   ratio 0            -> 0     (just checked)
 *   ratio 1 (due)      -> 0.4   (nobody has looked since the cadence began)
 *   ratio saturation   -> 1     (well past the point of being worth a look)
 *
 * Deliberately not a straight line: "due" and "long overdue" should not read as
 * the same instruction to a human.
 */
export function overdueComponent(daysSince, cadenceDays, saturationMultiple) {
  if (!Number.isFinite(daysSince) || !Number.isFinite(cadenceDays) || cadenceDays <= 0) return null;
  const ratio = Math.max(0, daysSince) / cadenceDays;
  if (ratio <= 1) return unit(0.4 * ratio);
  const span = Math.max(0.001, saturationMultiple - 1);
  return unit(0.4 + 0.6 * Math.min(1, (ratio - 1) / span));
}

/** Two or more "currently"-style markers saturate the component. */
export function timeMarkerComponent(markers) {
  const count = Array.isArray(markers) ? markers.length : 0;
  if (count === 0) return null;
  return unit(count / 2);
}

/**
 * Years behind the current year, normalized.
 * Future years are ignored — a 2027 completion date is forward-looking, not
 * stale, and gets caught by the deadline override if it actually passes.
 */
export function yearDriftComponent(years, today, saturationYears) {
  const currentYear = yearOf(today);
  const past = (years ?? []).filter((y) => y <= currentYear);
  if (past.length === 0) return null;
  const newest = Math.max(...past);
  const drift = currentYear - newest;
  return unit(drift / Math.max(1, saturationYears));
}

/** How old the cited source is, when a date can be read off it. */
export function sourceAgeComponent(sourceDateISO, today, saturationDays) {
  if (!sourceDateISO) return null;
  const age = daysBetween(sourceDateISO, today);
  if (!Number.isFinite(age) || age < 0) return null;
  return unit(age / Math.max(1, saturationDays));
}

/**
 * Read a date out of a source label, e.g.
 * "Las Vegas Review-Journal, 30 March 2026" -> 2026-03-30.
 * Returns null when the label does not carry one — most do not, and guessing
 * would be worse than admitting it.
 */
export function sourceDateFromLabel(label) {
  const parsed = parseHumanDate(label ?? "");
  return parsed ? parsed.iso : null;
}

/**
 * Score one claim's staleness.
 *
 * @param {object} opts
 * @param {object} opts.claim
 * @param {object} opts.page       the inventory record (for lastReviewed)
 * @param {object} opts.config
 * @param {string} opts.today      YYYY-MM-DD
 */
export function scoreFreshness({ claim, page, config, today }) {
  const cadenceDays = config.cadence[claim.category.dynamism] ?? config.cadence.moderate;
  const daysSince = page.daysSinceReviewed;

  const sourceDate = sourceDateFromLabel(claim.structured?.source?.label);

  const rawComponents = {
    overdue: overdueComponent(daysSince, cadenceDays, config.freshness.overdueSaturationMultiple),
    timeMarkers: timeMarkerComponent(claim.signals?.timeMarkers),
    yearDrift: yearDriftComponent(claim.figures?.years, today, config.freshness.yearDriftSaturation),
    sourceAge: sourceAgeComponent(sourceDate, today, config.freshness.sourceAgeSaturationDays),
  };

  // Renormalize over the components that actually had data.
  let numerator = 0;
  let denominator = 0;
  const components = [];
  for (const [key, value] of Object.entries(rawComponents)) {
    const weight = config.freshness.weights[key] ?? 0;
    if (value === null || !weight) {
      components.push({ component: key, weight, value: null, available: false });
      continue;
    }
    numerator += weight * value;
    denominator += weight;
    components.push({ component: key, weight, value: Number(value.toFixed(3)), available: true });
  }
  let score = denominator > 0 ? numerator / denominator : 0;

  // --- Hard overrides -------------------------------------------------------
  const overrides = [];
  const dates = claim.figures?.dates ?? [];
  const passed = dates.filter((d) => daysBetween(d.iso, today) > 0);

  if (claim.signals?.deadlineContext && passed.length) {
    const worst = passed[passed.length - 1];
    score = Math.max(score, config.freshness.passedDeadlineStaleness);
    overrides.push({
      kind: "passed-deadline",
      date: worst.iso,
      quoted: worst.text,
      explanation:
        `The copy states a deadline of ${worst.text}, which passed ${daysBetween(worst.iso, today)} days ago. ` +
        "This is not a probability — the sentence describes something that is over.",
    });
  }

  if (claim.signals?.scheduledEventContext && passed.length) {
    const worst = passed[passed.length - 1];
    if (score < config.freshness.passedScheduledEventStaleness) {
      score = config.freshness.passedScheduledEventStaleness;
    }
    overrides.push({
      kind: "passed-scheduled-event",
      date: worst.iso,
      quoted: worst.text,
      explanation:
        `The copy points at a scheduled date of ${worst.text}, which has passed. The outcome is knowable now ` +
        "and the page does not reflect it.",
    });
  }

  return {
    score: Number(unit(score).toFixed(3)),
    cadenceDays,
    dynamism: claim.category.dynamism,
    daysSinceReviewed: daysSince,
    lastReviewed: page.lastReviewed?.date ?? null,
    lastReviewedBasis: page.lastReviewed?.basis ?? null,
    overdueByDays: Number.isFinite(daysSince) ? Math.max(0, daysSince - cadenceDays) : null,
    isOverdue: Number.isFinite(daysSince) ? daysSince > cadenceDays : false,
    sourceDate,
    components,
    overrides,
    explanation: buildExplanation({ claim, cadenceDays, daysSince, overrides, rawComponents }),
  };
}

function buildExplanation({ claim, cadenceDays, daysSince, overrides, rawComponents }) {
  if (overrides.length) return overrides[0].explanation;

  const parts = [];
  if (Number.isFinite(daysSince)) {
    parts.push(
      `${claim.category.label} is treated as a ${claim.category.dynamism.replace("-", " ")} fact, ` +
        `so it is reviewed every ${cadenceDays} days. This page's facts were last checked ${daysSince} days ago` +
        (daysSince > cadenceDays ? `, which is ${daysSince - cadenceDays} days past that.` : ", which is inside that window.")
    );
  } else {
    parts.push(
      `No check date could be established for this page, so its ${cadenceDays}-day review cadence cannot be measured against anything.`
    );
  }
  if (rawComponents.timeMarkers !== null) {
    parts.push(
      `The sentence uses present-tense language (${(claim.signals.timeMarkers ?? []).join(", ")}), which ties it to the moment it was written.`
    );
  }
  if (rawComponents.yearDrift) {
    parts.push("It also names a year that is now behind us.");
  }
  return parts.join(" ");
}
