// ---------------------------------------------------------------------------
// PLACEHOLDER CONTENT
// Every string and figure in this file is illustrative scaffolding for launch
// day, not verified copy. Per docs/03-homepage-spec.md §5 (Content Integrity
// Guardrails), resident quotes, the emotional numeral, and Mikey's quote must
// be replaced with real, sourced material before this goes live — none of it
// should ship to production as-is.
// ---------------------------------------------------------------------------

export type Neighborhood = {
  slug: string;
  name: string;
  /** One defining figure shown in the Journey panel (Doc 03 §3.4a) */
  headlineStat: { label: string; value: string };
  tags: Array<
    | "walkable"
    | "top-schools"
    | "quiet-suburban"
    | "close-to-strip"
    | "up-and-coming"
  >;
  description: string;
  /** Art direction for this neighborhood's placeholder photography — documentary
   * lifestyle per Doc 02 §8: people living, warm natural light, never Strip/neon. */
  photoDirection: string;
  metrics: {
    medianPrice: number; // USD
    walkScore: number; // 0–100
    commuteToStrip: number; // minutes
    schoolRating: number; // 0–10
  };
};

export const neighborhoods: Neighborhood[] = [
  {
    slug: "summerlin",
    name: "Summerlin",
    headlineStat: { label: "Walk Score", value: "54" },
    tags: ["top-schools", "quiet-suburban"],
    description:
      "Master-planned, trail-laced, and built around the sunset light hitting Red Rock.",
    photoDirection:
      "Summerlin at golden hour — a runner on a Red Rock trail before the heat, red sandstone glowing behind low master-planned rooftops",
    metrics: { medianPrice: 615000, walkScore: 54, commuteToStrip: 27, schoolRating: 8.2 },
  },
  {
    slug: "henderson",
    name: "Henderson",
    headlineStat: { label: "Median Price", value: "$525K" },
    tags: ["top-schools", "quiet-suburban"],
    description:
      "The valley's widest range of communities: new master-plans, a lake, hillside estates, and a historic downtown, each a different way to live.",
    photoDirection:
      "Henderson in early evening — families on a tree-lined park path, water-district green against the desert, unhurried and easy",
    metrics: { medianPrice: 525000, walkScore: 48, commuteToStrip: 24, schoolRating: 8.0 },
  },
  {
    slug: "downtown-arts-district",
    name: "Downtown Arts District",
    headlineStat: { label: "Walk Score", value: "88" },
    tags: ["walkable", "up-and-coming", "close-to-strip"],
    description:
      "Murals, coffee counters, and the closest thing Vegas has to a walk-everywhere neighborhood.",
    photoDirection:
      "Downtown Arts District mid-morning — muralled brick, a coffee counter spilling onto the sidewalk, regulars who clearly know each other",
    metrics: { medianPrice: 410000, walkScore: 88, commuteToStrip: 12, schoolRating: 6.4 },
  },
  {
    slug: "green-valley",
    name: "Green Valley",
    headlineStat: { label: "School Rating", value: "8.6 / 10" },
    tags: ["top-schools", "quiet-suburban"],
    description:
      "Established, tree-lined, and consistently the answer when someone asks about schools first.",
    photoDirection:
      "Green Valley after school — kids biking a shaded, established street, mature trees and open garages, lived-in and settled",
    metrics: { medianPrice: 495000, walkScore: 51, commuteToStrip: 22, schoolRating: 8.6 },
  },
  {
    slug: "lake-las-vegas",
    name: "Lake Las Vegas",
    headlineStat: { label: "Median Price", value: "$780K" },
    tags: ["quiet-suburban"],
    description:
      "Water where you don't expect it, and a resort-quiet pace year-round.",
    photoDirection:
      "Lake Las Vegas at dusk — still water catching the last light, a couple walking the promenade, resort-quiet and unhurried",
    metrics: { medianPrice: 780000, walkScore: 39, commuteToStrip: 32, schoolRating: 7.8 },
  },
];

