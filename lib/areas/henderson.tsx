// ---------------------------------------------------------------------------
// HENDERSON — area guide content
//
// Everything on the page that is a list rather than an essay lives here, so the
// route file stays readable and so Development Watch can be updated by editing
// objects instead of rewriting markup. Same split as
// lib/areas/southwest-las-vegas.tsx and lib/areas/summerlin.tsx.
//
// FACT-CHECK LOG — verified 2026-08-27. Do not restate any of this from memory;
// re-check against the linked source before changing a figure or a status.
//
//  WHAT HENDERSON IS
//  · An INCORPORATED CITY, not a community and not a master plan. Incorporated
//    16 April 1953. Nevada's second largest city.
//  · City of Henderson Fact Sheet (Mayor and Council), the city's own published
//    numbers: total population 369,167 (January 2025); total area "nearly
//    118.5" square miles; elevation 1,940 feet.
//  · The 2020 census counted 317,610 residents and recorded 106.43 sq mi of
//    land area. That is a different, older vintage than the city's own figure
//    and the city has annexed land since; the page uses the city's number and
//    does not pretend the two reconcile.
//  · TWO CITY FIGURES, both the city's own, and they differ. The Fact Sheet
//    says "nearly 118.5" sq mi. The polygon in the city's GIS city-boundary
//    layer measures 121.96 sq mi / 78,056.45 acres. The page cites the Fact
//    Sheet figure in prose and the GIS figure only where it describes the drawn
//    map, which is what that polygon actually is. Do not merge them.
//
//  THE BOUNDARY (City of Henderson GIS, retrieved 2026-08-27 — see
//  scripts/prep-henderson-map-geometry.mjs)
//  · One outer ring plus 22 interior rings. The interior rings are
//    unincorporated Clark County pockets the city grew around without annexing.
//  · Measured off the official polygon: roughly 17.6 miles east to west against
//    16.1 miles north to south. This is the single most important fact on the
//    page and it is why the guide argues what it argues.
//  · Point-in-polygon tested, and worth knowing: the M Resort IS inside the
//    city limits; Harry Reid International Airport, Southern Highlands,
//    Silverado Ranch and the Whitney CDP are NOT. A Henderson mailing address
//    and the City of Henderson are not the same thing in either direction.
//
//  HISTORY
//  · Basic Magnesium, Inc. Around 2,700 workers began building the BMI complex
//    in September 1941; the plant opened February 1942 and drew roughly 15,000
//    workers. At peak it produced about 25% of the nation's magnesium. The town
//    exists because of that plant. (Wikipedia, Henderson, Nevada.)
//  · GREEN VALLEY was Southern Nevada's first master-planned community, before
//    Summerlin. American Nevada Corporation began planning it in 1973; the
//    grand opening was 24 October 1978; the master community covers 8,400
//    acres. Green Valley South began construction around 1985, Green Valley
//    Ranch in 1994. (Wikipedia, Green Valley, Henderson.)
//
//  COMMUNITY FIGURES
//  · ANTHEM: developed by Del Webb, opened 1998. 2,535 acres approved November
//    1997; a 1999 BLM land exchange added about the same again, taking it past
//    5,000 acres. Planned at 11,000 to 13,000 homes. Three subdivisions:
//    Anthem Country Club, Sun City Anthem, Coventry Homes at Anthem.
//    (Wikipedia, Anthem, Henderson.)
//  · LAKE LAS VEGAS: a 320-acre reservoir with a 3,592-acre developed area
//    around it. Filling began in 1991 through the WWII-era BMI pipeline drawing
//    raw Lake Mead water. Chapter 11 filed 17 July 2008; emerged from
//    bankruptcy July 2010. (Wikipedia, Lake Las Vegas.)
//  · CADENCE: the community's own site describes its central park as "nearly 50
//    acres" and lists its current builders. NO total acreage or home count is
//    published here: the figures in circulation come from real-estate marketing
//    pages, not from Cadence, and we could not confirm them at the source.
//  · INSPIRADA / SEVEN HILLS / MACDONALD HIGHLANDS / ASCAYA: described
//    qualitatively only. Acreage and home-count figures for these circulate
//    widely on agent SEO pages and could not be traced to a primary source, so
//    they are not repeated here.
//  · WEST HENDERSON is a CITY PLANNING AREA, not a community. Its Land Use Plan
//    was approved unanimously by City Council on 2 December 2014 and has been
//    amended since. (City of Henderson.)
//
//  TRANSPORTATION — check the designations before writing them
//  · The freeway through Henderson is I-11, concurrent with US-93 and US-95.
//    I-11 was extended through the Las Vegas Valley on 21 May 2024 and I-515
//    was DECOMMISSIONED at that point. The city's own Fact Sheet still lists
//    I-515; it is out of date. OSM tags the roadway I 11;US 93;US 95.
//  · The beltway through Henderson carries the Interstate 215 designation. Only
//    the western leg, outside Henderson, is the county-maintained CC-215.
//  · St. Rose Pkwy is SR-146. Boulder Hwy is SR-582. Lake Mead Pkwy is SR-564.
//  · Henderson Executive Airport is in Henderson. HARRY REID INTERNATIONAL IS
//    NOT — it is in Paradise, and the page must not imply otherwise.
//
//  PARKS (City of Henderson Fact Sheet)
//  · 76 city parks including 5 school parks; nearly 1,400 total acres of
//    developed parks and trails; more than 300 miles of multi-use trails; 11
//    aquatic facilities at six locations; 7 skate parks.
//  · Sloan Canyon National Conservation Area: 48,438 acres (BLM). Petroglyph
//    Canyon holds more than 300 rock art panels with 1,700 individual design
//    elements. Nawghaw Poa Road and its parking are CLOSED 12 November 2024 to
//    11 November 2026 while the permanent visitor contact station is built;
//    trails rerouted and parking moved to Democracy Drive.
//
//  PRICING
//  · No "average Henderson home price" is published on this page. Henderson is
//    an incorporated city of roughly 118 square miles containing age-restricted
//    condos and custom hillside homesites, and any single median across that
//    range describes nothing. The valley-wide LVR figure lives on the
//    market-watch guide.
//
//  FAIR HOUSING
//  · No school ratings, no crime or safety claims, no demographic
//    characterization of residents, no "great for families"-style steering
//    anywhere on this page. Fit is expressed through housing stock, geography
//    and daily logistics only.
//  · School COUNTS from the city's Fact Sheet are facts and may be cited. No
//    claim about school quality appears anywhere.
//  · Sun City Anthem and Sun City MacDonald Ranch are described as
//    age-restricted HOUSING — that is the legal designation of the product
//    itself, not a suggestion about who should live where.
// ---------------------------------------------------------------------------

