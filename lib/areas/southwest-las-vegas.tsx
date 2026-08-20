// ---------------------------------------------------------------------------
// SOUTHWEST LAS VEGAS — area guide content
//
// Everything on the page that is a list rather than an essay lives here, so the
// route file stays readable and so Development Watch can be updated by editing
// objects instead of rewriting markup.
//
// FACT-CHECK LOG — verified 2026-08-20. Do not restate any of this from memory;
// re-check against the linked source before changing a status.
//
//  GEOGRAPHY
//  · "Southwest Las Vegas" has no legal definition. No city limit, no county
//    boundary, no census place by that name. It is colloquial usage only, and
//    the page must never present LVINIT's outline as a government boundary.
//  · Enterprise is "an unincorporated Town administered by Clark County",
//    42,950 acres / ~67 sq mi, southwestern Las Vegas Valley. (Clark County
//    Comprehensive Planning.) NOTE: the Review-Journal has described it as a
//    "roughly 46-square-mile area" — different measurement basis. We use the
//    county's own acreage and attribute it to the county.
//  · Spring Valley is a separate unincorporated town, formed May 1981, sitting
//    north of Enterprise.
//  · Enterprise grew almost 60% from 2010 to 2023 against about 20% for the
//    valley overall, reaching 245,243 residents at the end of 2023, with an
//    estimated 13,713 more by 2028. SOURCE OF THE FIGURES IS ESRI, reported by
//    the Review-Journal — NOT Clark County. (An earlier draft of this page
//    mis-attributed them to the county; do not reintroduce that.)
//  · West of I-15 the beltway is county-maintained CC-215 (Bruce Woodbury
//    Beltway). The Interstate 215 designation applies east of I-15 only.
//  · Blue Diamond Road is SR-160.
//
//  COMMUNITIES
//  · Mountain's Edge — Clark County: "approximately 2,500 acres … generally
//    located south of Blue Diamond Road and west of Rainbow Boulevard",
//    ~2,150 ac residential / 114 ac office / 150 ac commercial, ~700 ac public
//    facilities. Development agreement cancelled January 2022; now reviewed
//    under the county Master Plan, Title 30.
//  · Southern Highlands — master-planned community in Enterprise, ~2,300 acres,
//    built around the private Southern Highlands Golf Club (opened April 2000).
//  · Rhodes Ranch — guard-gated master plan around a public golf course; land
//    assembled from 1996, golf club opened November 1997.
//  · Nevada Trails — Pardee-built, early 2000s, includes the gated Estates at
//    Nevada Trails. DELIBERATELY NO HOME COUNT: the only figures available are
//    on agent marketing sites, which the project rules exclude as a source for
//    factual claims. Kept qualitative on purpose.
//
//  PRICING
//  · No median price specific to "Southwest Las Vegas" is published anywhere,
//    because the submarket has no defensible boundary. Do not invent one. The
//    valley-wide LVR figure is cited on the market-watch guide, not here.
//
//  FAIR HOUSING
//  · No school ratings, no crime or safety claims, no demographic
//    characterization, no "great for families"-style steering anywhere on this
//    page. Community fit is expressed through housing stock and location only.
// ---------------------------------------------------------------------------

import Link from "next/link";
import type { AreaQuickFact } from "@/components/area/AreaQuickFacts";
import type { MapPlace } from "@/components/area/LVINITMap";
import type { AreaCommunity } from "@/components/area/AreaCommunities";
import type { DevelopmentProject } from "@/components/area/DevelopmentWatch";
import type { ComparisonRow } from "@/components/area/ComparisonBar";
import type { AreaFaqItem } from "@/components/area/AreaFAQ";
import type { AreaSource } from "@/components/area/AreaSources";
import type { AreaVideoConfig } from "@/components/area/AreaVideoSlot";

const linkClass =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

// --- 1. Quick orientation ---------------------------------------------------

