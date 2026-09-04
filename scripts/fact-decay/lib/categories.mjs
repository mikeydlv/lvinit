// ---------------------------------------------------------------------------
// FACT CATEGORIES — the vocabulary the whole agent shares
//
// One table. Every flagged claim gets exactly one primary category from it, and
// the category decides three things:
//
//   dynamism  -> how fast this KIND of fact goes stale, which sets the review
//                cadence (see config.cadence). Not "how important" — how fast.
//   baseRisk  -> how much harm a wrong version of this fact could do to someone
//                making a decision. Adjusted per-claim in risk.mjs.
//   group     -> which of the five subject areas it belongs to.
//
// The five groups mirror the brief exactly:
//   housing | development | government | transportation | consumer
//
// JURISDICTION IS A SEPARATE DIMENSION, not a category. "Clark County rules",
// "City of Las Vegas rules", "Henderson rules", "North Las Vegas rules" and
// "Nevada laws" are the same KIND of fact with different owners — splitting
// them into five near-identical categories would duplicate every pattern and
// let the risk table drift apart. detectJurisdiction() tags the claim instead,
// and the report prints it, so nothing from the brief is lost.
//
// A pattern matching is NOT enough to flag a claim on its own — claims.mjs
// still has to decide the sentence is a factual assertion rather than opinion,
// durable geography, or settled history. This table only answers "if it IS a
// time-sensitive claim, what kind is it?".
// ---------------------------------------------------------------------------

/** How fast a kind of fact goes stale. Cadence days come from config.cadence. */
export const DYNAMISM = {
  VERY_DYNAMIC: "very-dynamic",
  DYNAMIC: "dynamic",
  MODERATE: "moderate",
  STABLE: "stable",
};

export const RISK = { HIGH: "high", MEDIUM: "medium", LOW: "low" };

export const GROUPS = {
  HOUSING: "housing",
  DEVELOPMENT: "development",
  GOVERNMENT: "government",
  TRANSPORTATION: "transportation",
  CONSUMER: "consumer",
};

export const GROUP_LABELS = {
  housing: "Real estate and housing",
  development: "Local development",
  government: "Government, law and regulation",
  transportation: "Transportation and infrastructure",
  consumer: "Time-sensitive consumer information",
};

/**
 * The category table.
 *
 * `pattern`     — what marks a sentence as being ABOUT this kind of fact.
 * `needsFigure` — true when the category only matters if the sentence also
 *                 carries a number or date. Stops "the HOA runs the parks"
 *                 reading as an HOA fee claim.
 * `generic`     — a catch-all category that exists so nothing falls through the
 *                 cracks. A specific category always wins over a generic one:
 *                 "HOA dues are $95 a month" is an HOA fee claim, reviewed on a
 *                 budget cycle, not a generic "fee" claim reviewed weekly.
 * `why`         — printed in the report so the cadence and the risk level are
 *                 never a black box. Written for a reader, not a developer.
 */
