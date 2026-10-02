// ---------------------------------------------------------------------------
// CONFIDENCE — how much to trust the recommendation, separate from the action
//
// HIGH requires ALL of:
//   * a verified transcript (Mikey-reviewed, not only machine transcription)
//   * a clear topic (the transcript talks about what the title promises)
//   * a clear relationship to existing content (no ambiguous band edge, no
//     cannibalization)
//   * no unresolved factual blockers (no decaying figure the draft depends on)
//   * no Fair Housing issue in the generated draft
//   * an obvious editorial action (not provisional, not MONITOR)
//
// LOW: no usable transcript, an unclear topic, a Fair Housing block, or a
// provisional action. LOW never reaches the Publisher queue.
// Everything else is MEDIUM. Every downgrade is recorded as a reason.
// ---------------------------------------------------------------------------

export function confidenceFor({ transcript, group, overlap, classification, checklist, fairHousingStatus }) {
  const low = [];
  const notHigh = [];

  if (!transcript || transcript.status !== "OK") low.push("no usable transcript");
  else if (!transcript.verified) notHigh.push("transcript is not verified by Mikey (machine transcription)");

  if (group.intentClarity < 0.5) low.push(`the transcript barely covers what the title promises (clarity ${group.intentClarity})`);
  else if (group.intentClarity < 0.8) notHigh.push(`topic clarity ${group.intentClarity}`);

  if (fairHousingStatus.status === "BLOCKED") low.push(`Fair Housing: ${fairHousingStatus.reason}`);
  if (classification.provisional) low.push("the action is provisional");
  if (["MONITOR_ONLY"].includes(classification.action)) low.push("monitor only — no editorial action");

  if (overlap.ambiguous) notHigh.push("the overlap verdict sits on a band edge");
  if (overlap.cannibalization?.status && overlap.cannibalization.status !== "none") notHigh.push("existing pages compete for this question");
  const blocking = (checklist ?? []).filter((c) => c.blocking);
  if (blocking.length) notHigh.push(`${blocking.length} unresolved factual claim(s) need current verification`);

  const level = low.length ? "low" : notHigh.length ? "medium" : "high";
  return { level, reasons: [...low, ...notHigh] };
}