export const quickFacts: AreaQuickFact[] = [
  {
    label: "What it is",
    value:
      "A locally used name for a large chunk of the southwest valley. Not a city, not an official neighborhood.",
  },
  {
    label: "Known for",
    value:
      "Housing variety, newer construction, established pockets in between, and a lot of active building.",
  },
  {
    label: "Major corridors",
    value: "215 Beltway · Durango · Fort Apache · Rainbow · Blue Diamond",
  },
  {
    label: "Areas you'll hear about",
    value:
      "Mountain's Edge · Rhodes Ranch · Nevada Trails · Enterprise · Southern Highlands · the Durango corridor",
  },
];

// --- 2. The map -------------------------------------------------------------

export const mapAsset = {
  src: "/images/maps/southwest-las-vegas-map-lvinit.svg",
  width: 1045,
  height: 977,
  alt:
    "Southwest Las Vegas map showing Mountain's Edge, Rhodes Ranch, Nevada Trails, Enterprise, Southern Highlands, the 215 Beltway, Blue Diamond Road and the Las Vegas Strip.",
};

export const mapPlaces: MapPlace[] = [
  {
    name: "The CC-215 Beltway",
    note: "Runs down the west edge of the valley and then curves southeast through the middle of the Southwest. Almost everything here is oriented to it.",
  },
  {
    name: "I-15",
    note: "The eastern edge, more or less. When people say Southwest they generally stop at the freeway.",
  },
  {
    name: "Blue Diamond Road (SR-160)",
    note: "The diagonal. It leaves I-15 heading west-northwest toward the town of Blue Diamond and Pahrump, cutting across the grid.",
  },
  {
    name: "Durango, Fort Apache and Rainbow",
    note: "The three north-south arterials people use as shorthand for where they live out here.",
  },
  {
    name: "Enterprise and Spring Valley",
    note: "The two unincorporated Clark County towns most of this area actually sits in. Labeled here, not outlined — see the note below.",
  },
  {
    name: "Mountain's Edge",
    note: "The big master plan at the southwest corner, south of Blue Diamond and west of Rainbow.",
  },
  {
    name: "Rhodes Ranch and Nevada Trails",
    note: "Neighboring communities in the middle of the area, either side of the Durango–Fort Apache stretch.",
  },
  {
    name: "Southern Highlands",
    note: "The southern outlier, hard against I-15. Drawn outside the core outline on purpose — plenty of people don't file it under Southwest.",
  },
  {
    name: "UnCommons and Durango Resort",
    note: "The Durango corridor at the 215 — the closest thing the Southwest has to a center.",
  },
  {
    name: "Desert Flow Bike Park",
    note: "Under construction at Warm Springs and Fort Apache. Marked because it's the kind of thing that changes a corner.",
  },
  {
    name: "The Strip and Harry Reid International",
    note: "Reference points to the east, so you can see how the Southwest actually sits relative to them.",
  },
  {
    name: "Downtown Summerlin and Henderson",
    note: "The other two answers most people are weighing, marked for orientation.",
  },
];

// --- 3. Communities ---------------------------------------------------------
// `href` is intentionally absent on every entry: none of these have their own
// page yet. Add the path here the day one ships and the name becomes a link.

