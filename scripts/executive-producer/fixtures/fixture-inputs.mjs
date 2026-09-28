// ---------------------------------------------------------------------------
// FIXTURES — synthetic inputs and a canned judgment for tests and --fixtures
//
// Everything here is fictional ("Fixture Ridge", "/guides/fixture-…"). It is
// shaped exactly like the real inputs so the whole pipeline runs with no
// network, no API key and no media library.
// ---------------------------------------------------------------------------

const clip = (id, path, area, place, extra = {}) => ({
  id,
  path,
  folder: path.split("/").slice(0, -1).join("/"),
  type: "video",
  role: "b-roll",
  camera: "drone",
  orientation: "vertical",
  durationSec: 30,
  area,
  place,
  ...extra,
});

export const FIXTURE_CATALOG = {
  schema_version: "1.0.0",
  agent: "executive-producer",
  kind: "footage-catalog",
  generatedAt: "2026-09-18T00:00:00.000Z",
  totals: { public: 9, videos: 9, videoMinutes: 4.5 },
  items: [
    clip("aaaaaaaaa1", "Media/Summerlin/fixture-ridge-drone.MP4", "summerlin", "Summerlin", { timeOfDay: "golden-hour" }),
    clip("aaaaaaaaa2", "Media/Summerlin/fixture-park.MP4", "summerlin", "Summerlin", { camera: "handheld", subject: "fixture park" }),
    clip("bbbbbbbbb1", "Media/Henderson/fixture-green-valley-drive.MP4", "henderson", "Henderson", { camera: "handheld", subject: "fixture green valley drive" }),
    clip("bbbbbbbbb2", "Media/Henderson/fixture-lake.MP4", "henderson", "Henderson"),
    clip("ccccccccc1", "Media/SouthWest/fixture-lennar-homes.MP4", "southwest", "Southwest Las Vegas", { subject: "fixture lennar homes" }),
    clip("ddddddddd1", "Media/215/fixture-215-exit.MP4", "valley-wide", "215 Beltway", { camera: "handheld", subject: "fixture 215 exit" }),
    clip("eeeeeeeee1", "Media/SoHi/fixture-apartment-leasing.MP4", "southwest", "Southern Highlands (SoHi)", { camera: "handheld", subject: "fixture apartment leasing" }),
    clip("fffffffff1", "Media/KB Homes/DJI_0001.MP4", null, "UNKNOWN / NEEDS CLASSIFICATION", { camera: "handheld", caution: "Exterior shot shows a house number. Blur it before posting." }),
    { ...clip("ggggggggg1", "Videos/Fixture Project/Short-1.mp4", "valley-wide", null), role: "short", project: { folder: "Videos/Fixture Project", youtubeId: "FIXTUREVID1" } },
  ],
};

export const FIXTURE_INVENTORY = {
  schema_version: "1.0.0",
  agent: "executive-producer",
  kind: "video-inventory",
  totals: { videos: 1, onHomepage: 1, embedOnly: 0, shortsAlreadyCut: 1 },
  videos: [
    {
      youtubeId: "FIXTUREVID1",
      url: "https://www.youtube.com/watch?v=FIXTUREVID1",
      title: "Fixture Ridge vs Fixture Valley: Which Fits You?",
      onHomepage: true,
      embeddedOn: ["/guides/fixture-ridge-vs-fixture-valley"],
      area: "valley-wide",
      localProject: "Videos/Fixture Project",
      localAssets: { shorts: 1, shortPaths: ["Videos/Fixture Project/Short-1.mp4"] },
    },
  ],
};

const page = (route, title, category, description, prose, headings = []) => ({
  route,
  title,
  category,
  description,
  publishedAt: "2026-09-01",
  headings,
  excerpt: prose.slice(0, 600),
  fullText: [title, description, ...headings, prose].join("\n"),
});

export const FIXTURE_PAGES = [
  page(
    "/guides/fixture-ridge-vs-fixture-valley",
    "Summerlin vs Henderson: The Fixture Comparison",
    "Comparisons",
    "An honest fixture comparison of Summerlin and Henderson.",
    "Summerlin is one master plan across about 35 square miles. Henderson is a city of 118.5 square miles with its own mayor.",
    ["One plan vs a city", "Who each one suits"],
  ),
  page(
    "/guides/fixture-down-payment",
    "You Don't Need 20% Down (Fixture)",
    "Buyer Guide",
    "FHA starts at 3.5% down in this fixture.",
    "FHA starts at 3.5% down with a 580 credit score. A fixture program offers $20,000.",
    ["Loan minimums", "Assistance"],
  ),
  page(
    "/guides/fixture-new-build-vs-resale",
    "New Build vs Resale (Fixture)",
    "Buyer Guide",
    "List price and finished price are two different numbers.",
    "A new build may still need a backyard and window coverings. 63% of builders used incentives in the fixture month.",
    ["Finished price", "Incentives"],
  ),
  page(
    "/guides/fixture-tax-cap",
    "Why the Seller's Fixture Tax Bill May Not Be Yours",
    "Cost of Living",
    "Nevada caps owner-occupied increases at 3% in this fixture.",
    "The 3% cap belongs to the owner's claim. Recording a sale removes the seller's abatement.",
    ["The cap", "How to claim"],
  ),
  page(
    "/guides/fixture-market-update",
    "Fixture Home Prices Dipped in August",
    "Market Watch",
    "The fixture median moved slightly.",
    "The fixture median price was $480,000 in August.",
    ["The numbers"],
  ),
  page(
    "/guides/fixture-henderson-vs-southwest",
    "Henderson vs Southwest (Fixture)",
    "Comparisons",
    "A city against a place with no boundary.",
    "Henderson is incorporated. Southwest has no legal boundary.",
    ["City vs no city"],
  ),
];