export type VideoItem = {
  id: string;
  title: string;
  duration: string;
  /** Real published YouTube video id. When set, the featured slot renders a live
   * youtube-nocookie embed instead of the placeholder poster. */
  youtubeId?: string;
};

// The featured slot and two of the secondary entries are real, published
// videos. The remaining smaller entry ("heat") is still a PLACEHOLDER — its
// title illustrates the "answer a real doubt" direction from Doc 03 §3.9;
// replace with real produced content before launch.
export const videos: VideoItem[] = [
  {
    id: "moving-to-las-vegas-2026-choose-the-area",
    youtubeId: "nyK0cchUt14",
    title: "Moving to Las Vegas in 2026? Choose the Area Before the House",
    duration: "5:45",
  },
  {
    id: "what-500k-gets-you-in-las-vegas",
    youtubeId: "Tzxid_nM2nA",
    title: "What $500K Actually Gets You in Las Vegas",
    duration: "12:16",
  },
  { id: "heat", title: "What nobody tells you about the heat", duration: "4:47" },
  {
    id: "rent-first-or-buy-first-las-vegas",
    youtubeId: "2rboWkJ9j48",
    title: "Rent First or Buy First When Moving to Las Vegas?",
    duration: "8:08",
  },
];

export type Guide = {
  slug: string;
  title: string;
  dek: string;
  byline: string;
  /** Human-readable display date, e.g. "August 2026". Kept for existing UI. */
  date: string;
  /**
   * Machine-readable publication date, `YYYY-MM-DD`. This is what the homepage
   * feed and `/guides` sort on — `date` alone is too coarse (several pieces
   * share "August 2026").
   *
   * MUST match the `datePublished` in the destination page's `StoryMeta`
   * (lib/story.ts) so the card, the Article schema, and the sitemap never
   * disagree. Never invent one: if a piece has no verified publication date,
   * leave it off and it stays out of the dated feeds.
   */
  publishedAt?: string;
  category: string;
  /**
   * Editorial status. Defaults to "published" when omitted. Anything marked
   * "draft" is excluded from `publishedGuides` — and therefore from both the
   * homepage feed and `/guides` — while still living in the registry.
   */
  status?: "published" | "draft";
  pullQuote?: string;
  /**
   * The card image, in /public/images. Either a real photograph of this story
   * or a generated LVINIT editorial cover — `imageMode` says which, and the two
   * are never interchangeable. Only ever set this to a file that genuinely
   * belongs to this piece; never a filename-convention guess, and never a
   * generic stand-in photo to fill the slot.
   *
   * Omitting it is still valid: the card renders its designed non-photographic
   * fallback and looks finished.
   */
  image?: string;
  /**
   * What `image` actually is. Defaults to "photo" when omitted, because that
   * was the only kind of image this registry held before covers existed.
   *
   *   "photo"           — a real, verified photograph. Requires `imageAlt`.
   *   "editorial-cover" — abstract artwork from
   *                       `scripts/generate-guide-cover.mjs`. Decorative: the
   *                       card renders it with an empty alt, since everything
   *                       it "says" (category, subject, wordmark) is already
   *                       read out as text beside it. Do not write `imageAlt`
   *                       for one, and never describe it as a photograph.
   */
  imageMode?: "photo" | "editorial-cover";
  /** Alt text for `image`. Required whenever `imageMode` is "photo". */
  imageAlt?: string;
  /**
   * Root-relative link to the published guide. Entries without one are not
   * eligible for any feed — LVINIT never ships a card that goes nowhere.
   */
  href?: string;
};

