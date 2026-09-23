// ---------------------------------------------------------------------------
// FIXTURES — SYNTHETIC development items. Every name here is fictional
// ("Fixture …") and every URL is on example.com / example.gov. Used by
// `--fixtures` runs and the tests. Never written to real state.
// ---------------------------------------------------------------------------

export const FIXTURE_SEEDS = [
  {
    id: "DEV-FIXTURE-MESA",
    name: "Fixture Mesa",
    aliases: ["Fixture Mesa"],
    area: "summerlin",
    type: "residential",
    routes: [],
    baseline: { status: "approved", units: 800, from: "fixture baseline", note: "Fixture baseline: approved, 800 homes." },
  },
  {
    id: "DEV-FIXTURE-STATION",
    name: "Fixture Station Park",
    aliases: ["Fixture Station Park"],
    area: "henderson",
    type: "park",
    routes: [],
    baseline: { status: "under construction", from: "fixture baseline", note: "Fixture baseline: under construction." },
  },
];

function day(today, delta) {
  return new Date(Date.parse(`${today}T15:00:00Z`) + delta * 86_400_000).toISOString();
}

export function fixtureDevItems(today) {
  return [
    // 1. Primary planning record: a large new subdivision approved.
    {
      title: "TM-26-599001-FIXTURE LAND LLC: TENTATIVE MAP consisting of 420 single-family residential lots and common lots on 61.2 acres in an RS3.3 (Residential Single-Family 3.3) Zone. Generally located south of Fixture Avenue within Enterprise. JJ/xx (For possible action)",
      url: "https://example.gov/legistar/fixture-1",
      published: day(today, -1),
      snippet: "Clark County Zoning Commission agenda (FIXTURE): Approved (Pass). Matter files: TM-26-599001, ZC-26-599002.",
      sourceName: "Clark County Zoning Commission (Legistar) — FIXTURE",
      sourceDomain: "example.gov",
      via: "legistar",
      tier: "official",
      authority: 2,
      valleyByConstruction: true,
      presetAreas: ["southwest"],
      legistar: { applicant: "FIXTURE LAND LLC", planningArea: "Enterprise", action: "Approved (Pass)", summary: "420-unit/lot single-family subdivision", materiality: "420 units/lots" },
    },
    // 2. One groundbreaking, two outlets → one event with two sources.
    {
      title: "Crews break ground on Fixture Ridge, a 350-home community in Skye Canyon",
      url: "https://news.example.com/fixture-ridge-groundbreaking",
      published: day(today, -1),
      snippet: "Crews broke ground this week on Fixture Ridge, a planned 350-home community in Skye Canyon in northwest Las Vegas.",
      sourceName: "Las Vegas Review-Journal (FIXTURE)",
      sourceDomain: "reviewjournal.com",
      via: "rj-business",
      tier: "news",
    },
    {
      title: "Fixture Ridge breaks ground in northwest Las Vegas",
      url: "https://tv.example.com/fixture-ridge",
      published: day(today, 0),
      snippet: "Construction began Tuesday on Fixture Ridge, 350 homes in Skye Canyon, Las Vegas.",
      sourceName: "KTNV 13 Action News (FIXTURE)",
      sourceDomain: "ktnv.com",
      via: "ktnv",
      tier: "news",
    },
    // 3. Known project, same facts as the baseline → DUPLICATE.
    {
      title: "Fixture Mesa homes approved earlier this year in Summerlin",
      url: "https://news.example.com/fixture-mesa-recap",
      published: day(today, -2),
      snippet: "The Summerlin project, Fixture Mesa, was approved for 800 homes in Las Vegas.",
      sourceName: "Las Vegas Sun (FIXTURE)",
      sourceDomain: "lasvegassun.com",
      via: "sun-news",
      tier: "news",
    },
    // 4. Known project, status moves: under construction → open (official source).
    {
      title: "Fixture Station Park is now open in Henderson",
      url: "https://city.example.gov/news/fixture-station-park-open",
      published: day(today, 0),
      snippet: "The City of Henderson's Fixture Station Park is now open to the public, with trails, courts and a splash pad in Henderson, Nevada.",
      sourceName: "City of Henderson newsroom (FIXTURE)",
      sourceDomain: "cityofhenderson.com",
      via: "henderson-news",
      tier: "official",
    },
    // 5. Delay.
    {
      title: "Fixture Commons mixed-use project delayed until 2028",
      url: "https://news.example.com/fixture-commons-delay",
      published: day(today, -3),
      snippet: "The opening of Fixture Commons, a mixed-use project in Henderson, Nevada, has been pushed back to 2028, the developer said.",
      sourceName: "Las Vegas Review-Journal (FIXTURE)",
      sourceDomain: "reviewjournal.com",
      via: "rj-local",
      tier: "news",
    },
    // 6. Conflict: two outlets disagree on the size.
    {
      title: "Fixture Heights community approved for 1,200 homes in North Las Vegas",
      url: "https://news.example.com/fixture-heights-1200",
      published: day(today, -2),
      snippet: "North Las Vegas council members approved Fixture Heights, a community of 1,200 homes.",
      sourceName: "8 News Now (FIXTURE)",
      sourceDomain: "8newsnow.com",
      via: "8newsnow",
      tier: "news",
    },
    {
      title: "Fixture Heights community approved with 2,000 homes planned in North Las Vegas",
      url: "https://tv.example.com/fixture-heights-2000",
      published: day(today, -1),
      snippet: "The approved Fixture Heights community will include 2,000 homes in North Las Vegas.",
      sourceName: "News 3 Las Vegas (FIXTURE)",
      sourceDomain: "news3lv.com",
      via: "news3lv",
      tier: "news",
    },
    // 7. Noise.
    { title: "New taqueria opens in Henderson's Water Street District", url: "https://news.example.com/taqueria", published: day(today, -1), snippet: "A new restaurant opened in Henderson, Nevada.", sourceName: "Las Vegas Sun (FIXTURE)", sourceDomain: "lasvegassun.com", via: "sun-news", tier: "news" },
    { title: "Overnight lane restrictions on the 215 Beltway this weekend in Las Vegas", url: "https://news.example.com/overnight", published: day(today, -1), snippet: "Crews will close lanes overnight for striping.", sourceName: "KTNV 13 Action News (FIXTURE)", sourceDomain: "ktnv.com", via: "ktnv", tier: "news" },
    { title: "Police arrest suspect near new Las Vegas apartment complex", url: "https://news.example.com/arrest", published: day(today, -1), snippet: "Las Vegas police arrested a man.", sourceName: "8 News Now (FIXTURE)", sourceDomain: "8newsnow.com", via: "8newsnow", tier: "news" },
    // 8. Promotional-only builder post.
    {
      title: "Fixture Vista homes now selling in Henderson with limited-time incentives",
      url: "https://builder.example.com/fixture-vista",
      published: day(today, -2),
      snippet: "Fixture Vista is now open for sales in Henderson, Nevada. Join the VIP list for limited-time incentives on 240 homes.",
      sourceName: "Cadence news (FIXTURE)",
      sourceDomain: "cadencenv.com",
      via: "cadence-news",
      tier: "builder",
      authority: 5,
    },
    // 9. Fair Housing-sensitive subject, from a primary source.
    {
      title: "Council approves Fixture Gardens, a 55+ active adult community of 600 homes in Henderson",
      url: "https://city.example.gov/news/fixture-gardens",
      published: day(today, -1),
      snippet: "The Henderson City Council approved Fixture Gardens, an age-restricted 55+ community of 600 homes in Henderson, Nevada.",
      sourceName: "City of Henderson newsroom (FIXTURE)",
      sourceDomain: "cityofhenderson.com",
      via: "henderson-news",
      tier: "official",
    },
    // 10. Community lead — never evidence.
    { title: "Anyone know what they're building at Fixture Road in Summerlin?", url: "https://www.reddit.com/r/vegas/fixture", published: day(today, -1), snippet: "Saw graders out there, Las Vegas.", sourceName: "Reddit r/vegas (FIXTURE)", sourceDomain: "reddit.com", via: "reddit", tier: "social" },
  ];
}
