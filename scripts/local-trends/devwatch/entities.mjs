// ---------------------------------------------------------------------------
// SEED ENTITIES — the projects LVINIT already covers, with their aliases
//
// Every project in a neighborhood pillar's Development Watch roster
// (lib/areas/*.tsx) is picked up AUTOMATICALLY, with the status and source
// LVINIT publishes. This file only adds what the roster cannot say:
//
//   * aliases, so "West Henderson Fieldhouse" and "Henderson Sport & Social"
//     are one project
//   * context rules for names that are ordinary words elsewhere ("The Bend",
//     "Life Time", "Sandstone")
//   * the dedicated LVINIT article that covers a project
//   * for projects with a dedicated article but no roster entry, the BASELINE
//     LVINIT currently publishes — transcribed from that article, with the
//     route it came from. It is "what LVINIT says", never a fresh claim.
//
// Nothing here is a verified current fact. Development Watch verifies against
// sources; the baseline only tells it what "no change" looks like.
//
// `rosterNames` claims roster entries so two roster rows about one project
// (Grand Park phase one / phases two and three) become one entity.
// ---------------------------------------------------------------------------

export const SEED_ENTITIES = [
  {
    id: "DEV-MONUMENT-HILLS",
    name: "Monument Hills",
    aliases: ["Monument Hills"],
    area: "northwest",
    jurisdiction: "City of Las Vegas",
    developer: "Olympia Companies and Bruin Capital Partners (Monument Hills Partners LLC)",
    type: "residential",
    routes: ["/guides/monument-hills-northwest-las-vegas"],
    baseline: {
      status: "announced",
      units: 6000,
      targetYear: 2028,
      targetKind: "opening",
      from: "/guides/monument-hills-northwest-las-vegas",
      note: "LVINIT guide (Sept 2026): ~940-acre land purchase closed; conceptual plans; up to 6,000 homes; first homes expected spring 2028.",
    },
  },
  {
    id: "DEV-SANDSTONE-TULE-SPRINGS",
    name: "Sandstone at Tule Springs",
    aliases: ["Sandstone at Tule Springs", "Landings at Sandstone", "Reserves at Sandstone", "Meadows at Sandstone", "Gardens at Sandstone"],
    contextAliases: [{ alias: "Sandstone", requires: /\b(KB Home|Tule Springs|North Las Vegas)\b/i }],
    area: "tule-springs",
    jurisdiction: "City of North Las Vegas",
    developer: "KB Home",
    type: "residential",
    routes: ["/guides/sandstone-tule-springs-north-las-vegas"],
    baseline: {
      status: "partially open",
      units: 1500,
      from: "/guides/sandstone-tule-springs-north-las-vegas",
      note: "LVINIT guide (Sept 2026): first-phase sales open (Landings, Reserves); Meadows and Gardens 'coming soon'; 1,500+ homes planned.",
    },
  },
  {
    id: "DEV-ONE-CIVIC-CENTER",
    name: "One Civic Center",
    aliases: ["One Civic Center", "2200 Civic Center"],
    area: "north-las-vegas",
    jurisdiction: "City of North Las Vegas",
    developer: "Agora Realty & Management",
    type: "mixed-use",
    routes: ["/guides/one-civic-center-north-las-vegas-redevelopment"],
    baseline: {
      status: "pre-construction",
      from: "/guides/one-civic-center-north-las-vegas-redevelopment",
      note: "LVINIT guide (Sept 2026): council approved the deal fall 2025; demolition began January 2026; main parcel sale closed July 2026; at least 100 apartments required by the sale.",
    },
  },
  {
    id: "DEV-FIESTA-HENDERSON-SITE",
    name: "Former Fiesta Henderson site",
    aliases: ["Fiesta Henderson"],
    area: "henderson",
    jurisdiction: "City of Henderson",
    developer: "Agora Realty & Management",
    type: "redevelopment",
    routes: ["/guides/fiesta-henderson-redevelopment"],
    rosterNames: ["The former Fiesta Henderson site"],
    baseline: {
      status: "proposed",
      from: "/guides/fiesta-henderson-redevelopment",
      note: "LVINIT guide (Sept 2026): conceptual plan announced Sept 8, 2026; not approved; purchase and development agreements still need a council hearing.",
    },
  },
  {
    id: "DEV-THE-WATERMARK-HENDERSON",
    name: "The Watermark (Water Street, Henderson)",
    aliases: [],
    contextAliases: [{ alias: "Watermark", requires: /\b(Henderson|Water Street)\b/i }],
    area: "henderson",
    jurisdiction: "City of Henderson",
    type: "residential",
    routes: ["/guides/water-street-district-henderson"],
    baseline: { status: "open", units: 151, from: "/guides/water-street-district-henderson", note: "LVINIT guide: open under new ownership after a 2024 bankruptcy and a 2026 foreclosure; 151 units." },
  },
  {
    id: "DEV-HENDERSON-SPORT-SOCIAL",
    name: "Henderson Sport & Social",
    aliases: ["Henderson Sport & Social", "Henderson Sport and Social", "West Henderson Fieldhouse"],
    area: "west-henderson",
    jurisdiction: "City of Henderson",
    developer: "City of Henderson with KemperSports",
    type: "park",
    routes: ["/guides/henderson-sport-social-grand-opening"],
    rosterNames: ["Henderson Sport & Social"],
  },
  {
    id: "DEV-FOUR-SEASONS-PRIVATE-RESIDENCES-HENDERSON",
    name: "Four Seasons Private Residences (Henderson)",
    aliases: ["Four Seasons Private Residences"],
    contextAliases: [{ alias: "Four Seasons", requires: /\b(Henderson|MacDonald Highlands)\b/i }],
    area: "henderson",
    type: "residential",
    routes: ["/neighborhoods/henderson/four-seasons-private-residences"],
    rosterNames: ["Four Seasons Private Residences"],
  },
  {
    id: "DEV-GRAND-PARK-SUMMERLIN",
    name: "Grand Park (Summerlin)",
    aliases: [],
    contextAliases: [{ alias: "Grand Park", requires: /\bSummerlin\b/i }],
    area: "summerlin",
    type: "park",
    rosterNames: ["Grand Park: phase one", "Grand Park: phases two and three"],
    rosterStatus: "partially open",
  },
  { id: "DEV-HENDERSON-215-PROJECT", name: "The Henderson 215 Project", aliases: ["Henderson 215"], area: "henderson", type: "road", rosterNames: ["The Henderson 215 Project"] },
  { id: "DEV-REIMAGINE-BOULDER-HIGHWAY", name: "Reimagine Boulder Highway", aliases: ["Reimagine Boulder Highway"], area: "henderson", type: "road", rosterNames: ["Reimagine Boulder Highway"] },
  { id: "DEV-HAAS-AUTOMATION-PLANT", name: "Haas Automation manufacturing plant", aliases: ["Haas Automation"], area: "west-henderson", type: "employment", rosterNames: ["Haas Automation manufacturing plant"] },
  { id: "DEV-INSPIRADA-STATION", name: "Inspirada Station", aliases: ["Inspirada Station"], area: "inspirada", type: "casino-resort", rosterNames: ["Inspirada Station"] },
  { id: "DEV-CADENCE-CROSSING-CASINO", name: "Cadence Crossing Casino", aliases: ["Cadence Crossing"], area: "henderson", type: "casino-resort", rosterNames: ["Cadence Crossing Casino"] },
  { id: "DEV-WEST-HENDERSON-HOSPITAL", name: "West Henderson Hospital", aliases: ["West Henderson Hospital"], area: "west-henderson", type: "employment", rosterNames: ["West Henderson Hospital"] },
  { id: "DEV-M-RESORT-SECOND-TOWER", name: "M Resort second hotel tower", aliases: [], contextAliases: [{ alias: "M Resort", requires: /\b(tower|expansion|rooms)\b/i }], area: "henderson", type: "casino-resort", rosterNames: ["M Resort second hotel tower"] },
  { id: "DEV-SLOAN-CANYON-VISITOR-STATION", name: "Sloan Canyon visitor contact station", aliases: [], contextAliases: [{ alias: "Sloan Canyon", requires: /\b(visitor|contact station|closure|Nawghaw Poa)\b/i }], area: "henderson", type: "park", rosterNames: ["Sloan Canyon visitor contact station"] },
  { id: "DEV-UNCOMMONS", name: "UnCommons", aliases: ["UnCommons"], area: "southwest", type: "mixed-use", rosterNames: ["UnCommons"] },
  { id: "DEV-DOMUS-AT-UNCOMMONS", name: "Domus at UnCommons", aliases: ["Domus at UnCommons"], area: "southwest", type: "residential", rosterNames: ["Domus at UnCommons"] },
  { id: "DEV-UNCOMMONS-FIFTH-OFFICE-BUILDING", name: "UnCommons fifth office building", aliases: [], area: "southwest", type: "employment", rosterNames: ["UnCommons fifth office building"] },
  { id: "DEV-THE-BEND-SOUTHWEST", name: "The Bend (Southwest Las Vegas)", aliases: [], contextAliases: [{ alias: "The Bend", requires: /\b(Sunset|Durango|IKEA|Riley)\b/ }], area: "southwest", type: "mixed-use", rosterNames: ["The Bend"] },
  { id: "DEV-DURANGO-CASINO-EXPANSION", name: "Durango Casino & Resort expansion", aliases: [], contextAliases: [{ alias: "Durango Casino", requires: /\bexpan/i }, { alias: "Durango Resort", requires: /\bexpan/i }], area: "southwest", type: "casino-resort", rosterNames: ["Durango Casino & Resort: third expansion phase"] },
  { id: "DEV-DESERT-FLOW-BIKE-PARK", name: "Desert Flow at Southwest Ridge Bike Skills Park", aliases: ["Desert Flow"], area: "southwest", type: "park", rosterNames: ["Desert Flow at Southwest Ridge Bike Skills Park"] },
  { id: "DEV-LIFE-TIME-DURANGO", name: "Life Time (Durango and Sunset)", aliases: [], contextAliases: [{ alias: "Life Time", requires: /\b(Durango|Sunset|southwest)\b/i }], area: "southwest", type: "mixed-use", rosterNames: ["Life Time"] },
  { id: "DEV-SUMMERLIN-PARKWAY-INTERCHANGE", name: "CC-215 / Summerlin Parkway interchange", aliases: ["Summerlin Parkway interchange"], area: "summerlin", type: "road", rosterNames: ["CC-215 / Summerlin Parkway interchange"] },
  { id: "DEV-SUMMERLIN-WEST", name: "Summerlin West new neighborhoods", aliases: ["Summerlin West"], area: "summerlin", type: "residential", rosterNames: ["New neighborhoods across Summerlin West"] },
  { id: "DEV-RED-ROCK-LEGACY-TRAILS", name: "Red Rock Canyon Legacy Trails", aliases: [], contextAliases: [{ alias: "Legacy Trails", requires: /\bRed Rock\b/i }], area: "summerlin", type: "park", rosterNames: ["Red Rock Canyon Legacy Trails"] },
  { id: "DEV-ROSEMAN-COLLEGE-OF-MEDICINE", name: "Roseman University College of Medicine", aliases: [], contextAliases: [{ alias: "Roseman University", requires: /\b(Summerlin|medicine|campus)\b/i }], area: "summerlin", type: "employment", rosterNames: ["Roseman University College of Medicine"] },
];