import { Fragment } from "react";
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

// The names in the fourth orientation column, authored as the lines they should
// actually set on rather than left to the browser. Same reasoning as the
// Summerlin guide: the column is 284px at every desktop width and the type is
// 17px, so left as one string these names break through the middle of
// "Green Valley Ranch" and "MacDonald Highlands". Each pair below measures
// under 282px, so it sets on one line here and on a 375px phone alike.
const nameLines = [
  ["Green Valley", "Green Valley Ranch"],
  ["Anthem", "Seven Hills"],
  ["Inspirada", "West Henderson"],
  ["Cadence", "Lake Las Vegas"],
  ["MacDonald Highlands", "Ascaya"],
];

export const quickFacts: AreaQuickFact[] = [
  {
    label: "What it is",
    value:
      "An incorporated city of its own, roughly 118 square miles of it, on the south-east side of the Las Vegas Valley. Not a neighborhood and not a master plan.",
  },
  {
    label: "Known for",
    value:
      "Range. Green Valley's grown-in streets, hillside estates in the south, a lake in the north-east, a historic downtown, and the valley's busiest industrial growth front in the west.",
  },
  {
    label: "Major corridors",
    value: "I-11 · I-215 · I-15 · St. Rose Pkwy · Boulder Hwy · Lake Mead Pkwy · Horizon Ridge",
  },
  {
    label: "Names you'll hear",
    // Nodes rather than one string, purely so the breaks are authored. Same
    // names, same wording, same type as the three columns beside it; only the
    // line breaks change. Each name is individually nowrap, so if the type ever
    // reflows it still breaks between names rather than through one.
    value: (
      <span className="block">
        {nameLines.map((line) => (
          <span key={line.join()} className="block">
            {line.map((name, i) => (
              <Fragment key={name}>
                {i > 0 ? " " : ""}
                <span className="whitespace-nowrap">
                  {i > 0 ? "· " : ""}
                  {name}
                </span>
              </Fragment>
            ))}
          </span>
        ))}
      </span>
    ),
  },
];

// --- 2. The map -------------------------------------------------------------

export const mapAsset = {
  src: "/images/maps/henderson-neighborhoods-map-lvinit.svg",
  width: 987,
  height: 1026,
  alt:
    "Map of Henderson, Nevada showing the official City of Henderson boundary and the communities inside it: Green Valley and Green Valley Ranch, Whitney Ranch, Seven Hills, Anthem, Inspirada, MacDonald Highlands, Ascaya, the Water Street District, Cadence and Lake Las Vegas, with I-11, I-215, I-15, St. Rose Parkway, Boulder Highway and Lake Mead Parkway.",
};

export const mapPlaces: MapPlace[] = [
  {
    name: "The blue outline",
    note: "The real City of Henderson boundary, from the city's own GIS. Everything inside it is Henderson; everything outside it isn't, whatever the mailing address says.",
  },
  {
    name: "The gaps inside the outline",
    note: "Unincorporated Clark County pockets the city grew around without annexing. There are 22 of them, and most are far too small to see at this scale.",
  },
  {
    name: "Green Valley and Green Valley Ranch",
    note: "The established middle of the city, west of Water Street. Green Valley is the original 1978 master plan; Green Valley Ranch is a newer community inside its boundaries, not a synonym for it.",
  },
  {
    name: "Seven Hills and Anthem",
    note: "The southern hillsides, climbing toward the McCullough Range. Elevation, views, and the longest drives to the rest of the valley.",
  },
  {
    name: "MacDonald Highlands and Ascaya",
    note: "Marked with open circles rather than solid dots, because they are custom-home developments rather than master-planned communities. Different kind of thing, different kind of purchase.",
  },
  {
    name: "Inspirada and West Henderson",
    note: "The city's growth front. Inspirada is a community; West Henderson is a City of Henderson planning area, which is why it gets a label and no marker.",
  },
  {
    name: "Water Street",
    note: "A square rather than a circle: this is Henderson's downtown commercial district, the original town, not a residential community.",
  },
  {
    name: "Cadence and Lake Las Vegas",
    note: "The eastern half. Cadence is the newest large master plan; Lake Las Vegas sits further north-east around a man-made lake and functions almost as its own place.",
  },
  {
    name: "I-11 (with US-93 and US-95)",
    note: "The freeway spine, running north-west to south-east across the city toward Railroad Pass and Boulder City. It was signed I-515 until 2024.",
  },
  {
    name: "I-215",
    note: "Crosses the northern end of Henderson and connects west toward the airport and I-15. The stretch between Pecos and Stephanie is being widened right now.",
  },
  {
    name: "Sloan Canyon National Conservation Area",
    note: "The gold line along the south. Federal BLM land, and the reason Henderson stops climbing into the McCullough Range.",
  },
  {
    name: "Las Vegas Boulevard",
    note: "Drawn but not labeled. It runs parallel to I-15 and only about twenty pixels from it at this scale, so a label could not honestly say which road it belonged to.",
  },
];