export const communities: AreaCommunity[] = [
  {
    name: "Mountain's Edge",
    where: "South of Blue Diamond Rd, west of Rainbow Blvd",
    summary:
      "The biggest single master plan out here — roughly 2,500 acres inside the town of Enterprise, running right up against the desert at the southwest corner of the valley.",
    housing:
      "Overwhelmingly 2000s-and-later single-family, in a long run of separate builder subdivisions. Some gated, most not.",
    distinct:
      "Parks and trails are the reason people cite it. Clark County set aside around 700 acres across the plan for public facilities, and Exploration Peak and Mountains Edge Regional Park are genuinely big pieces of open space, not token greenbelt.",
    worthExploring:
      "Worth a look if you want newer suburban housing with real parkland attached and you're relaxed about being at the far southwest edge, well away from Downtown Las Vegas.",
  },
  {
    name: "Rhodes Ranch",
    where: "Around Durango and Fort Apache, north of Warm Springs",
    summary:
      "A guard-gated master plan wrapped around a public golf course, assembled from the mid-1990s and largely built out well before the newer subdivisions around it.",
    housing:
      "One- and two-story single-family behind a staffed gate, plus condo and townhome pockets. Older stock than most of the Southwest, so mature landscaping.",
    distinct:
      "The gate and the golf course. It reads as a self-contained place in a way most of the surrounding grid does not, and the trees have had time to grow.",
    worthExploring:
      "Worth exploring if you want a guarded entrance and an established, finished feel, and you'd trade the newest possible construction to get it.",
  },
  {
    name: "Nevada Trails",
    where: "Between Rhodes Ranch and the Rainbow corridor",
    summary:
      "An early-2000s Pardee community sitting in the middle of everything, with the gated Estates at Nevada Trails inside it. Quieter and less talked-about than its neighbors.",
    housing:
      "Single-family from the early 2000s, a wide range of floor plans, with a gated section and non-gated streets in the same community.",
    distinct:
      "It's the clearest example of how fast the Southwest changes street to street — it's ringed by Rhodes Ranch, Mountain's Edge and Southern Highlands, and doesn't feel like any of them.",
    worthExploring:
      "Worth driving if you want something twenty-odd years old rather than five, central to the area's arterials, without paying for a master-plan name.",
  },
  {
    name: "Southern Highlands",
    where: "The southern edge, either side of I-15",
    summary:
      "A roughly 2,300-acre master plan in Enterprise built around a private golf club, at the very bottom of the valley. Whether it counts as Southwest is genuinely disputed.",
    housing:
      "The widest range in the area — production single-family through custom and guard-gated estate housing, plus townhomes and condos.",
    distinct:
      "Its access is oriented to I-15 and St. Rose rather than the 215, which makes daily life here point south and east while the rest of the Southwest points north and west.",
    worthExploring:
      "Worth exploring if I-15 is your commute, or if you want a wider spread of price points and lot sizes inside one master plan.",
  },
  {
    name: "The Durango corridor",
    where: "Durango Dr at the CC-215, around Sunset and Warm Springs",
    summary:
      "Not a residential community — a commercial spine. UnCommons, Durango Casino & Resort, IKEA and The Bend all sit within about a mile of each other here, with apartments filling in around them.",
    housing:
      "Apartments and mid-rise rentals rather than for-sale housing, with established single-family subdivisions immediately behind on the side streets.",
    distinct:
      "It's the only part of the Southwest where you can park once and walk between things. That's new, it's deliberate, and it's about the size of a couple of city blocks.",
    worthExploring:
      "Worth exploring if you want to rent first, or if you want to buy nearby and have somewhere to walk to on a Saturday without getting back in the car.",
  },
  {
    name: "Enterprise",
    where: "Most of the map, and then some",
    summary:
      "Not a neighborhood — an unincorporated Clark County town of about 67 square miles that swallows most of what people call Southwest, plus a good deal that nobody would.",
    housing:
      "Everything. Master plans, 1990s subdivisions, brand-new infill, larger-lot and semi-rural pockets, apartment corridors and horse property, all under one town name.",
    distinct:
      "It's an administrative unit, not a place with a character. If someone tells you a home is 'in Enterprise' they've told you which town advisory board covers it and almost nothing else.",
    worthExploring:
      "Useful to know because it's what your address, your permits and your county services actually attach to — but don't shop by it. Shop by the subdivision.",
  },
];

// --- 4. Development Watch ---------------------------------------------------
// Status is grouped strictly: open / under-construction / planned. Every entry
// carries the source the status came from. If a status can't be sourced, the
// project doesn't go on the page.

