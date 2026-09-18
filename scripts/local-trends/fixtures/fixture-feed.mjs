// ---------------------------------------------------------------------------
// FIXTURES — synthetic stories and a canned model response
//
// Every name, number and URL here is FICTIONAL ("Fixture Ridge",
// example.com). They exist to exercise the pipeline end to end — dedupe,
// noise, out-of-area filtering, status validation, watchlist resurfacing,
// report rendering — without a network, an API key, or real news.
//
// Nothing in this file may ever be mistaken for a real Las Vegas project.
// Fixture runs write to reports/social-trends/fixtures/ only.
// ---------------------------------------------------------------------------

const iso = (today, daysAgo) => new Date(Date.parse(`${today}T15:00:00Z`) - daysAgo * 86_400_000).toISOString();

export function fixtureItems(today) {
  return [
    {
      title: "Henderson council approves Fixture Ridge master-planned community in West Henderson",
      url: "https://example.com/news/fixture-ridge-approved",
      published: iso(today, 1),
      snippet: "The Henderson City Council voted 5-0 to approve the Fixture Ridge master-planned community, a fictional 900-home project in West Henderson. Construction is set to begin next year.",
      via: "henderson-news", sourceName: "Fixture City Newsroom (synthetic)", sourceDomain: "example.com", tier: "official",
    },
    {
      title: "Fixture Ridge master-planned community approved by Henderson council",
      url: "https://example.com/tv/fixture-ridge",
      published: iso(today, 1),
      snippet: "West Henderson is getting a new master-planned community after a council vote on Tuesday.",
      via: "ktnv", sourceName: "Fixture TV (synthetic)", sourceDomain: "example.com", tier: "news",
    },
    {
      title: "New grocery store planned near Fixture Park in Summerlin",
      url: "https://example.com/news/summerlin-fixture-grocery",
      published: iso(today, 2),
      snippet: "A grocery chain has proposed a store at the Fixture Park retail center in Summerlin, according to plans filed with the city of Las Vegas.",
      via: "rj-business", sourceName: "Fixture Journal (synthetic)", sourceDomain: "example.com", tier: "news",
    },
    {
      title: "Fixture Parkway widening project breaks ground in Southwest Las Vegas",
      url: "https://example.com/news/fixture-parkway-widening",
      published: iso(today, 3),
      snippet: "Clark County crews broke ground Monday on the Fixture Parkway road widening project in the southwest valley.",
      via: "8newsnow", sourceName: "Fixture News (synthetic)", sourceDomain: "example.com", tier: "news",
    },
    {
      title: "Police investigate shooting near Henderson apartment complex",
      url: "https://example.com/news/fixture-crime",
      published: iso(today, 1),
      snippet: "Police say one person was hurt.",
      via: "rj-local", sourceName: "Fixture Journal (synthetic)", sourceDomain: "example.com", tier: "news",
    },
    {
      title: "West Henderson hosts North Fixture in girls flag football",
      url: "https://example.com/sports/nc-flag-football",
      published: iso(today, 1),
      snippet: "High school sports in North Carolina.",
      via: "google-news", sourceName: "Fixture Citizen (synthetic)", sourceDomain: "example.com", tier: "news",
    },
    {
      title: "National home prices tick up in August, report says",
      url: "https://example.com/national/home-prices",
      published: iso(today, 2),
      snippet: "Nationwide home prices rose slightly. Las Vegas was not mentioned in the national index release.",
      via: "google-news", sourceName: "Fixture Wire (synthetic)", sourceDomain: "example.com", tier: "news",
    },
    {
      title: "Anyone know what's being built off Fixture Parkway in Southwest Las Vegas?",
      url: "https://example.com/r/vegas/fixture-parkway-question",
      published: iso(today, 1),
      snippet: "",
      via: "reddit", sourceName: "Reddit r/vegas", sourceDomain: "reddit.com", tier: "social",
    },
    {
      title: "Is Henderson really cheaper than Summerlin for a family of four?",
      url: "https://example.com/r/henderson/cheaper",
      published: iso(today, 2),
      snippet: "",
      via: "reddit", sourceName: "Reddit r/henderson", sourceDomain: "reddit.com", tier: "social",
    },
    {
      title: "Summerlin vs Henderson for moving from California — HOA fees?",
      url: "https://example.com/r/LasVegas/summerlin-henderson-hoa",
      published: iso(today, 3),
      snippet: "",
      via: "reddit", sourceName: "Reddit r/LasVegas", sourceDomain: "reddit.com", tier: "social",
    },
  ];
}

export function fixtureHealth() {
  return [{ id: "fixture", name: "Fixture feed (synthetic)", tier: "news", ok: true, status: 200, items: 10, error: null }];
}

/**
 * The canned "model" response. Written against URLs, resolved to candidate
 * ids at runtime. It deliberately includes mistakes the validator must catch:
 * an evidence quote that is not in the source, a route that does not exist,
 * and an OPEN claim for something only set to begin next year.
 */