// Named in the map key rather than plotted on the map itself, to keep the
// drawing legible. See the header of scripts/generate-henderson-map.mjs.
export const mapOmitted = [
  "Tuscany",
  "Sun City Anthem",
  "Anthem Country Club",
  "Sun City MacDonald Ranch",
  "Calico Ridge",
  "Mission Hills",
  "Madeira Canyon",
];

// --- 3. Communities ---------------------------------------------------------
//
// `href` is deliberately absent on every entry: none of these has its own guide
// yet, and an unlinked name is correct where a dead link never is. The day a
// child guide ships, adding `href` here is the only change needed.

export const communities: AreaCommunity[] = [
  {
    name: "Green Valley",
    where: "West-central Henderson, around Green Valley Pkwy between I-215 and Horizon Ridge Pkwy",
    summary:
      "Southern Nevada's first master-planned community, and it beat Summerlin to it by twelve years. American Nevada Corporation started planning in 1973 and held the grand opening on 24 October 1978. The master community covers 8,400 acres, which makes it larger than several whole cities elsewhere.",
    housing:
      "Almost entirely resale, mostly late 1970s through the 1990s, from modest single-story homes to gated custom pockets. The trees are the tell: this is one of the few parts of the valley with genuine canopy over the sidewalk.",
    distinct:
      "Age. Nothing else in Henderson has had forty-eight years of irrigation, and it shows on every street.",
    worthExploring:
      "The place to start if you want a finished, grown-in street and don't need the house to be new. Also the shortest run from Henderson to the middle of the valley.",
  },
  {
    name: "Green Valley Ranch",
    where: "South of Green Valley proper, around Paseo Verde Pkwy and Green Valley Pkwy",
    summary:
      "A newer community inside the Green Valley master community's boundaries, begun in 1994. People use the two names interchangeably and they are not interchangeable: Green Valley Ranch is a part of Green Valley, roughly sixteen years younger.",
    housing:
      "1990s and 2000s single-family, with gated enclaves, attached product and some larger custom homes on the higher ground toward Anthem.",
    distinct:
      "The District at Green Valley Ranch, an open-air center that gives this part of Henderson something close to a walkable evening. Lee's Family Forum, home to the Henderson Silver Knights, sits nearby.",
    worthExploring:
      "Worth a look if you want established streets but newer construction than Green Valley proper, and want shops and restaurants within a short drive rather than a long one.",
  },
  {
    name: "Whitney Ranch",
    where: "Northern Henderson, near Galleria Dr and Boulder Hwy",
    summary:
      "An older residential area at the northern end of the city, closer to the Las Vegas side than most of Henderson and often overlooked in favor of the bigger names further south.",
    housing:
      "Predominantly older resale single-family, generally at the more accessible end of the Henderson range, with newer infill scattered through it.",
    distinct:
      "Position. It is the part of Henderson that behaves most like east Las Vegas, and it sits right on the Boulder Highway corridor that is being rebuilt.",
    worthExploring:
      "Relevant if your life is anchored toward central or east Las Vegas and you want a Henderson address without the drive from the southern hillsides.",
  },
  {
    name: "Seven Hills",
    where: "Southern Henderson, west of Anthem, around Seven Hills Dr and St. Rose Pkwy",
    summary:
      "A hillside master-planned community begun in the 1990s on rising ground above the valley floor, with gated and non-gated neighborhoods side by side.",
    housing:
      "Largely late-1990s and 2000s single-family, a wide spread of sizes, with guard-gated custom pockets at the upper end and view lots on the higher streets.",
    distinct:
      "It is the transition. Below it the valley floor is flat and gridded; above it the streets start bending around terrain. You can feel the change through the steering wheel.",
    worthExploring:
      "Worth seeing if you want elevation and a view without going to the top of the price range, and don't mind that everything else is downhill and a drive.",
  },
  {
    name: "Anthem",
    where: "The far south of the city, against the McCullough Range",
    summary:
      "Del Webb's Henderson project, opened in 1998. 2,535 acres were approved in November 1997 and a 1999 land exchange with the BLM added about the same again, taking it past 5,000 acres, planned at 11,000 to 13,000 homes. Crucially, 'Anthem' covers three quite different subdivisions: Anthem Country Club, Sun City Anthem and Coventry Homes at Anthem.",
    housing:
      "Everything from production single-family to guard-gated country-club homes. Sun City Anthem is age-restricted housing with its own facilities and rules, entirely separate from the rest.",
    distinct:
      "Elevation, and the ambiguity of the name. Ask which Anthem someone means before you look at anything, because the three parts are not remotely the same purchase.",
    worthExploring:
      "For view lots and hillside living, and for anyone specifically looking at age-restricted housing. Accept that you are as far from the rest of the valley as Henderson gets.",
  },
  {
    name: "Inspirada",
    where: "West Henderson, south of St. Rose Pkwy along Via Inspirada",
    summary:
      "One of the two newest large master plans in the city, laid out around parks and a village street pattern rather than the long cul-de-sac loops of 1990s Henderson. It sits inside the city's West Henderson planning area, and the city's own land use plan has a chapter devoted to an Inspirada town center.",
    housing:
      "New and recent construction, a genuine mix of detached single-family, attached homes and townhomes, at higher density than older Henderson.",
    distinct:
      "Street design and parks. It reads more like a walkable neighborhood plan than the rest of southern Henderson, and it is the closest large residential community to the city's employment corridor.",
    worthExploring:
      "The one to see if you want recent construction, don't need a large lot, and want to be near where the jobs are actually being built rather than near where they used to be.",
  },
  {
    name: "MacDonald Highlands",
    where: "Above Horizon Ridge Pkwy, on the hillside east of Valle Verde",
    summary:
      "A guard-gated custom-home development climbing the McCullough foothills, built around DragonRidge Country Club. Not a master-planned community in the Green Valley or Cadence sense: this is homesites and custom builds.",
    housing:
      "Custom and semi-custom homes on hillside lots, at the top of the Henderson range, alongside remaining homesites. The Four Seasons Private Residences towers are being built here.",
    distinct:
      "The view, and the elevation that buys it. It looks down over the whole valley toward the Strip, which is the entire proposition.",
    worthExploring:
      "Relevant if you are looking at custom construction or the highest end of the resale market, and want a gate between you and the road.",
  },
  {
    name: "Ascaya",
    where: "Cut into the Black Mountain slopes, south-west of MacDonald Highlands",
    summary:
      "A custom-homesite development on benched lots blasted into the hillside, sold as land rather than houses. Architecturally it is the most unusual thing in Henderson, and it is deliberately small.",
    housing:
      "Custom homes only, mostly contemporary desert architecture, on large graded lots. There is no production housing here at all.",
    distinct:
      "It is not a neighborhood you move into so much as a set of lots you build on. That is a different timeline, a different budget and a different process.",
    worthExploring:
      "Only if you intend to build. If you want to buy a finished house, this is the wrong list.",
  },
  {
    name: "Water Street District",
    where: "Central-east Henderson, along Water Street south of Lake Mead Pkwy",
    summary:
      "Henderson's original downtown, and the reason there is a Henderson at all. The town grew up around the Basic Magnesium plant during the Second World War, and this was its main street. It sits inside the city's Downtown Redevelopment Area, and new apartment and mixed-use projects have been arriving on it.",
    housing:
      "Older, smaller homes on the surrounding streets, plus newer apartment and mixed-use projects arriving on and around Water Street itself.",
    distinct:
      "It is the only part of Henderson with pre-master-plan bones: a real main street, civic buildings, older housing stock and a walkable core, rather than a designed one.",
    worthExploring:
      "Worth a look if you want the oldest and most conventionally urban part of the city, and are interested in an area that is still visibly changing.",
  },
  {
    name: "Cadence",
    where: "Eastern Henderson, north of Lake Mead Pkwy around Boulder Hwy",
    summary:
      "The other new-generation master plan, on the east side of the city, organized around a central park the community describes as nearly 50 acres, with trails and pools through it. Still actively selling across a long list of builders.",
    housing:
      "New construction across a wide range, from attached and townhome product through to larger single-family, plus a significant rental component.",
    distinct:
      "Where it is. Cadence puts you on the eastern side of Henderson, close to Water Street and Lake Mead Parkway and a long way from Summerlin, which is either exactly right or exactly wrong for you.",
    worthExploring:
      "The east-side answer to Inspirada. Worth comparing the two directly, because they are similar products in genuinely different parts of the city.",
  },
  {
    name: "Lake Las Vegas",
    where: "The far north-east of the city, off Lake Mead Pkwy toward Lake Mead",
    summary:
      "A 320-acre man-made reservoir with a 3,592-acre developed area around it, filled from 1991 through the old wartime BMI pipeline. It went through Chapter 11 in 2008 and came out in 2010, and has been building steadily since.",
    housing:
      "Everything from lakefront condos and villages of attached homes to golf-course frontage, custom lots and age-restricted neighborhoods, most of it gated.",
    distinct:
      "It is separated from the rest of Henderson by several miles of open desert, which is the whole point for the people who choose it and the whole problem for the people who don't.",
    worthExploring:
      "Worth understanding on its own terms rather than as 'Henderson'. Look here if the setting and the pace are the reason you are moving, and drive the trip out at least once before you commit.",
  },
];