export const FACT_CATEGORIES = [
  // --- Real estate and housing ---------------------------------------------
  {
    key: "home-prices",
    label: "Home prices",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.HIGH,
    needsFigure: true,
    // "median price", but also "median single-family price" and "median
    // condo/townhome sales price" — LVINIT almost always qualifies the segment,
    // so requiring the two words to be adjacent missed most real price copy.
    pattern: /\b(median\s+(?:[a-z-]+\s+){0,3}price|home prices?|house prices?|sale price|price per square f\w*|sold for|listing price|typical (?:home|starter home) value|record high|prices? (?:slipped|fell|eased|rose|climbed|pulled back))\b/i,
    why: "Valley price figures are republished monthly by the sources LVINIT cites. A price sentence more than a month old is quoting a superseded report.",
  },
  {
    key: "rents",
    label: "Rents",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: true,
    pattern: /\b(rent|rents|rental rate|asking rent|median rent|monthly rent|lease rate)\b/i,
    why: "Rent figures move on the same monthly cycle as prices, and they are what a relocating reader budgets against.",
  },
  {
    key: "mortgage-rates",
    label: "Mortgage rates",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.VERY_DYNAMIC,
    baseRisk: RISK.HIGH,
    needsFigure: true,
    pattern: /\b(mortgage rates?|interest rates?|30-?year fixed|15-?year fixed|freddie mac (?:survey|average)|rate lock)\b/i,
    why: "Rates are published weekly. A quoted rate is the fastest-decaying number LVINIT publishes, and readers do arithmetic with it.",
  },
  {
    key: "inventory-and-days-on-market",
    label: "Inventory and days on market",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: true,
    pattern: /\b(inventory|months of supply|supply sat|listed without offers|days on market|sold within \d+ days|active listings?|homes on the market)\b/i,
    why: "Supply metrics are monthly MLS-derived figures. Stale ones make the market read as tighter or looser than it is.",
  },
  {
    key: "hoa-fees",
    label: "HOA amounts",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: true,
    pattern: /\b(hoa|homeowners?'? association|association dues?|master (?:plan )?dues?|sub-?association)\b/i,
    why: "HOA amounts are a budget line a buyer commits to. They reset on association budget cycles, and a wrong number changes affordability arithmetic.",
  },
  {
    key: "sid-lid-and-assessments",
    label: "SID / LID and special assessments",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(sid\b|lid\b|special improvement district|local improvement district|special assessment|assessment bond)\b/i,
    why: "A SID/LID balance is real debt attached to a parcel. Getting it wrong misstates the cost of owning a specific home.",
  },
  {
    key: "property-tax",
    label: "Property taxes",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(property tax|tax abatement|tax cap|assessed value|taxable value|tax rate|tax bill|assessor)\b/i,
    why: "Nevada's abatement and cap rules are statutory and have been amended before. This is the category most likely to mislead a buyer about their own bill.",
  },
  {
    key: "builder-incentives",
    label: "Builder incentives",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.VERY_DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(builder incentives?|rate buydown|buy-?down|closing cost credit|design center credit|move-?in ready incentive)\b/i,
    why: "Incentives are set per community, per quarter, sometimes per weekend. Any specific incentive claim goes stale almost immediately.",
  },
  {
    key: "builder-and-community-status",
    label: "Builder and community status",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(actively selling|now selling|sold out|final phase|last homes?|model home|grand opening|new neighborhoods?)\b/i,
    why: "Which villages and builders are selling changes constantly — the master-planned communities update their own lists far more often than LVINIT republishes.",
  },
  {
    key: "new-home-availability",
    label: "New-home availability",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: true,
    pattern: /\b(new-?home sales|new construction (?:sales|permits|closings)|permits? (?:were|are|down|up)|homesites?|quick move-?in)\b/i,
    why: "New-home volume comes from monthly builder-research releases, on the same decay clock as resale price data.",
  },
  {
    key: "resale-market-conditions",
    label: "Resale market conditions",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(resale market|buyer'?s market|seller'?s market|market is (?:cooling|heating|softening|slowing)|price (?:growth|declines?|drops?)|year over year)\b/i,
    why: "Market-condition statements are inferences from data that is restated monthly; they age with the data underneath them.",
  },
  {
    key: "down-payment-and-financing",
    label: "Down-payment requirements and financing programs",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(down payment|fha|va loan|usda loan|conventional loan|conforming loan limit|home possible|homeready|pmi|mortgage insurance|funding fee|credit score)\b/i,
    why: "Loan-program minimums, limits and fees are set by federal agencies and revised on their own schedule. A reader can be told they do not qualify when they do.",
  },
  {
    key: "assistance-programs",
    label: "Down-payment assistance and housing programs",
    group: GROUPS.HOUSING,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(down-?payment assistance|home is possible|worker advantage|hip for (?:heroes|teachers)|nevada housing division|assistance program|forgivable|second mortgage)\b/i,
    why: "Assistance programs are funded in rounds, close when funds are reserved, and change benefit amounts and income caps between rounds. This is the highest-consequence category on the site.",
  },

  // --- Local development ----------------------------------------------------
  {
    key: "project-status",
    label: "Project status",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    // "planned" only as a status. The negative lookbehind keeps
    // "master-planned community" out — that is a description of a kind of
    // neighborhood, not a statement that something has yet to be built.
    pattern: /\b(under construction|open now|opening|(?<!master[- ])(?<!pre[- ])(?<!well[- ])planned|proposed|approved|broke ground|breaking ground|topped out|delayed|on hold|cancell?ed|shelved)\b/i,
    why: "A project moves between proposed, under construction and open on its own schedule. Describing a proposal as if it were being built is the exact failure the Development Watch section exists to prevent.",
  },
  {
    key: "construction-timeline",
    label: "Construction timelines",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: true,
    pattern: /\b(completion|complete by|finish(?:ed|es)? (?:in|by)|scheduled for|expected (?:in|by|to open)|three-?year schedule|\d+-?month (?:schedule|build)|timeline|phase (?:one|two|three|\d))\b/i,
    why: "Published completion dates slip routinely and are rarely retracted by the source. A date LVINIT repeated a year ago is often already wrong.",
  },
  {
    key: "road-and-freeway-project",
    label: "Road and freeway projects",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(interchange|widening|flyover|braided ramp|cc-?215|i-?15|us-?95|ndot|freeway project|road project|lane in each direction)\b/i,
    why: "Roadwork is the development category readers experience daily, and phases open and close faster than an article gets revisited.",
  },
  {
    key: "retail-and-resort-opening",
    label: "Retail, casino and resort openings",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(opens?|opened|opening|now open|coming to|will open|closed permanently|shuttered)\b[^.]{0,60}\b(center|centre|mall|restaurant|store|shop|retail|casino|resort|hotel|theater|theatre|arena|stadium)\b/i,
    why: "Openings slip and businesses close. A named venue that has closed is the most visible kind of stale detail on a local guide.",
  },
  {
    key: "parks-and-amenities",
    label: "Parks and amenities",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.LOW,
    needsFigure: false,
    pattern: /\b(splash pad|pickleball|ballfield|playground|dog park|community center|rec center|trail system|trail bridges?)\b/i,
    why: "Amenities open in phases. Usually low consequence, but worth keeping honest because a reader can go and check in person.",
  },
  {
    key: "schools-factual",
    label: "Schools (factual claims only)",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(ccsd|clark county school district|new (?:elementary|middle|high) school|school (?:opened|opening|under construction)|campus (?:opened|opening)|zoned (?:to|for))\b/i,
    why: "Whether a school exists, opened, or a zone changed is a checkable fact. Any RANKING or quality framing is a Fair Housing matter, not a freshness one — those go to the compliance section instead.",
  },
  {
    key: "major-employers",
    label: "Major employers",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.LOW,
    needsFigure: false,
    pattern: /\b(headquarters|hq\b|major employer|employers?\b|as tenants|anchor tenant|relocat\w+ (?:its|their) (?:office|headquarters))\b/i,
    why: "Corporate tenancy and headquarters moves change slowly but they do change, and they are usually stated as settled fact.",
  },
  {
    key: "development-approval-and-zoning",
    label: "Development approvals and zoning status",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    // Requires an ACTION or a status, not a bare mention. "Henderson runs its
    // own zoning" is a durable fact about how the city works; "the zoning change
    // was approved" is a claim that can stop being true.
    pattern: /\b(rezon\w+|entitlement|variance\b|master plan amendment|zoning (?:change|amendment|approval|case|hearing|request)|zoned for [a-z]|land use (?:plan|designation) (?:change|amendment)|scheduled to consider|(?:planning commission|county commissioners?|city council)[^.]{0,60}\b(?:approved|denied|voted|considered|will consider|scheduled))/i,
    why: "An approval either happened or it did not. 'Scheduled to be considered' becomes false on a known date, and readers treat approval language as settled.",
  },
  {
    key: "planned-community-scope",
    label: "Planned-community scope",
    group: GROUPS.DEVELOPMENT,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.MEDIUM,
    needsFigure: true,
    pattern: /\b(remaining acres|acres reserved|build-?out|planned (?:homes|units|residents)|current population|villages? planned)\b/i,
    why: "Build-out figures are restated by the developer as land is absorbed. The acreage of the community is durable; what is LEFT of it is not.",
  },

  // --- Government, law and regulation --------------------------------------
  {
    key: "law-and-regulation",
    label: "Laws and regulations",
    group: GROUPS.GOVERNMENT,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(nrs \d|assembly bill|senate bill|ab\s?\d{2,4}\b|sb\s?\d{2,4}\b|state law|nevada law|statute|ordinance|code requires|legally required|legislature)\b/i,
    why: "Statutes are amended every biennial legislative session. A legal claim that has been superseded is the most damaging kind of stale content LVINIT can carry.",
  },
  {
    key: "rental-and-str-rules",
    label: "Rental and short-term-rental rules",
    group: GROUPS.GOVERNMENT,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(short-?term rental|airbnb|vrbo|rental (?:licen[cs]e|permit|registration)|landlord|tenant|eviction|rent control)\b/i,
    why: "Southern Nevada's short-term-rental rules have changed repeatedly, differ by jurisdiction, and have had litigation in between. Readers act on these with money.",
  },
  {
    key: "licensing-requirements",
    label: "Licensing requirements",
    group: GROUPS.GOVERNMENT,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(business licen[cs]e|licen[cs]e required|permit required|must (?:register|apply|be licen[cs]ed)|licen[cs]ing)\b/i,
    why: "A wrong licensing statement can lead someone to skip a legal requirement.",
  },
  {
    key: "tax-rules",
    label: "Tax rules",
    group: GROUPS.GOVERNMENT,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(no state income tax|income tax|sales tax|transfer tax|capital gains|tax deduction|tax credit|homestead|irs\b)\b/i,
    why: "Tax rules are the claims readers repeat to other people as fact, and rates and thresholds change on legislative and federal schedules.",
  },
  {
    key: "government-program",
    label: "Government programs",
    group: GROUPS.GOVERNMENT,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(program (?:launched|offers|provides|closed)|state program|county program|funded at|funding round|applications? (?:open|close)|first-?come,? first-?served|until funds are (?:reserved|exhausted))\b/i,
    why: "Programs open, exhaust their funding and close. A closed program described in the present tense sends readers somewhere that no longer exists.",
  },

  // --- Transportation and infrastructure -----------------------------------
  {
    key: "road-closure",
    label: "Road closures and restrictions",
    group: GROUPS.TRANSPORTATION,
    dynamism: DYNAMISM.VERY_DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(lane restrictions?|ramp closure|road closure|detour|work zone|reduced to \d+ lanes?|\d+ mph work zone)\b/i,
    why: "Closures are measured in weeks. Nothing else on the site decays faster.",
  },
  {
    key: "transit-service",
    label: "RTC and transit service",
    group: GROUPS.TRANSPORTATION,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(rtc\b|bus route|public transit|light rail|monorail|park and ride|transit fare|route \d+)\b/i,
    why: "Transit routes, fares and spans of service change on published service-change dates.",
  },
  {
    key: "travel-access-claim",
    label: "Travel and access claims",
    group: GROUPS.TRANSPORTATION,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.LOW,
    needsFigure: true,
    pattern: /\b(\d+ minutes? (?:from|to)|drive time|commute of|miles from the strip|minutes to (?:the airport|harry reid|the strip))\b/i,
    why: "Drive-time claims shift with roadwork and growth. Low consequence individually, but they are the numbers readers quote back.",
  },

  // --- Time-sensitive consumer information ---------------------------------
  {
    key: "deadline-or-application-period",
    label: "Deadlines and application periods",
    group: GROUPS.CONSUMER,
    dynamism: DYNAMISM.VERY_DYNAMIC,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(deadline|available only through|expires?|apply by|ends on|open enrollment|application (?:window|period)|through (?:january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2})\b/i,
    why: "A deadline is the one kind of fact that becomes false on a date you can calculate in advance. The agent checks whether that date has already passed.",
  },
  {
    key: "fee-or-rate-figure",
    generic: true,
    label: "Fees and rates",
    group: GROUPS.CONSUMER,
    dynamism: DYNAMISM.VERY_DYNAMIC,
    baseRisk: RISK.HIGH,
    needsFigure: true,
    pattern: /\b(fee|fees|dues|surcharge|premium of|percent of the loan|funding fee|impact fee|permit fee|application fee)\b/i,
    why: "Fees are set by whoever charges them, and revised without notice to anyone republishing them.",
  },
  {
    key: "price-figure",
    generic: true,
    label: "Prices and cost figures",
    group: GROUPS.CONSUMER,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: true,
    pattern: /\b(costs? (?:about|around|roughly|\$)|priced (?:at|from)|starting (?:at|from) \$|admission|ticket price|monthly cost|utility bill|averages? \$)/i,
    why: "Consumer prices drift. Individually low-stakes; collectively they are what makes a guide feel out of date.",
  },
  {
    key: "eligibility-rule",
    generic: true,
    label: "Eligibility rules",
    group: GROUPS.CONSUMER,
    dynamism: DYNAMISM.MODERATE,
    baseRisk: RISK.HIGH,
    needsFigure: false,
    pattern: /\b(eligib\w+|qualif\w+|income limit|must (?:be|have|not have)|restricted to|only available to|area median income|owner-?occupancy)\b/i,
    why: "Eligibility language decides whether a reader believes a door is open to them. Wrong here means someone does not apply for something they qualify for.",
  },
  {
    key: "operating-status",
    label: "Operating status and hours",
    group: GROUPS.CONSUMER,
    dynamism: DYNAMISM.DYNAMIC,
    baseRisk: RISK.MEDIUM,
    needsFigure: false,
    pattern: /\b(open (?:daily|weekdays|year-?round)|hours are|closed (?:mondays|tuesdays|on)|operates|no longer (?:open|operating)|still (?:open|running))\b/i,
    why: "Hours and operating status change quietly, and a reader can drive somewhere on the strength of the claim.",
  },
];

/** Fast lookup by key. */
export const CATEGORY_BY_KEY = new Map(FACT_CATEGORIES.map((c) => [c.key, c]));

/**
 * Jurisdiction tagging — the separate dimension described in the header.
 * Ordered most-specific first, so "City of Las Vegas" does not read as "Nevada".
 */
export const JURISDICTIONS = [
  { key: "city-of-las-vegas", label: "City of Las Vegas", pattern: /\bcity of las vegas\b|lasvegasnevada\.gov/i },
  { key: "north-las-vegas", label: "City of North Las Vegas", pattern: /\bnorth las vegas\b|cityofnorthlasvegas/i },
  { key: "henderson", label: "City of Henderson", pattern: /\bcity of henderson\b|cityofhenderson/i },
  { key: "clark-county", label: "Clark County", pattern: /\bclark county\b|clarkcountynv\.gov/i },
  { key: "federal", label: "Federal", pattern: /\bfha\b|\bva loan\b|\busda\b|\bfannie mae\b|\bfreddie mac\b|\birs\b|\bhud\b/i },
  { key: "nevada", label: "State of Nevada", pattern: /\bnevada\b|\bnrs \d|\bstate law\b|\blegislature\b|nv\.gov/i },
];

/** Which government owns the rule this claim describes, if any. */
export function detectJurisdiction(text) {
  const value = String(text ?? "");
  for (const j of JURISDICTIONS) {
    if (j.pattern.test(value)) return { key: j.key, label: j.label };
  }
  return null;
}

/**
 * Which categories a sentence is about.
 *
 * Returns every match, strongest first, because one sentence genuinely can be
 * two things at once ("the program offers $20,000 through December 31, 2026" is
 * an assistance program AND a deadline). claims.mjs takes the first as the
 * primary category and keeps the rest as secondary ones.
 *
 * `hasFigure` is supplied by the caller because the caller already had to work
 * out whether the sentence carries a number.
 */
export function categorize(text, { hasFigure = false } = {}) {
  const value = String(text ?? "");
  const matches = [];
  for (const category of FACT_CATEGORIES) {
    if (!category.pattern.test(value)) continue;
    if (category.needsFigure && !hasFigure) continue;
    matches.push(category);
  }
  // Specific categories beat generic ones; then highest consequence, then
  // fastest-decaying — so the primary category is the one that both describes
  // the claim most precisely and most deserves a reader's attention.
  const riskRank = { high: 0, medium: 1, low: 2 };
  const dynamismRank = { "very-dynamic": 0, dynamic: 1, moderate: 2, stable: 3 };
  return matches.sort(
    (a, b) =>
      Number(Boolean(a.generic)) - Number(Boolean(b.generic)) ||
      riskRank[a.baseRisk] - riskRank[b.baseRisk] ||
      dynamismRank[a.dynamism] - dynamismRank[b.dynamism] ||
      a.key.localeCompare(b.key)
  );
}