export const developmentProjects: DevelopmentProject[] = [
  {
    name: "UnCommons",
    status: "open",
    where: "Durango Dr, just south of the CC-215",
    what: "A 40-acre mixed-use campus with four office buildings — all of them leased — plus restaurants, coffee, a coworking space, an event venue, a central plaza and the Vestra apartments. It's the most concentrated attempt anyone has made at building the Southwest a center.",
    caveat:
      "The developer's own marketing quotes full build-out targets for office square footage and residential units. Those are targets, not what exists.",
    source: {
      label: "Matter Real Estate Group / NVBEX, June 2026",
      url: "https://nevbex.com/2026/06/01/uncommons-fifth-office-building-las-vegas/",
    },
  },
  {
    name: "The Bend",
    status: "open",
    where: "Sunset Rd between Durango Dr and Riley St, across from IKEA",
    what: "Dapper Companies' dining and retail development on roughly ten acres. Substantially open and busy — Electric Pickle, Mothership Coffee, Marufuku Ramen, Aces & Ales, St. Felix, Freed's, Butcher & Thief — with further phases still to come.",
    caveat:
      "Published square footages conflict between sources, so none is stated here.",
    source: {
      label: "LVINIT site visit, July 2026 · tenants via Las Vegas Review-Journal",
      url: "https://www.reviewjournal.com/business/more-tenants-sign-on-to-electric-pickle-anchored-valley-project-2989833/",
    },
  },
  {
    name: "Rainbow & Blue Diamond industrial parks",
    status: "open",
    where: "S Rainbow Blvd around Richmar Ave, south of Blue Diamond Rd",
    what: "Two completed logistics developments — Panattoni's 422,000 sq ft Oasis Commerce Center and the four-building, roughly 256,000 sq ft Rainbow @ Blue Diamond park. Worth knowing about if you're looking at homes nearby: this corner of the Southwest is a working industrial corridor now, with the truck traffic that implies.",
    caveat:
      "Oasis Commerce Center's completed status is per CBRE's leasing listing for the property, not the developer.",
    source: {
      label: "EBS Realty Partners",
      url: "https://www.rainbowbluediamond.com/",
    },
  },
  {
    name: "Durango Casino & Resort — third expansion phase",
    status: "under-construction",
    where: "Durango Dr at the CC-215, on the north parking lot",
    what: "Station Casinos began a $385 million, roughly 275,000 sq ft expansion in January 2026, adding a 36-lane bowling center, movie theaters, restaurants and food-hall outlets, more gaming and further entertainment space. The resort stays open throughout.",
    caveat:
      "Reported as roughly an 18-month build. No firm opening date has been published, and no hotel tower is part of this phase.",
    source: {
      label: "CDC Gaming, January 2026",
      url: "https://cdcgaming.com/durango-casino-starts-385-million-expansion/",
    },
  },
  {
    name: "Desert Flow at Southwest Ridge Bike Skills Park",
    status: "under-construction",
    where: "Warm Springs Rd at Fort Apache Rd",
    what: "A 17-acre Clark County bike park with skills courses, a pump track, dirt trails, a 12-foot-wide paved main trail, an entry plaza, restrooms, shade and a 50-space lot. Ground was broken in late January 2026 and the county's page says construction is underway.",
    caveat:
      "The county said it hoped to open the park by the end of 2026. That's a hope, not a published opening date.",
    source: {
      label: "Clark County Parks & Recreation",
      url: "https://www.clarkcountynv.gov/government/departments/parks___recreation/special_use_facility/desert-flow-bike-park",
    },
  },
  {
    name: "Life Time",
    status: "under-construction",
    where: "Durango Dr at Sunset Rd, across from IKEA",
    what: "A 128,000 sq ft athletic club going up on the Durango corridor, reported as scheduled to open in late 2026.",
    source: {
      label: "Las Vegas Review-Journal, projects to watch in 2026",
      url: "https://www.reviewjournal.com/business/housing/las-vegas-real-estate-projects-to-watch-in-2026-3601967/",
    },
  },
  {
    name: "CC-215 on-ramps at Sunset and Durango",
    status: "under-construction",
    where: "CC-215 at Sunset Rd and Durango Dr",
    what: "Clark County Public Works is rebuilding the ramps at the two busiest Southwest beltway interchanges, including widening the westbound CC-215 off-ramp at Durango to add a left-turn lane onto southbound Durango. Expect lane restrictions here for a while.",
    source: {
      label: "Clark County Public Works",
      url: "https://www.clarkcountynv.gov/government/departments/public_works_department/cc215-sunset-and-durango-on-ramps",
    },
  },
  {
    name: "Sunset Road — Durango to Decatur, Phase 1",
    status: "under-construction",
    where: "Sunset Rd, Durango Dr to Decatur Blvd",
    what: "A county roadway project along the Sunset corridor, the main east-west connector across the north edge of the Southwest.",
    source: {
      label: "Clark County Public Works — projects in construction",
      url: "https://www.clarkcountynv.gov/government/departments/public_works_department/projects-in-construction",
    },
  },
  {
    name: "Rainbow Boulevard — Blue Diamond to the CC-215",
    status: "under-construction",
    where: "Rainbow Blvd, Blue Diamond Rd to CC-215",
    what: "County work along the Rainbow corridor through the middle of the Southwest — the stretch that carries traffic between Mountain's Edge, the industrial parks and the beltway.",
    source: {
      label: "Clark County Public Works — projects in construction",
      url: "https://www.clarkcountynv.gov/government/departments/public_works_department/projects-in-construction",
    },
  },
  {
    name: "UnCommons fifth office building",
    status: "planned",
    where: "Western end of the UnCommons campus, Durango Dr",
    what: "Matter Real Estate Group announced the campus's fifth and final office building in May 2026 — three stories on a 1.4-acre parcel between the DraftKings building and a parking garage, about 39,000 sq ft of office over roughly 20,000 sq ft of ground-floor retail, targeted to be tenant-ready in the first quarter of 2028.",
    caveat:
      "Announced, not started. No construction start date has been published, so treat renderings accordingly.",
    source: {
      label: "NVBEX, June 2026",
      url: "https://nevbex.com/2026/06/01/uncommons-fifth-office-building-las-vegas/",
    },
  },
  {
    name: "Domus at UnCommons",
    status: "planned",
    where: "UnCommons campus, Durango Dr",
    what: "A second residential phase of roughly 454 units, reported as still in design.",
    caveat: "In design. Not approved for construction as far as we can verify.",
    source: {
      label: "Las Vegas Review-Journal",
      url: "https://www.reviewjournal.com/business/big-las-vegas-project-set-for-more-construction-3829291/",
    },
  },
];