// --- 4. Development Watch ---------------------------------------------------
//
// Statuses checked 2026-08-27. Every entry carries its own source. If a project
// cannot be placed confidently in one of the three states, it does not go here.
//
// DELIBERATELY NOT LISTED: Google's Henderson data center. It is real and it is
// in the city, but Google's own site dates the groundbreaking to 2019 and it has
// been operating for years. It shows up constantly in "coming to Henderson"
// roundups, which is exactly the stale-announcement problem this section exists
// to avoid.

export const developmentProjects: DevelopmentProject[] = [
  {
    name: "West Henderson Hospital",
    status: "open",
    where: "1155 Raiders Way, off St. Rose Pkwy in West Henderson",
    what: "A 150-bed acute care hospital that opened in December 2024, part of The Valley Health System. Before it, the western side of the city had no hospital of its own. That is the kind of thing that changes what living out there actually involves.",
    source: {
      label: "West Henderson Hospital",
      url: "https://westhendersonhospital.com/about-west-henderson-hospital/",
    },
  },
  {
    name: "Cadence Crossing Casino",
    status: "open",
    where: "920 N Boulder Hwy, at the edge of the Cadence community",
    what: "Boyd Gaming's first new property in about twenty years, opened 25 March 2026 with more than 450 slot machines, two restaurants, a bar and a lounge. It replaced the old Jokers Wild next door. Boyd has said a hotel may follow.",
    source: {
      label: "Las Vegas Review-Journal, 25 March 2026",
      url: "https://www.reviewjournal.com/business/casinos-gaming/boyd-gaming-opens-doors-of-this-new-henderson-casino-watch-live-3729386/",
    },
  },
  {
    name: "M Resort second hotel tower",
    status: "open",
    where: "12300 S Las Vegas Blvd, at the western edge of the city",
    what: "A roughly $206 million expansion that opened on 1 December 2025 and took the property to 765 rooms and suites, with a new ballroom that opened that October. Worth knowing mostly as a geography lesson: the M is inside Henderson city limits, which surprises almost everyone.",
    source: {
      label: "PENN Entertainment",
      url: "https://investors.pennentertainment.com/news-releases/news-release-details/penn-entertainment-celebrates-official-opening-second-hotel",
    },
  },
  {
    name: "Reimagine Boulder Highway",
    status: "under-construction",
    where: "Boulder Hwy, from Wagonwheel Dr north 7.52 miles to Tulip Falls Dr",
    what: "A City of Henderson and RTC rebuild of the corridor: travel lanes cut from six to four, center-running bus transit lanes, raised and buffered bike lanes, widened sidewalks, signalized mid-block crossings and new lighting. Work started in summer 2024. New streetlights are already on along part of the corridor.",
    source: {
      label: "City of Henderson, current projects",
      url: "https://www.cityofhenderson.com/government/departments/public-works/road-work-projects/current-projects",
    },
    caveat:
      "Reported at roughly $185 million with completion scheduled for August 2027. If you are looking at anything along Boulder Highway, drive it before you decide.",
  },
  {
    name: "The Henderson 215 Project",
    status: "under-construction",
    where: "I-215 between Pecos Rd and Stephanie St",
    what: "Two extra lanes in each direction, rebuilt ramps, and extra turn lanes at Pecos, Green Valley Pkwy, Valle Verde and Stephanie. It also converts the Green Valley Pkwy bridge into a diverging diamond interchange and adds a pedestrian bridge over Green Valley Pkwy at Village Walk Dr, linking the two halves of The District.",
    source: {
      label: "Henderson 215 Project, official schedule",
      url: "https://henderson215.com/schedule/",
    },
    caveat:
      "The published schedule runs from the second quarter of 2025 to the second quarter of 2028, with the diverging diamond itself not starting until early 2027. This is the road most of central Henderson uses to leave.",
  },
  {
    name: "Haas Automation manufacturing plant",
    status: "under-construction",
    where: "A 234-acre site in West Henderson",
    what: "A 2.4 million square foot plant for the largest US maker of CNC machine tools, which broke ground in fall 2024. It is the anchor of the city's push to make West Henderson an employment center rather than a bedroom suburb, and it is the single biggest reason that side of the city is changing.",
    source: {
      label: "Nevada Business Magazine, October 2024",
      url: "https://nevadabusiness.com/2024/10/haas-automation-inc-breaks-ground-on-2-4-million-sq-ft-manufacturing-facility-in-henderson-nevada/",
    },
    caveat:
      "Reporting has put the start of operations around the end of 2026. The project has already been pushed back once from an earlier target, so treat any specific date carefully.",
  },
  {
    name: "Henderson Sport & Social",
    status: "under-construction",
    where: "Near St. Rose Pkwy and Maryland Pkwy",
    what: "A 180,000 square foot, two-level indoor sports and events venue, built as a public-private partnership between the city and KemperSports at a total cost of about $70 million. It broke ground on 21 May 2025 as the West Henderson Fieldhouse and was renamed in June 2026.",
    source: {
      label: "FOX5 Vegas, 2 June 2026",
      url: "https://www.fox5vegas.com/2026/06/02/city-henderson-announces-new-name-west-henderson-fieldhouse-project/",
    },
    caveat:
      "Opening was set for fall 2026, with early October reported. Use the new name: 'West Henderson Fieldhouse' is what most pages still say.",
  },
  {
    name: "Four Seasons Private Residences",
    status: "under-construction",
    where: "MacDonald Highlands, above Horizon Ridge Pkwy",
    what: "Two residential towers plus custom single-family homes on the hillside, on one of the highest sites in MacDonald Highlands. Vertical construction is under way on both towers.",
    source: {
      label: "Las Vegas Review-Journal, December 2025",
      url: "https://www.reviewjournal.com/business/housing/luxury-high-rise-complex-in-henderson-lands-781m-in-financing-3593034/",
    },
    caveat:
      "Unit counts, pricing and completion dates vary between sources and are largely developer marketing. Our own closer look is linked below, and it deliberately publishes none of those numbers.",
  },
  {
    name: "Sloan Canyon visitor contact station",
    status: "under-construction",
    where: "Nawghaw Poa Rd, at the southern edge of Anthem",
    what: "The BLM is building a permanent visitor contact station for the conservation area. Nawghaw Poa Road and the parking at the end of it are closed while it happens, the Petroglyph Canyon and 101 trails have been rerouted, and parking has moved to Democracy Drive.",
    source: {
      label: "Bureau of Land Management",
      url: "https://www.blm.gov/announcement/blm-announces-temporary-closure-certain-public-lands-sloan-canyon-nca-during",
    },
    caveat:
      "The published closure runs 12 November 2024 to 11 November 2026. If trail access to Sloan Canyon is part of why you are looking at southern Henderson, check the BLM page before you drive out.",
  },
  {
    name: "Inspirada Station",
    status: "planned",
    where: "A 49-acre site in west Henderson, near Inspirada",
    what: "A Red Rock Resorts proposal for a casino of about 58,000 square feet with a 201-room hotel, restaurants, a food hall, a bowling center and a cinema. The Henderson Planning Commission has approved adding 14.1 acres to the site for surface parking.",
    source: {
      label: "Las Vegas Review-Journal",
      url: "https://www.reviewjournal.com/business/casinos-gaming/henderson-officials-approve-plan-to-expand-casino-hotel-project-site-3304805/",
    },
    caveat:
      "Entitled and planned, not scheduled. Red Rock Resorts has not committed to a construction date, and executives have publicly said the decision on their next big project could take a while. Do not buy on the assumption this is coming.",
  },
  {
    name: "The former Fiesta Henderson site",
    status: "planned",
    where: "Lake Mead Pkwy at the freeway interchange, the gateway to downtown Henderson",
    what: "The city's Redevelopment Agency bought the closed casino site, including its parking garage, and has run a public outreach and vision process for it. The agency calls it a priority development opportunity. It is one of the most visible pieces of land in Henderson and it is currently empty.",
    source: {
      label: "City of Henderson, Fiesta Henderson site",
      url: "https://www.cityofhenderson.com/our-city/initiatives/fiesta-henderson-site",
    },
    caveat:
      "An earlier developer agreement lapsed. The city says it is in negotiations with a developer that came through its selection process and anticipates an announcement in fall 2026. There is no approved project, no design and no construction timeline.",
  },
];

