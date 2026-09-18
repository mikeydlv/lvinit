// ---------------------------------------------------------------------------
// RULES-ONLY — the brief when there's no ANTHROPIC_API_KEY or the call fails
//
// Honest about what it can't do. It still picks the four strongest ideas by
// the rules pre-score, matches footage, and lays out a structure, but:
//
//   * the hook is the page's own published headline (Mikey already wrote it),
//     never a template line
//   * the script beats are the page's own section headings
//   * there are no engagement scores, and the brief says so at the top
//
// A template hook is exactly the generic content LVINIT avoids, so it won't
// write one.
// ---------------------------------------------------------------------------

const NEEDS = "Needs Mikey's angle (rules-only week).";

export function judgeWithRules(shortlist, matches) {
  return shortlist.map((c) => {
    const m = matches.get(c.id);
    const clips = m.clips;
    const beats = [
      { beat: "hook", seconds: "0-3", say: c.title, clip: null },
      ...c.headings.slice(0, 4).map((h, i) => ({ beat: "point", seconds: "", say: h, clip: clips[i] ?? null })),
      { beat: "cta", seconds: "", say: c.sourceRoutes[0] ? `Full breakdown on lvinit.com${c.sourceRoutes[0]}` : "DM me with questions.", clip: null },
    ];
    return {
      candidateId: c.id,
      kind: c.kind,
      sourceTitle: c.title,
      sourceRoutes: c.sourceRoutes,
      isNews: Boolean(c.isNews),
      format: c.formats?.[0] ?? "insider knowledge",
      title: c.title,
      hook: c.title,
      onScreenText: "",
      script: beats,
      spokenSeconds: 0,
      talkingPoints: c.headings.slice(0, 4).map((h) => ({ point: h, sourceRoute: c.sourceRoutes[0] ?? null })),
      spouseTest: NEEDS,
      emotionalAngle: NEEDS,
      audience: "",
      whyComment: NEEDS,
      whyShare: NEEDS,
      whySave: NEEDS,
      commentPrompt: "",
      scores: null,
      thumbnail: "",
      carousel: "",
      story: "",
      youtube: c.video ? `Points to "${c.video.title}".` : "",
      leadGen: "",
      captionFirstLine: "",
      newFilmingRequest: { needed: false, why: "", shots: [] },
      flags: ["Rules-only: the hook is the published headline and the beats are the page's own sections."],
      unverifiedNumbers: [],
      rulesOnly: true,
    };
  });
}