export function fixtureInputs(today) {
  return {
    missing: [],
    catalog: FIXTURE_CATALOG,
    catalogAge: 3,
    inventory: FIXTURE_INVENTORY,
    pages: FIXTURE_PAGES,
    trends: {
      topics: [
        {
          key: "fixture-ridge-approved",
          name: "Fixture Ridge approved in West Henderson",
          kind: "project",
          priority: "P2",
          band: "P2",
          total: 30,
          area: "henderson",
          whyItMatters: "A fixture project was approved.",
          sources: [{ sourceName: "Fixture Journal", title: "Fixture Ridge approved", published: "2026-09-16" }],
          reportDate: today,
          rulesOnly: false,
        },
      ],
      reports: [{ date: today, mode: "llm" }],
      watchlist: [],
    },
    search: { reportDate: null, queries: [] },
    history: [],
    performance: null,
  };
}

const A = (id, extra = {}) => ({
  candidate_id: id,
  spouse_test: { passes: true, why_theyd_send_it: "A couple deciding where to move would send it to each other." },
  format: "neighborhood debate",
  working_title: "Fixture pick",
  hook: "Fixture hook that stops the scroll.",
  on_screen_text: "Fixture overlay",
  script: [
    { beat: "hook", seconds: "0-4", say: "Fixture hook that stops the scroll right now today.", broll_clip_id: "" },
    { beat: "point", seconds: "4-30", say: "A point with enough words to be spoken over about twenty five seconds of fixture footage and some more words here to fill it out properly.", broll_clip_id: "" },
    { beat: "cta", seconds: "30-45", say: "Comment below and DM me FIXTURE for the full breakdown of the whole thing.", broll_clip_id: "" },
  ],
  talking_points: [{ point: "A fixture point.", source_route: "opinion" }],
  emotional_angle: "Relief.",
  audience: "Relocating couples.",
  why_comment: "Debate.",
  why_share: "Spouse.",
  why_save: "Reference.",
  comment_prompt: "Which one?",
  scores: { scroll_stop: 4, comment: 4, share: 4, save: 4, follow: 4, dm_lead: 4, trust: 4 },
  thumbnail_idea: "Fixture thumbnail.",
  carousel_opportunity: "Fixture carousel.",
  story_opportunity: "Fixture poll.",
  youtube_opportunity: "Fixture video.",
  lead_gen: "DM FIXTURE.",
  caption_first_line: "Fixture caption.",
  new_filming: { needed: false, why: "", shots: [] },
  ...extra,
});

export const fixtureJudgment = {
  assessments: [
    A("page:/guides/fixture-ridge-vs-fixture-valley", {
      working_title: "Summerlin vs Henderson Isn't a Fair Fight",
      hook: "Summerlin is 35 square miles of one plan. Henderson is 118.5 square miles of city.",
      scores: { scroll_stop: 5, comment: 5, share: 5, save: 4, follow: 4, dm_lead: 4, trust: 5 },
      script: [
        { beat: "hook", seconds: "0-4", say: "Summerlin is one plan. Henderson is a whole city.", broll_clip_id: "aaaaaaaaa1" },
        { beat: "point", seconds: "4-30", say: "Henderson covers 118.5 square miles with its own mayor, and that changes the whole comparison you've been having at home with your partner.", broll_clip_id: "bbbbbbbbb1" },
        { beat: "cta", seconds: "30-45", say: "Comment which one you're leaning toward and DM me COMPARE for the full breakdown.", broll_clip_id: "not-offered" },
      ],
      talking_points: [{ point: "Henderson spans 118.5 square miles.", source_route: "/guides/fixture-ridge-vs-fixture-valley" }],
    }),
    A("page:/guides/fixture-henderson-vs-southwest", { working_title: "Henderson vs Southwest", scores: { scroll_stop: 4, comment: 5, share: 4, save: 4, follow: 4, dm_lead: 4, trust: 4 } }),
    A("page:/guides/fixture-down-payment", {
      format: "myth vs reality",
      working_title: "You Don't Need 20% Down",
      hook: "FHA starts at 3.5% down. Rates are 6.71% right now.",
      scores: { scroll_stop: 4, comment: 3, share: 5, save: 5, follow: 4, dm_lead: 5, trust: 5 },
    }),
    A("page:/guides/fixture-new-build-vs-resale", {
      format: "new-build decision",
      working_title: "The New Build Price Isn't the Price",
      scores: { scroll_stop: 4, comment: 4, share: 4, save: 5, follow: 4, dm_lead: 4, trust: 5 },
      new_filming: { needed: true, why: "Want a fresh model-home walkthrough.", shots: ["Model home interior"] },
    }),
    A("page:/guides/fixture-tax-cap", {
      format: "hidden cost",
      working_title: "The Seller's Tax Bill Isn't Yours",
      talking_points: [{ point: "The 3% cap.", source_route: "/guides/not-a-real-page" }],
      scores: { scroll_stop: 4, comment: 3, share: 4, save: 5, follow: 3, dm_lead: 4, trust: 5 },
    }),
    A("page:/guides/fixture-market-update", {
      spouse_test: { passes: false, why_theyd_send_it: "A monthly median is a generic market update; nobody forwards it to a spouse." },
    }),
    A("trend:fixture-ridge-approved", { format: "insider knowledge", working_title: "Fixture Ridge news", scores: { scroll_stop: 3, comment: 3, share: 2, save: 2, follow: 2, dm_lead: 2, trust: 3 } }),
    A("page:/guides/invented", {}),
  ],
};