// --- 5. Comparisons ---------------------------------------------------------

export const summerlinComparison: ComparisonRow[] = [
  {
    dimension: "One coordinated plan you can feel from the street",
    leans: "Summerlin",
    because:
      "Thirty-six years of one developer to one set of standards. Henderson is a city with a dozen developers who never had to agree with each other.",
  },
  {
    dimension: "Range of environments inside one name",
    leans: "Henderson",
    because:
      "A lake, a 1940s main street, hillside custom lots, age-restricted housing and an industrial employment corridor. Summerlin's range is wide but it is all one idea.",
  },
  {
    dimension: "The name telling you where someone lives",
    leans: "Summerlin",
    because:
      "Both names are vaguer than people think, but Summerlin is 35 square miles under one plan and Henderson is 118 square miles under a city council.",
  },
  {
    dimension: "Local government you can actually call",
    leans: "Henderson",
    because:
      "Henderson has its own mayor, council, police, fire and parks department. Summerlin has a master association and two different jurisdictions depending on the address.",
  },
  {
    dimension: "Trails and parks as a designed system",
    leans: "Summerlin",
    because:
      "Summerlin's trails were built into the arroyos between villages from the start. Henderson has more than 300 miles of trail, but assembled over decades rather than planned as one network.",
  },
  {
    dimension: "Getting to Harry Reid International",
    leans: "Henderson",
    because:
      "Simple geography. Most of Henderson is closer to the airport than most of Summerlin, though Lake Las Vegas and Anthem are their own arguments.",
  },
  {
    dimension: "Getting to Red Rock and the west side",
    leans: "Summerlin",
    because:
      "Equally simple geography, in the other direction. From Henderson, Red Rock is a genuine expedition.",
  },
  {
    dimension: "A walkable evening",
    leans: "Both",
    because:
      "Downtown Summerlin and The District at Green Valley Ranch do the same job. Henderson also has Water Street, which is older and less curated.",
  },
  {
    dimension: "Established housing with mature landscaping",
    leans: "Henderson",
    because:
      "Green Valley opened in 1978, twelve years before Summerlin's first village. Its oldest streets have had longer to grow in than anything in Summerlin.",
  },
  {
    dimension: "Knowing what gets built next to you",
    leans: "Summerlin",
    because:
      "One master plan, published, with land use set. Henderson's vacant parcels answer to city zoning and a lot of different owners.",
  },
];