// --- 5. Southwest vs Summerlin ---------------------------------------------

export const summerlinComparison: ComparisonRow[] = [
  {
    dimension: "A more cohesive, master-planned environment",
    leans: "Summerlin",
    because:
      "One developer, one plan, decades of execution. The Southwest is many separate plans that happened to fill the same area.",
  },
  {
    dimension: "More variety in neighborhood types and housing stock",
    leans: "Southwest",
    because:
      "Gated master plans, 1990s subdivisions, brand-new infill, larger-lot pockets and apartment corridors, sometimes within a mile of each other.",
  },
  {
    dimension: "A closer connection to Red Rock and west-valley recreation",
    leans: "Summerlin",
    because: "It sits directly against the conservation area.",
  },
  {
    dimension: "Strong 215 access",
    leans: "Both",
    because:
      "The beltway serves both, and which one is quicker depends entirely on the specific address and the direction you're heading.",
  },
  {
    dimension: "More visible infill and undeveloped parcels",
    leans: "Southwest",
    because:
      "Large sections are still being finished, so vacant land and active construction are a normal part of the view.",
  },
  {
    dimension: "An established, centralized commercial core",
    leans: "Summerlin",
    because:
      "Downtown Summerlin is a genuine center. The Southwest's nearest equivalent, the Durango corridor, is newer and smaller.",
  },
];

