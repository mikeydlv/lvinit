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
    metrics: { medianPrice: 615000, walkScore: 54, commuteToStrip: 27, schoolRating: 8.2 },
  },
  {
    slug: "henderson",
    name: "Henderson",
    headlineStat: { label: "Median Price", value: "$525K" },
    tags: ["top-schools", "quiet-suburban"],
    description:
      "Vegas's quiet second city — parks, good schools, and a slower pace ten minutes from everything.",
    metrics: { medianPrice: 525000, walkScore: 48, commuteToStrip: 24, schoolRating: 8.0 },
  },
  {
    slug: "downtown-arts-district",
    name: "Downtown Arts District",
    headlineStat: { label: "Walk Score", value: "88" },
    tags: ["walkable", "up-and-coming", "close-to-strip"],
    description:
      "Murals, coffee counters, and the closest thing Vegas has to a walk-everywhere neighborhood.",
    metrics: { medianPrice: 410000, walkScore: 88, commuteToStrip: 12, schoolRating: 6.4 },
  },
  {
    slug: "green-valley",
    name: "Green Valley",
    headlineStat: { label: "School Rating", value: "8.6 / 10" },
    tags: ["top-schools", "quiet-suburban"],
    description:
      "Established, tree-lined, and consistently the answer when someone asks about schools first.",
    metrics: { medianPrice: 495000, walkScore: 51, commuteToStrip: 22, schoolRating: 8.6 },
  },
  {
    slug: "lake-las-vegas",
    name: "Lake Las Vegas",
    headlineStat: { label: "Median Price", value: "$780K" },
    tags: ["quiet-suburban"],
    description:
      "Water where you don't expect it, and a resort-quiet pace year-round.",
    metrics: { medianPrice: 780000, walkScore: 39, commuteToStrip: 32, schoolRating: 7.8 },
  },
];

export const filterChips: Array<{
  label: string;
  value: Neighborhood["tags"][number];
}> = [
  { label: "Walkable", value: "walkable" },
  { label: "Top Schools", value: "top-schools" },
  { label: "Quiet & Suburban", value: "quiet-suburban" },
  { label: "Close to the Strip", value: "close-to-strip" },
  { label: "Up-and-Coming", value: "up-and-coming" },
];

export type ResidentQuote = {
  quote: string;
  name: string;
  context: string;
};

// PLACEHOLDER — replace with real, sourced resident interviews before launch.
export const residentQuotes: ResidentQuote[] = [
  {
    quote:
      "I didn't expect to fall in love with a neighborhood before I fell in love with a house. But that's exactly what happened.",
    name: "Jenna",
    context: "Green Valley",
  },
  {
    quote:
      "He told me not to buy in the first neighborhood I liked. That's when I trusted him.",
    name: "Marcus",
    context: "formerly of Chicago, on working with Mikey",
  },
];

export type VideoItem = {
  id: string;
  title: string;
  duration: string;
};

// PLACEHOLDER — titles illustrate the "answer a real doubt" direction from
// Doc 03 §3.9; replace with real produced content before launch.
export const videos: VideoItem[] = [
  { id: "affordability", title: "Is Las Vegas actually affordable right now?", duration: "6:12" },
  { id: "heat", title: "What nobody tells you about the heat", duration: "4:47" },
  { id: "rent-vs-buy", title: "Renting first vs. buying first — what I tell my clients", duration: "8:03" },
  { id: "schools", title: "How to actually judge a school district here", duration: "5:35" },
];

export type Guide = {
  slug: string;
  title: string;
  dek: string;
  byline: string;
  date: string;
  category: string;
  pullQuote?: string;
};

// PLACEHOLDER — replace with real published guides before launch.
export const guides: Guide[] = [
  {
    slug: "summerlin-vs-henderson",
    title: "Summerlin vs. Henderson: Where Should You Actually Move?",
    dek: "Two of the city's most-recommended suburbs, compared honestly — schools, commute, and the tradeoffs nobody puts in a brochure.",
    byline: "Mikey Del Rosario",
    date: "June 2026",
    category: "Comparisons",
    pullQuote:
      "Both are good answers. They're just good answers to different questions.",
  },
  {
    slug: "cost-of-living-2026",
    title: "What It Actually Costs to Live in Las Vegas in 2026",
    dek: "A real budget breakdown, neighborhood by neighborhood.",
    byline: "LVINIT Editorial",
    date: "May 2026",
    category: "Moving Here",
  },
  {
    slug: "downtown-arts-district-guide",
    title: "A Local's Guide to the Downtown Arts District",
    dek: "Where to get coffee, who's actually your neighbor, and what changes after 6pm.",
    byline: "Mikey Del Rosario",
    date: "April 2026",
    category: "Neighborhoods",
  },
  {
    slug: "first-summer-in-vegas",
    title: "Surviving Your First Las Vegas Summer",
    dek: "The practical version, not the panicked version.",
    byline: "LVINIT Editorial",
    date: "March 2026",
    category: "Moving Here",
  },
];