// --- 6. Video ---------------------------------------------------------------
//
// NO youtubeId until the video is actually published. The slot renders an
// honest "still filming" note instead of a broken player. Never guess an id.
// This is the same shared video the Summerlin guide is waiting on.

export const areaVideo: AreaVideoConfig = {
  title: "Summerlin vs Henderson vs Southwest Las Vegas, with Mikey Del Rosario",
};

// --- 7. FAQ -----------------------------------------------------------------

export const faqItems: AreaFaqItem[] = [
  {
    question: "Is Henderson part of Las Vegas?",
    answer: (
      <>
        No.{" "}
        <span className="text-lvinit-black">
          Henderson is a separate incorporated city
        </span>{" "}
        with its own mayor, city council, police department, fire department and
        parks department. It was incorporated on 16 April 1953 and it is
        Nevada&rsquo;s second largest city. It shares the Las Vegas Valley with
        Las Vegas, North Las Vegas and a lot of unincorporated Clark County, but
        it is not a district or a suburb of the City of Las Vegas.
      </>
    ),
  },
  {
    question: "How big is Henderson?",
    answer: (
      <>
        The city publishes{" "}
        <span className="text-lvinit-black">nearly 118.5 square miles</span> on
        its own fact sheet, with a population of 369,167 as of January 2025.
        Measured off the city&rsquo;s GIS boundary, it runs roughly 17.6 miles
        east to west and 16.1 miles north to south. For comparison, Summerlin is
        about 35 square miles. That size difference is the reason this guide
        exists.
      </>
    ),
  },
  {
    question: "What are the best areas of Henderson?",
    answer: (
      <>
        There isn&rsquo;t an honest ranking to give you, and anyone publishing
        one is guessing or selling. What there is: a set of genuinely different
        environments.{" "}
        <span className="text-lvinit-black">
          Established and grown-in points you at Green Valley. Newest
          construction points you at Inspirada or Cadence. Elevation and views
          point you at Seven Hills, Anthem, MacDonald Highlands or Ascaya. A lake
          and a resort pace point you at Lake Las Vegas. An older, walkable core
          points you at Water Street.
        </span>{" "}
        Pick by what you actually want, not by a list.
      </>
    ),
  },
  {
    question: "Is Green Valley the same as Green Valley Ranch?",
    answer: (
      <>
        No, and this catches people constantly.{" "}
        <span className="text-lvinit-black">
          Green Valley is the original master community
        </span>
        , 8,400 acres of it, opened in 1978.{" "}
        <span className="text-lvinit-black">
          Green Valley Ranch is a newer community inside those boundaries
        </span>
        , begun in 1994, and it is what most people actually mean when they say
        &ldquo;Green Valley Ranch&rdquo; in a listing. Green Valley South is a
        third name, begun around 1985. They are related, and they are not
        interchangeable.
      </>
    ),
  },
  {
    question: "What is West Henderson?",
    answer: (
      <>
        A{" "}
        <span className="text-lvinit-black">City of Henderson planning area</span>
        , not a community. Its Land Use Plan was approved by City Council on 2
        December 2014 and amended several times since. It covers the western side
        of the city and it is where most of Henderson&rsquo;s current employment
        and industrial growth is happening, including the Haas Automation plant
        and West Henderson Hospital. Inspirada sits inside it. Nobody lives
        &ldquo;in West Henderson&rdquo; the way they live in Cadence.
      </>
    ),
  },
  {
    question: "Which Anthem do people mean?",
    answer: (
      <>
        Ask, every time. Del Webb&rsquo;s Anthem opened in 1998 and grew past
        5,000 acres, and it contains{" "}
        <span className="text-lvinit-black">three different subdivisions</span>:
        Anthem Country Club, which is guard-gated country-club housing; Sun City
        Anthem, which is age-restricted housing with its own rules and
        facilities; and Coventry Homes at Anthem, which is neither. Someone
        saying &ldquo;we&rsquo;re looking in Anthem&rdquo; has told you a
        direction and almost nothing else.
      </>
    ),
  },
  {
    question: "Is Lake Las Vegas actually in Henderson?",
    answer: (
      <>
        Yes, it is inside the city limits, but it sits at the far north-eastern
        end of them with several miles of open desert between it and the rest of
        Henderson. It is a{" "}
        <span className="text-lvinit-black">320-acre man-made reservoir</span>{" "}
        with a 3,592-acre developed area around it, filled from 1991 using the
        old wartime BMI pipeline. Practically speaking it functions as its own
        place. Treat &ldquo;Henderson&rdquo; and &ldquo;Lake Las Vegas&rdquo; as
        two different searches.
      </>
    ),
  },
  {
    question: "How far is Henderson from the Strip?",
    answer: (
      <>
        There is no single answer, and that is the point.{" "}
        <span className="text-lvinit-black">
          Henderson is about 17.6 miles wide
        </span>
        , so a home on Las Vegas Boulevard at the western edge and a home at Lake
        Las Vegas are not remotely the same trip. Add the Boulder Highway rebuild
        and the I-215 widening, both under construction right now, and any number
        you read is out of date. Pick the address you are actually considering
        and drive it at the hour you would actually drive it.
      </>
    ),
  },
  {
    question: "Is Harry Reid International Airport in Henderson?",
    answer: (
      <>
        No. Harry Reid International is in{" "}
        <span className="text-lvinit-black">Paradise</span>, an unincorporated
        town, not in the City of Henderson. Henderson does have its own airport,{" "}
        <span className="text-lvinit-black">Henderson Executive Airport</span>,
        off St. Rose Parkway, which handles general aviation rather than
        commercial flights. Most of Henderson is genuinely convenient to Harry
        Reid; it just isn&rsquo;t inside the city.
      </>
    ),
  },
  {
    question: "Does a Henderson mailing address mean the City of Henderson?",
    answer: (
      <>
        Not necessarily, and it works in both directions. Postal addresses follow
        delivery routes, not city limits.{" "}
        <span className="text-lvinit-black">
          Southern Highlands, Silverado Ranch and Harry Reid International all
          sit outside the city
        </span>{" "}
        despite being nearby, while the M Resort, which almost everyone assumes
        is unincorporated county, is inside it. If it matters for schools,
        permits, utilities or who answers a call, check the address against the
        city&rsquo;s own GIS rather than the envelope.
      </>
    ),
  },
  {
    question: "What is the freeway through Henderson called now?",
    answer: (
      <>
        <span className="text-lvinit-black">I-11</span>, running concurrently
        with US-93 and US-95. It was signed{" "}
        <span className="text-lvinit-black">I-515</span> until I-11 was extended
        through the Las Vegas Valley in May 2024, at which point I-515 was
        decommissioned. Plenty of signs, maps and websites still say I-515,
        including some official ones. The beltway across northern Henderson is
        I-215; only the western leg, over on the Summerlin side, is the
        county-maintained CC-215.
      </>
    ),
  },
  {
    question: "Should I choose Henderson or Summerlin?",
    answer: (
      <>
        It is the wrong shape of question, because they are not the same kind of
        thing.{" "}
        <span className="text-lvinit-black">
          Summerlin is one master-planned community; Henderson is a city with
          many.
        </span>{" "}
        The useful version is Summerlin against a specific Henderson community:
        Green Valley, Anthem, Inspirada, Cadence, Lake Las Vegas. Usually the
        real question underneath is west side or south-east side, which is
        really a question about where your work and your people are. The{" "}
        <Link href="/guides/summerlin-vs-henderson" className={linkClass}>
          full comparison guide
        </Link>{" "}
        goes through it properly.
      </>
    ),
  },
];