// --- 6. Video ---------------------------------------------------------------
// youtubeId stays undefined until the video is actually published. Setting it
// here is the only change needed to turn the slot into a real player.

export const areaVideo: AreaVideoConfig = {
  title:
    "Summerlin vs Henderson vs Southwest Las Vegas — LVINIT with Mikey Del Rosario",
};

// --- 7. FAQ -----------------------------------------------------------------

export const faqItems: AreaFaqItem[] = [
  {
    question: "What is considered Southwest Las Vegas?",
    answer: (
      <>
        Loosely, the part of the valley south of Tropicana and west of I-15,
        centerd on the Durango, Fort Apache and Rainbow corridors and the stretch
        of the 215 Beltway that curves through them. Most people mean roughly
        Russell Road down past Blue Diamond, and Hualapai across to about
        Decatur. There is no official version of that line, so two locals can use
        the term and mean noticeably different areas.
      </>
    ),
  },
  {
    question: "Is Southwest Las Vegas a city?",
    answer: (
      <>
        No. It isn&rsquo;t a city, a town, or a census place — it&rsquo;s a
        colloquial name. Most of it isn&rsquo;t even inside the City of Las
        Vegas: it&rsquo;s unincorporated Clark County, so your mailing address
        says Las Vegas while your permits, code questions and local services go
        through the county.
      </>
    ),
  },
  {
    question: "Is Enterprise the same as Southwest Las Vegas?",
    answer: (
      <>
        They overlap heavily but they aren&rsquo;t the same thing. Enterprise is
        a real administrative unit — an unincorporated town of about 67 square
        miles that Clark County administers. It covers most of what people call
        Southwest, and also plenty that nobody would. Southwest is a name people
        use; Enterprise is a line on a county map.
      </>
    ),
  },
  {
    question: "Is Southwest Las Vegas inside the City of Las Vegas?",
    answer: (
      <>
        Mostly no. The bulk of it sits in unincorporated Clark County, across the
        towns of Enterprise and Spring Valley. That matters less than people
        expect day to day, but it decides who you call about a permit, a pothole
        or a code question.
      </>
    ),
  },
  {
    question: "Is Mountain's Edge in Southwest Las Vegas?",
    answer: (
      <>
        Yes — it&rsquo;s one of the areas people most reliably mean. Clark County
        describes it as a master-planned community of about 2,500 acres inside
        the town of Enterprise, generally south of Blue Diamond Road and west of
        Rainbow Boulevard.
      </>
    ),
  },
  {
    question: "Is Rhodes Ranch in Southwest Las Vegas?",
    answer: (
      <>
        Yes. It sits in the middle of the area around Durango and Fort Apache,
        and it&rsquo;s one of the older communities out here — guard-gated,
        wrapped around a golf course, and built out largely before the
        subdivisions around it.
      </>
    ),
  },
  {
    question: "Is Southern Highlands considered Southwest Las Vegas?",
    answer: (
      <>
        Sometimes. It&rsquo;s in the same county town — Enterprise — but it sits
        at the very bottom of the valley against I-15, and its access points
        south and east rather than to the 215. Plenty of locals treat it as its
        own thing. That disagreement is exactly why this page draws two outlines
        on the map instead of one.
      </>
    ),
  },
  {
    question: "How far is Southwest Las Vegas from the Strip?",
    answer: (
      <>
        Close enough that it&rsquo;s not a problem, and too variable to put a
        number on. The area is big — a home off Blue Diamond and a home at
        Durango and the 215 aren&rsquo;t the same trip — and the answer swings
        with the hour. Getting to the south Strip and Harry Reid International is
        the easy direction from most of the Southwest; crossing the valley
        northeast at rush hour is the hard one. Drive it yourself at the time
        you&rsquo;d really be driving it.
      </>
    ),
  },
  {
    question: "Is Southwest Las Vegas the same as Summerlin?",
    answer: (
      <>
        No, and they&rsquo;re close to opposites in how they were made. Summerlin
        is one master plan built out over decades, with a real center in Downtown
        Summerlin. The Southwest is dozens of separate developments that filled
        the same area over the same period. You can read the full{" "}
        <Link href="/neighborhoods/summerlin" className={linkClass}>
          Summerlin guide
        </Link>{" "}
        for the other side of that trade.
      </>
    ),
  },
  {
    question: "What neighborhoods are in Southwest Las Vegas?",
    answer: (
      <>
        The names you&rsquo;ll hear most are Mountain&rsquo;s Edge, Rhodes Ranch,
        Nevada Trails, Southern Highlands and the newer development along the
        Durango corridor — all inside the county towns of Enterprise and, at the
        north end, Spring Valley. There are many more subdivisions than that; the
        area is a patchwork of separate builder tracts rather than a small set of
        named neighborhoods.
      </>
    ),
  },
];