export function fixtureJudgment({ candidates, signals }) {
  const idOf = (url) => [...candidates, ...signals].find((c) => c.url.endsWith(url))?.id ?? "missing";
  const baseShoot = { recommended: true, location_type: "Public road edge overlooking the (fictional) site — drive-up, no walking", shots: ["Wide establishing from the public road", "Slow pan across the graded land", "Dash-cam drive past the entrance"], drone: "Useful for scale; check airspace first", a_roll_vs_voiceover: "Voiceover over B-roll, 10-second A-roll open", urgency: "shoot this month" };
  return {
    topics: [
      {
        candidate_ids: [idOf("/news/fixture-ridge-approved")],
        signal_ids: [],
        project_key: "fixture-ridge-west-henderson",
        name: "Fixture Ridge master-planned community (West Henderson)",
        kind: "project",
        area: "West Henderson",
        category: "A. Real estate development",
        status: "OPEN",
        status_evidence: "Construction is set to begin next year.",
        status_evidence_id: idOf("/news/fixture-ridge-approved"),
        material_new_info: false,
        what_changed: "",
        scores: { local_relevance: 5, relocation_value: 5, conversation_potential: 4, visual_potential: 4, evergreen_value: 4, real_estate_connection: 5, novelty: 4, lvinit_fit: 5 },
        why_it_matters: "FIXTURE: a synthetic approval used to test the pipeline.",
        why_people_will_care: "FIXTURE: buyers comparing West Henderson new builds.",
        best_hook: "FIXTURE: West Henderson is about to look very different.",
        best_format: "field-report Reel",
        secondary_formats: ["YouTube long-form", "LVINIT article"],
        content_flywheel: ["30-sec field Reel", "Long-form breakdown", "LVINIT article", "Story poll"],
        field_shoot: baseShoot,
        article_opportunity: "FIXTURE: new article on what the approval means.",
        existing_content: [
          { route: "/guides/henderson-vs-southwest-las-vegas", action: "internal link", note: "FIXTURE link" },
          { route: "/guides/this-route-does-not-exist", action: "update existing article", note: "must be dropped" },
        ],
        missing_confirmation: "FIXTURE: builder names and pricing.",
        promotion_trigger: "FIXTURE: a groundbreaking date.",
      },
      {
        candidate_ids: [idOf("/news/fixture-parkway-widening")],
        signal_ids: [idOf("/r/vegas/fixture-parkway-question")],
        project_key: "fixture-parkway-widening",
        name: "Fixture Parkway widening (Southwest Las Vegas)",
        kind: "project",
        area: "Southwest Las Vegas",
        category: "D. Transportation / infrastructure",
        status: "UNDER CONSTRUCTION",
        status_evidence: "Clark County crews broke ground Monday on the Fixture Parkway road widening project",
        status_evidence_id: idOf("/news/fixture-parkway-widening"),
        material_new_info: false,
        what_changed: "",
        scores: { local_relevance: 4, relocation_value: 4, conversation_potential: 4, visual_potential: 4, evergreen_value: 3, real_estate_connection: 3, novelty: 4, lvinit_fit: 4 },
        why_it_matters: "FIXTURE: a synthetic road project.",
        why_people_will_care: "FIXTURE: southwest commuters.",
        best_hook: "FIXTURE: Why is this road suddenly under construction?",
        best_format: "Reel / TikTok / Short",
        secondary_formats: ["Instagram carousel"],
        content_flywheel: [],
        field_shoot: baseShoot,
        article_opportunity: "",
        existing_content: [],
        missing_confirmation: "",
        promotion_trigger: "",
      },
      {
        candidate_ids: [idOf("/news/summerlin-fixture-grocery")],
        signal_ids: [],
        project_key: "fixture-park-grocery-summerlin",
        name: "Grocery proposed at Fixture Park (Summerlin)",
        kind: "project",
        area: "Summerlin",
        category: "B. Neighborhood changes",
        status: "APPROVED",
        status_evidence: "The planning commission approved the grocery store",
        status_evidence_id: idOf("/news/summerlin-fixture-grocery"),
        material_new_info: false,
        what_changed: "",
        scores: { local_relevance: 4, relocation_value: 3, conversation_potential: 3, visual_potential: 3, evergreen_value: 3, real_estate_connection: 3, novelty: 3, lvinit_fit: 3 },
        why_it_matters: "FIXTURE: a synthetic grocery filing.",
        why_people_will_care: "FIXTURE: nearby residents.",
        best_hook: "FIXTURE: This neighborhood may get the one thing residents keep asking for.",
        best_format: "Instagram carousel",
        secondary_formats: [],
        content_flywheel: [],
        field_shoot: { ...baseShoot, recommended: false },
        article_opportunity: "",
        existing_content: [],
        missing_confirmation: "FIXTURE: approval vote.",
        promotion_trigger: "FIXTURE: approval.",
      },
      {
        candidate_ids: [],
        signal_ids: [idOf("/r/henderson/cheaper"), idOf("/r/LasVegas/summerlin-henderson-hoa")],
        project_key: "is-henderson-cheaper-than-summerlin",
        name: "Is Henderson really cheaper than Summerlin?",
        kind: "question",
        area: "Henderson",
        category: "H. Social / conversation signal",
        status: "NOT A PROJECT",
        status_evidence: "",
        status_evidence_id: "",
        material_new_info: false,
        what_changed: "",
        scores: { local_relevance: 5, relocation_value: 5, conversation_potential: 5, visual_potential: 3, evergreen_value: 5, real_estate_connection: 5, novelty: 2, lvinit_fit: 5 },
        why_it_matters: "FIXTURE: recurring audience question.",
        why_people_will_care: "FIXTURE: relocating families.",
        best_hook: "FIXTURE: Is Henderson actually cheaper?",
        best_format: "comparison carousel",
        secondary_formats: ["talking-head Reel"],
        content_flywheel: [],
        field_shoot: { ...baseShoot, recommended: false },
        article_opportunity: "FIXTURE: update the comparison guide.",
        existing_content: [{ route: "/guides/summerlin-vs-henderson", action: "update existing article", note: "FIXTURE" }],
        missing_confirmation: "",
        promotion_trigger: "",
      },
    ],
    rejected: [{ candidate_id: idOf("/national/home-prices"), reason: "national story with weak Vegas angle", note: "FIXTURE" }],
  };
}