// --- 8. Sources -------------------------------------------------------------

export const sources: AreaSource[] = [
  {
    label: "City of Henderson: Fact Sheet",
    url: "https://www.cityofhenderson.com/our-city/about-henderson/city-facts",
    used: "Population (369,167, January 2025), area (nearly 118.5 square miles), elevation, the city's own description of its topography, park and trail counts, golf courses, school and library lists, and Henderson Executive Airport.",
  },
  {
    label: "City of Henderson GIS: City Boundary layer",
    url: "https://gis-hendersonnv.opendata.arcgis.com/",
    used: "The official municipal boundary drawn on the LVINIT Henderson map, retrieved from the city's own ArcGIS Server in WGS84. The polygon measures 78,056.45 acres / 121.96 square miles and contains 22 unincorporated county pockets. Every community marker on the map was point-in-polygon tested against it.",
  },
  {
    label: "City of Henderson: West Henderson Land Use Plan",
    url: "https://www.cityofhenderson.com/government/departments/community-development-and-services/land-use-plans/west-henderson-land-use-plan",
    used: "That West Henderson is a city planning area rather than a community, that its Land Use Plan was approved by City Council on 2 December 2014, and that it has been amended by resolution several times since.",
  },
  {
    label: "City of Henderson: current road projects",
    url: "https://www.cityofhenderson.com/government/departments/public-works/road-work-projects/current-projects",
    used: "The scope and limits of Reimagine Boulder Highway (7.52 miles, Wagonwheel Dr to Tulip Falls Dr), the I-215 widening, the Henderson Interchange work, and the Lake Las Vegas roundabout.",
  },
  {
    label: "Henderson 215 Project",
    url: "https://henderson215.com/schedule/",
    used: "The published construction schedule for the I-215 widening: second quarter 2025 to second quarter 2028, with the diverging diamond interchange starting in early 2027.",
  },
  {
    label: "City of Henderson: Fiesta Henderson site",
    url: "https://www.cityofhenderson.com/our-city/initiatives/fiesta-henderson-site",
    used: "The status of the former Fiesta Henderson site at Lake Mead Parkway and the freeway interchange.",
  },
  {
    label: "Bureau of Land Management: Sloan Canyon National Conservation Area",
    url: "https://www.blm.gov/visit/sloan-canyon-nca",
    used: "The conservation area's 48,438 acres, the Petroglyph Canyon rock art (more than 300 panels, 1,700 design elements), and that it is day-use only federal land.",
  },
  {
    label: "BLM: Sloan Canyon temporary closure notice",
    url: "https://www.blm.gov/announcement/blm-announces-temporary-closure-certain-public-lands-sloan-canyon-nca-during",
    used: "The closure of Nawghaw Poa Road and its parking from 12 November 2024 to 11 November 2026 during construction of the permanent visitor contact station, and the rerouting of the Petroglyph Canyon and 101 trails to Democracy Drive.",
  },
  {
    label: "Wikipedia: Henderson, Nevada",
    url: "https://en.wikipedia.org/wiki/Henderson,_Nevada",
    used: "The 16 April 1953 incorporation date, the Basic Magnesium history, the 2020 census population of 317,610, and the census land-area figure of 106.43 square miles.",
  },
  {
    label: "Wikipedia: Green Valley, Henderson",
    url: "https://en.wikipedia.org/wiki/Green_Valley,_Henderson",
    used: "That Green Valley was Southern Nevada's first master-planned community, developed by American Nevada Corporation with planning from 1973 and a grand opening on 24 October 1978, covering 8,400 acres, and that Green Valley South and Green Valley Ranch began around 1985 and 1994.",
  },
  {
    label: "Wikipedia: Anthem, Henderson",
    url: "https://en.wikipedia.org/wiki/Anthem,_Henderson",
    used: "Anthem's Del Webb origin and 1998 opening, the 2,535 acres approved in November 1997 and the 1999 BLM exchange that took it past 5,000, the 11,000 to 13,000 planned homes, and the three subdivisions.",
  },
  {
    label: "Wikipedia: Lake Las Vegas",
    url: "https://en.wikipedia.org/wiki/Lake_Las_Vegas",
    used: "The 320-acre reservoir and 3,592-acre developed area, the 1991 filling through the BMI pipeline, and the July 2008 Chapter 11 filing and July 2010 emergence.",
  },
  {
    label: "Wikipedia: Interstate 11",
    url: "https://en.wikipedia.org/wiki/Interstate_11",
    used: "That I-11 was extended through the Las Vegas Valley on 21 May 2024, that I-515 was decommissioned at that point, and that I-11 runs concurrently with US-93 and US-95.",
  },
  {
    label: "Cadence",
    url: "https://www.cadencenv.com/",
    used: "Cadence's own description of its central park as nearly 50 acres, its amenities, and the builders currently selling there.",
  },
  {
    label: "West Henderson Hospital",
    url: "https://westhendersonhospital.com/about-west-henderson-hospital/",
    used: "The December 2024 opening, the 150-bed acute care designation, and that it is part of The Valley Health System.",
  },
  {
    label: "OpenStreetMap",
    url: "https://www.openstreetmap.org/copyright",
    used: "Road centerlines and their official route designations, the Sloan Canyon conservation-area boundary, the Lake Las Vegas water body, and the community coordinates plotted on the LVINIT Henderson map. © OpenStreetMap contributors, made available under the Open Database License.",
  },
];