/**
 * The canonical editorial registry. Every published LVINIT guide, feature, and
 * article gets exactly one entry here — that is what makes it discoverable in
 * the homepage "Latest from LVINIT" feed and at `/guides`.
 *
 * Publishing checklist for a new piece: `href` pointing at the real route,
 * `publishedAt` matching the page's `StoryMeta.datePublished`, a `category`, a
 * `dek`, and a card image. No homepage file needs editing — the feed picks the
 * newest three on its own.
 *
 * The card image, in strict order of preference:
 *   1. a genuine photograph of this story — `image` + `imageAlt`, no
 *      `imageMode` needed. Always the first choice when Mikey has one.
 *   2. otherwise a generated LVINIT editorial cover — `image` +
 *      `imageMode: "editorial-cover"`, produced by
 *      `scripts/generate-guide-cover.mjs` (see that file's header).
 *   3. nothing at all, which is still valid — the card falls back to its
 *      designed panel.
 * What is never acceptable is a stand-in photo standing in for a missing one.
 */
export const guides: Guide[] = [
  {
    slug: "las-vegas-starter-home-prices-2026",
    title:
      "Las Vegas Starter Homes Have More Than Doubled Since 2016 — And They Just Got a Little Cheaper",
    dek: "Zillow research reported by the Las Vegas Review-Journal puts the typical Las Vegas starter home at $312,141 in July 2026, more than double its 2016 value, but down 3.2% from a year earlier.",
    byline: "Mikey Del Rosario",
    date: "August 2026",
    publishedAt: "2026-08-27",
    category: "Market Watch",
    // No authentic photograph for this explainer, so it carries a generated
    // LVINIT editorial cover (abstract, non-photographic; draws no real
    // figures, geography, or charts of its own).
    //   node scripts/generate-guide-cover.mjs --slug las-vegas-starter-home-prices-2026 \
    //     --category "Market Watch" --subject "Starter Homes" \
    //     --out las-vegas-starter-home-editorial-cover.webp
    image: "/images/covers/las-vegas-starter-home-editorial-cover.webp",
    imageMode: "editorial-cover",
    href: "/guides/las-vegas-starter-home-prices-2026",
  },
  {
    slug: "first-summer-in-vegas",
    title: "Surviving Your First Las Vegas Summer",
    dek: "The practical version, not the panicked version.",
    byline: "LVINIT Editorial",
    date: "August 2026",
    publishedAt: "2026-08-23",
    category: "Moving Here",
    // No authentic photography for this one yet, so it carries a generated
    // LVINIT editorial cover — a high desert sun breaking into heat bands over
    // a horizon rule. Drawn artwork, not a photograph of anywhere. Replace with
    // `imageMode: "photo"` + a real `image`/`imageAlt` when a photo lands.
    //   node scripts/generate-guide-cover.mjs --slug first-summer-in-vegas \
    //     --category "Moving Here" --subject "Las Vegas Summer" \
    //     --out las-vegas-summer-editorial-cover.webp
    image: "/images/covers/las-vegas-summer-editorial-cover.webp",
    imageMode: "editorial-cover",
    href: "/guides/first-summer-in-vegas",
  },
  {
    slug: "cost-of-living-2026",
    title: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
    // Card copy must track the article after its legal review — the earlier
    // "the cap is tied to the owner, not the house" framing was removed there
    // and must not survive here. Do not reintroduce it, or any claim that the
    // tax history resets, that taxable value resets to the purchase price, or
    // that a new buyer necessarily pays more than the seller.
    dek: "Nevada's 3% owner-occupied property-tax abatement depends on the current owner establishing the home as their primary residence. Here's what changes at a sale, what doesn't, and what buyers should verify before closing.",
    byline: "Mikey Del Rosario",
    date: "August 2026",
    publishedAt: "2026-08-21",
    category: "Cost of Living",
    // Carries a generated LVINIT editorial cover: an abstract parcel/plat
    // subdivision with one parcel picked out and a dashed line of transfer
    // through it. No real plat, no assessor record, no figures of any kind.
    // (`/images/guide-cost-of-living-2026.jpg` is a generic stand-in left over
    // from the old cost-of-living placeholder — it does not depict this story
    // and must not be shown as LVINIT photography.)
    //   node scripts/generate-guide-cover.mjs --slug cost-of-living-2026 \
    //     --category "Cost of Living" --subject "Property Tax" \
    //     --out nevada-property-tax-editorial-cover.webp
    image: "/images/covers/nevada-property-tax-editorial-cover.webp",
    imageMode: "editorial-cover",
    href: "/guides/nevada-property-tax-abatement-resale-buyers",
  },
  {
    slug: "summerlin-vs-henderson",
    title: "Summerlin vs. Henderson: Where Should You Actually Move?",
    dek: "Two of the city's most-recommended suburbs, compared honestly on schools, commute, and the tradeoffs nobody puts in a brochure.",
    byline: "Mikey Del Rosario",
    date: "August 2026",
    publishedAt: "2026-08-19",
    category: "Comparisons",
    pullQuote:
      "Both are good answers. They're just good answers to different questions.",
    // Real, already-live Mikey photography (Fox Hill Park / Red Rock drone
    // shot) — same asset used on the article hero and the Summerlin guide.
    image: "/images/hero/summerlin-fox-hill-park-red-rock-aerial-drone.webp",
    imageAlt:
      "Aerial drone view over Fox Hill Park in Summerlin, the Red Rock escarpment rising beyond the rooftops.",
    href: "/guides/summerlin-vs-henderson",
  },
  {
    slug: "las-vegas-new-home-sales-july-2026",
    title:
      "Las Vegas New-Home Sales Jumped in July 2026 — But Builders Are Still Pulling Back",
    dek: "Home Builders Research data shows builder sales up 28% month over month in July, still down 7% year over year, with permits down 23% and new-construction pricing running well above the resale median.",
    byline: "Mikey Del Rosario",
    date: "August 2026",
    publishedAt: "2026-08-25",
    category: "Market Watch",
    // No authentic photograph for this explainer, so it carries a generated
    // LVINIT editorial cover (abstract, non-photographic; draws no real
    // figures, geography, or charts of its own).
    //   node scripts/generate-guide-cover.mjs --slug las-vegas-new-home-sales-july-2026 \
    //     --category "Market Watch" --subject "New-Home Sales" \
    //     --out las-vegas-new-home-sales-editorial-cover.webp
    image: "/images/covers/las-vegas-new-home-sales-editorial-cover.webp",
    imageMode: "editorial-cover",
    href: "/guides/las-vegas-new-home-sales-july-2026",
  },
  {
    slug: "las-vegas-home-prices-july-2026",
    title:
      "Las Vegas Home Prices Pulled Back From Their Record High in July 2026",
    dek: "LVR's July 2026 report shows the median single-family price slipped to $480,000, down 2% from the record set in May and June. Here's the honest read on what changed and what didn't.",
    byline: "Mikey Del Rosario",
    date: "August 2026",
    publishedAt: "2026-08-17",
    category: "Market Watch",
    image: "/images/guide-las-vegas-home-prices-july-2026.webp",
    imageAlt:
      "Single-family homes across a Las Vegas valley neighborhood, mountains behind them.",
    href: "/guides/las-vegas-home-prices-july-2026",
  },
  {
    slug: "what-500k-buys-in-las-vegas",
    title: "What $500K Buys in Las Vegas",
    dek: "Three real home tours showing how different the options can be at roughly the same budget.",
    byline: "Mikey Del Rosario",
    date: "August 2026",
    publishedAt: "2026-08-04",
    category: "Buyer Guide",
    // The article's own poster art (also its StoryMeta image) — the video this
    // companion piece is built around.
    image: "/images/video-what-500k-gets-you-in-las-vegas.jpg",
    imageAlt:
      "Title card for the LVINIT video “What $500K Actually Gets You in Las Vegas.”",
    href: "/guides/what-500k-buys-in-las-vegas",
  },
  {
    slug: "will-las-vegas-home-prices-drop",
    title:
      "Inventory Is Rising in Las Vegas. So Why Aren't Home Prices Falling?",
    dek: "Inventory and days on market climbed through mid-2026, yet prices held at a record. Here's what's actually holding them up, and what would have to change.",
    byline: "Mikey Del Rosario",
    date: "August 2026",
    publishedAt: "2026-08-04",
    category: "Market Watch",
    // No authentic photograph for this explainer, so it carries a generated
    // LVINIT editorial cover: floating strata, no axis and no baseline, because
    // anything anchored would read as a chart of real inventory. It plots
    // nothing — the line lengths are seeded noise, not market data.
    //   node scripts/generate-guide-cover.mjs --slug will-las-vegas-home-prices-drop \
    //     --category "Market Watch" --subject "Inventory" \
    //     --out las-vegas-inventory-editorial-cover.webp
    image: "/images/covers/las-vegas-inventory-editorial-cover.webp",
    imageMode: "editorial-cover",
    href: "/guides/will-las-vegas-home-prices-drop",
  },
  {
    slug: "downtown-arts-district-guide",
    title: "A Local's Guide to the Downtown Arts District",
    dek: "Where to get coffee, who's actually your neighbor, and what changes after 6pm.",
    byline: "Mikey Del Rosario",
    date: "July 2026",
    publishedAt: "2026-07-15",
    category: "Neighborhoods",
    image: "/images/guide-arts-district-walkable-sidewalk.webp",
    imageAlt:
      "A walkable sidewalk in the Downtown Arts District, storefronts and murals along the street.",
    href: "/neighborhoods/downtown-arts-district",
  },
  {
    slug: "four-seasons-private-residences",
    title: "Four Seasons Private Residences",
    dek: "Henderson's MacDonald Highlands is getting a Four Seasons address. Here's what's actually being built, and what's still unconfirmed.",
    byline: "Mikey Del Rosario",
    date: "July 2026",
    publishedAt: "2026-07-08",
    category: "Local Feature",
    // TEMPORARY card image: the video-thumbnail art (has baked-in title text);
    // approved by Mikey as a stand-in. Swap for a clean drone still when one
    // lands.
    image: "/images/features/four-seasons-private-residences.webp",
    imageAlt:
      "The Four Seasons Private Residences construction site in MacDonald Highlands, Henderson.",
    href: "/neighborhoods/henderson/four-seasons-private-residences",
  },
  {
    slug: "summerlin-fourth-of-july-parade",
    title: "Summerlin Fourth of July Parade",
    dek: "A local look at one of Summerlin's favorite traditions, and what it says about living here.",
    byline: "Mikey Del Rosario",
    date: "July 2026",
    publishedAt: "2026-07-06",
    category: "Local Feature",
    image: "/images/features/summerlin-fourth-of-july-parade-banner.webp",
    imageAlt:
      "Crowds lining a Summerlin street for the Fourth of July parade, flags and floats passing by.",
    href: "/neighborhoods/summerlin/fourth-of-july-parade",
  },
];

/**
 * Every guide eligible to appear in a public feed, newest first.
 *
 * Eligibility is driven entirely by metadata — there is no slug allow/deny
 * list, so a new entry in `guides` surfaces automatically:
 *   1. not a draft,
 *   2. has a real `href` (LVINIT never ships a card that goes nowhere),
 *   3. has a verified `publishedAt` to sort on.
 *
 * Ties on `publishedAt` fall back to registry order — deterministic, and it
 * invents no editorial chronology the dates don't actually support.
 */
export const publishedGuides: Guide[] = guides
  .map((guide, index) => ({ guide, index }))
  .filter(
    ({ guide }) =>
      guide.status !== "draft" &&
      Boolean(guide.href) &&
      Boolean(guide.publishedAt)
  )
  .sort((a, b) => {
    const byDate = b.guide.publishedAt!.localeCompare(a.guide.publishedAt!);
    return byDate !== 0 ? byDate : a.index - b.index;
  })
  .map(({ guide }) => guide);

/** The newest `count` published guides — what "Latest from LVINIT" renders. */
export function latestGuides(count = 3): Guide[] {
  return publishedGuides.slice(0, count);
}