// --- 8. Sources -------------------------------------------------------------

export const sources: AreaSource[] = [
  {
    label: "Clark County Comprehensive Planning — Enterprise",
    url: "https://www.clarkcountynv.gov/government/departments/comprehensive_planning_department/divisions/advanced_planning_division/enterprise",
    used: "Enterprise as an unincorporated town administered by Clark County; 42,950 acres / about 67 square miles.",
  },
  {
    label: "Clark County Comprehensive Planning — Mountain's Edge",
    url: "https://www.clarkcountynv.gov/government/departments/comprehensive_planning_department/library/mountains-edge",
    used: "Mountain's Edge acreage, location, land-use split and the roughly 700 acres of public facilities.",
  },
  {
    label: "Clark County Public Works — projects in construction",
    url: "https://www.clarkcountynv.gov/government/departments/public_works_department/projects-in-construction",
    used: "Which Southwest road projects are actually in construction rather than in design.",
  },
  {
    label: "Clark County Parks & Recreation — Desert Flow Bike Park",
    url: "https://www.clarkcountynv.gov/government/departments/parks___recreation/special_use_facility/desert-flow-bike-park",
    used: "Desert Flow's size, location and under-construction status.",
  },
  {
    label: "Las Vegas Review-Journal — southwest valley growth",
    url: "https://www.reviewjournal.com/business/housing/how-fast-is-the-southwest-las-vegas-valley-growing-3046446/",
    used: "Enterprise growth of almost 60% from 2010 to 2023 against about 20% valley-wide, and 245,243 residents at the end of 2023. The underlying figures are Esri's, not the county's.",
  },
  {
    label: "NVBEX — UnCommons fifth office building",
    url: "https://nevbex.com/2026/06/01/uncommons-fifth-office-building-las-vegas/",
    used: "The fifth office building's size, parcel, Q1 2028 target and announced-not-started status.",
  },
  {
    label: "CDC Gaming — Durango Casino expansion",
    url: "https://cdcgaming.com/durango-casino-starts-385-million-expansion/",
    used: "The $385 million third-phase expansion, its January 2026 start and what it adds.",
  },
  {
    label: "Las Vegas Review-Journal — projects to watch in 2026",
    url: "https://www.reviewjournal.com/business/housing/las-vegas-real-estate-projects-to-watch-in-2026-3601967/",
    used: "Life Time at Durango and Sunset — 128,000 sq ft, scheduled to open late 2026.",
  },
  {
    label: "CBRE — Oasis Commerce Center",
    url: "https://www.cbre.com/properties/properties-for-lease/industrial/details/US-SMPL-100161/oasis-commerce-center-s-rainbow-blvd-w-richmar-ave-las-vegas-nv-89139",
    used: "The Panattoni industrial development at Rainbow and Richmar being complete — 422,000 sq ft.",
  },
];
