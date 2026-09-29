# LVINIT Content Cluster Map & Editorial Priority Queue

> **Strategic planning artifact. Analysis only.** Nothing in this document has
> been executed. No article was published, edited, merged, redirected or
> re-slugged to produce it, and it is **not wired into any automation**. It is
> intended as the strategic input for the LVINIT Content Publisher's
> "content map first" step (`.claude/agents/lvinit-content-publisher.md` §1a.2)
> and for the Internal Linking Agent.
>
> **Snapshot date:** 2026-09-28 · **Repo state:** `main` @ `0facbd3`
> **Related:** [CONTENT_PUBLISHER_AGENT.md](CONTENT_PUBLISHER_AGENT.md) ·
> [PROJECT_STATE.md](PROJECT_STATE.md) ·
> [INTERNAL_LINKING_AGENT.md](INTERNAL_LINKING_AGENT.md) ·
> [GSC_OPPORTUNITY_AGENT.md](GSC_OPPORTUNITY_AGENT.md) ·
> [CONTENT_BRIEF_GENERATOR.md](CONTENT_BRIEF_GENERATOR.md) ·
> [DEVELOPMENT_WATCH.md](DEVELOPMENT_WATCH.md)

**How this was built.** Inventory came from the actual routes under `app/guides/`
and `app/neighborhoods/` (not the sitemap alone), cross-checked against the
`guides[]` registry in `lib/content.ts` and `app/sitemap.ts`. Link counts come
from parsing every `page.tsx` for `/guides/…` and `/neighborhoods/…` hrefs as of
this snapshot, including cards and "Keep reading" blocks. Evidence inputs are
listed in §16. Search volumes quoted here are raw Search Console numbers and are
**evidence of demand only**. They are tiny (see §16), and nothing here invents
demand beyond them.

---

## Contents

1. [Executive summary](#1-executive-summary)
2. [Current article inventory](#2-current-article-inventory)
3. [Cluster A: Moving to Las Vegas](#3-cluster-a--moving-to-las-vegas)
4. [Cluster B: Where to Live / Neighborhoods](#4-cluster-b--where-to-live--neighborhoods)
5. [Cluster C: Buying a Home in Las Vegas](#5-cluster-c--buying-a-home-in-las-vegas)
6. [Cluster D: Las Vegas New Construction](#6-cluster-d--las-vegas-new-construction)
7. [Cluster E: Las Vegas Housing Market](#7-cluster-e--las-vegas-housing-market)
8. [Unclustered content](#8-unclustered-content)
9. [Pillar status by cluster](#9-pillar-status-by-cluster)
10. [Major content gaps](#10-major-content-gaps)
11. [Cannibalization / overlap risks](#11-cannibalization--overlap-risks)
12. [Internal-link opportunities](#12-internal-link-opportunities)
13. [Top 30 editorial priority queue](#13-top-30-editorial-priority-queue)
14. [Do-not-prioritize list](#14-do-not-prioritize-list)
15. [Recommended next 10 Publisher runs](#15-recommended-next-10-publisher-runs)
16. [Missing data / unavailable inputs](#16-missing-data--unavailable-inputs)
17. [Strategic observations](#17-strategic-observations)

---

## 1. Executive summary

- **31 editorial pages** are live: 24 articles under `/guides/…` and 7 routes
  under `/neighborhoods/…` (5 area pillars + 2 child features). The `/guides`
  index, `/search`, `/contact` and the homepage are not counted.
- **Cluster balance is badly lopsided.** B (Neighborhoods) has 11 pages and E
  (Market) has 8, but **A (Moving to Las Vegas) has exactly 1**, and C (Buying)
  and D (New Construction) have 4 each. 3 pages don't fit any cluster.
- **The editorial mix has run the reverse of target.** Of the 14 articles
  published since 2026-09-03, **11 were timely** (local-development features,
  mortgage-rate installments, a monthly price report) and only **3 were
  evergreen/cluster work** (the two video companions on 2026-09-10 and the
  Water Street child guide). The strategy calls for about 70% evergreen/cluster
  work and 30% timely; the last four weeks ran closer to 20/80.
- **The strongest pages are the evergreen video companions.** They're the
  longest, the best linked, and they carry Mikey's own footage. **Two of the
  five homepage videos have no companion article:** *"Moving to Las Vegas in
  2026? Choose the Area Before the House"* (the featured, position-0 homepage
  video) and *"Rent First or Buy First When Moving to Las Vegas?"*. Those two
  are the fastest way to give Cluster A a real core.
- **Search signal is early but consistent.** Google is testing Market Watch
  and buyer pages at positions 6–8 (new-home sales July: 107 page impressions
  at 6.2; July prices: 60 at 7.9; starter homes: 21 at 6.8; property tax: 15
  at 6.4). The area pillars sit around position 50–60 (North Las Vegas 59
  impressions at 54.3, Summerlin 22 at 57.6). Every opportunity input points
  at **expanding the North Las Vegas and Summerlin pillars, not adding new
  pages about them.**
- **Biggest cannibalization risk: the mortgage-rate thread.** Three dated
  installments in 16 days, two with near-identical `<title>`s, and pressure
  this week for a fourth. **Update in place. No new rate URLs.**
- **Biggest internal-link gaps:** `/guides/new-build-vs-resale-las-vegas` (the
  site's deepest buyer guide at ~3,700 words) has only **2** inbound editorial
  links. `/guides/what-500k-buys-in-las-vegas` receives 17 but links out to
  only **1** page. None of the three big pillars links to the three-way
  comparison or the new-build guide.
- **Pillars:** B is STRONG. C and E are USABLE BUT NEED EXPANSION. **A and D
  have NO CLEAR PILLAR.**

---

## 2. Current article inventory

**Legend.** *Type* uses the taxonomy from the task brief. *In/Out* are
editorial-to-editorial link counts (cards and "Keep reading" blocks included;
nav, footer, `/guides`, `/search` and `/contact` excluded). *Isolated?* flags
pages with ≤1 inbound editorial link, or pages that sit outside a strong
cluster. Dates come from each page's `StoryMeta` (`datePublished` /
`dateModified`); "—" means none is set.

| # | Title (short) | Route | Published | Modified | Type | Primary cluster | Primary user intent | Likely search intent | In / Out | Isolated? |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Summerlin Las Vegas: Map, Villages & Local Guide | `/neighborhoods/summerlin` | 2026-07-04 | 2026-08-20 | Pillar / community guide | **B** | Decide if Summerlin fits | "summerlin neighborhood guide", "where is summerlin" | 14 / 7 | No |
| 2 | Henderson, Nevada: Map, Communities & Local Guide | `/neighborhoods/henderson` | 2026-07-04 | 2026-08-27 | Pillar / community guide | **B** | Decide if Henderson fits; which sub-area | "living in henderson nv", Henderson communities | 14 / 13 | No |
| 3 | Southwest Las Vegas: Neighborhoods, Map & Local Guide | `/neighborhoods/southwest-las-vegas` | 2026-07-16 | 2026-08-20 | Pillar / community guide | **B** | Understand an informal, fast-growing area | "southwest las vegas neighborhoods" | 12 / 6 | No |
| 4 | Living in North Las Vegas: Neighborhoods, Homes & Local Guide | `/neighborhoods/north-las-vegas` | — | — | Pillar / community guide (thin) | **B** | Is NLV right for me; is it its own city | "moving to north las vegas", "is north las vegas its own city" | 5 / 5 | No, but thin (~1,240 words) and no `datePublished` |
| 5 | Downtown Arts District: A Local's Guide | `/neighborhoods/downtown-arts-district` | 2026-07-15 | — | Pillar / community guide | **B** | Walkable urban living option | "arts district las vegas living" | 4 / 4 | Moderate |
| 6 | Four Seasons Private Residences | `/neighborhoods/henderson/four-seasons-private-residences` | 2026-07-08 | — | New-construction coverage (luxury) | **D** (sec. B) | What's being built at MacDonald Highlands | "four seasons private residences las vegas/henderson" | 1 / 2 | **Yes.** 0 in-prose links, ~470 words, temporary thumbnail image |
| 7 | Summerlin Fourth of July Parade | `/neighborhoods/summerlin/fourth-of-july-parade` | 2026-07-06 | 2026-07-06 | Community / lifestyle feature | **B** | Local life in Summerlin | "summerlin parade" (seasonal) | 1 / 1 | **Yes.** 0 in-prose links (card only) |
| 8 | Summerlin vs. Henderson | `/guides/summerlin-vs-henderson` | 2026-08-19 | — | Comparison | **B** | Choose between two suburbs | "summerlin vs henderson" | 5 / 5 | No |
| 9 | Henderson vs. Southwest Las Vegas | `/guides/henderson-vs-southwest-las-vegas` | 2026-08-31 | — | Comparison | **B** | Choose between two areas | "henderson vs southwest las vegas" | 7 / 6 | No |
| 10 | Summerlin vs Henderson vs Southwest Las Vegas | `/guides/summerlin-vs-henderson-vs-southwest-las-vegas` | 2026-09-10 | — | Comparison (video companion) | **B** | Choose among the three big suburban options | "best area to live in las vegas", 3-way comparison | 3 / 10 | Under-linked for its depth (~3,200 words) |
| 11 | Water Street District (Henderson) | `/guides/water-street-district-henderson` | 2026-09-15 | — | Community guide (child) + local development | **B** | What downtown Henderson is really like now | "water street district henderson" | 3 / 3 | No |
| 12 | Henderson Sport & Social Opens Oct. 16 | `/guides/henderson-sport-social-grand-opening` | 2026-09-19 | — | Local development (amenity) | **B** (sec. unclustered news) | What West Henderson is getting | "henderson sport and social" (event-driven) | 2 / 3 | Moderate |
| 13 | Surviving Your First Las Vegas Summer | `/guides/first-summer-in-vegas` | 2026-08-23 | — | Relocation education | **A** | Prepare for the heat | "first summer in las vegas", "las vegas heat moving" | 1 / 6 | **Yes.** 1 inbound link |
| 14 | New Build vs Resale in Las Vegas | `/guides/new-build-vs-resale-las-vegas` | 2026-09-10 | — | Buyer education (video companion) | **C** (sec. D) | Which type of home to buy | "new build vs resale las vegas" | 2 / 11 | **Yes.** Only 2 inbound links despite ~3,700 words |
| 15 | You Don't Need 20% Down (DPA programs) | `/guides/las-vegas-down-payment-assistance-programs-2026` | 2026-08-29 | — | Buyer education | **C** | How little can I put down; what programs exist | "down payment assistance las vegas", "low money down mortgage las vegas" | 6 / 6 | No |
| 16 | Why the Seller's Nevada Property Tax Bill May Not Be Yours | `/guides/nevada-property-tax-abatement-resale-buyers` | 2026-08-21 | 2026-08-22 | Buyer education | **C** | Will my tax bill match the seller's | "nevada property tax abatement buyer" | 4 / 3 | No |
| 17 | What $500K Buys in Las Vegas | `/guides/what-500k-buys-in-las-vegas` | 2026-08-04 | — | Buyer education (video companion) | **C** | What my budget buys | "what 500k buys in las vegas" | 17 / **1** | Dead end: receives 17 links, gives 1 |
| 18 | Sandstone at Tule Springs (KB Home) | `/guides/sandstone-tule-springs-north-las-vegas` | 2026-09-11 | 2026-09-25 | New-construction coverage | **D** | Should I buy in this new community | "sandstone tule springs", "kb home north las vegas" | 2 / 4 | Moderate. Has a real Mikey tour video (`aBdmoKLjoeY`) |
| 19 | Monument Hills: New 6,000-Home Community (NW LV) | `/guides/monument-hills-northwest-las-vegas` | 2026-09-03 | — | New-construction / local development | **D** | What's coming to the far northwest | "monument hills las vegas" | 3 / 4 | Moderate. Filed under the NLV cluster, but it's City of Las Vegas land |
| 20 | Wayne Newton's Casa de Shenandoah → 77 Homes | `/guides/wayne-newton-casa-de-shenandoah-redevelopment` | 2026-09-27 | 2026-09-28 | Local development / proposed subdivision | **D** (weak fit) | Curiosity + what's proposed | "casa de shenandoah" (news/celebrity) | 1 / 3 | **Yes.** 1 inbound link |
| 21 | Las Vegas Home Prices, July 2026 | `/guides/las-vegas-home-prices-july-2026` | 2026-08-17 | — | Market update (monthly) | **E** | Where are prices now | "las vegas home prices" | 11 / 8 | No. Top GSC page (60 impr, pos 7.9) |
| 22 | Las Vegas Home Prices, August 2026 | `/guides/las-vegas-home-prices-august-2026` | 2026-09-09 | — | Market update (monthly) | **E** | Where are prices now | "las vegas home prices" | 9 / 7 | No |
| 23 | Inventory Is Rising. Why Aren't Prices Falling? | `/guides/will-las-vegas-home-prices-drop` | 2026-08-04 | — | Market explainer (semi-evergreen) | **E** | Will prices drop / should I wait | "will las vegas home prices drop" | 3 / 5 | Moderate |
| 24 | Starter Homes Have More Than Doubled Since 2016 | `/guides/las-vegas-starter-home-prices-2026` | 2026-08-27 | — | Market update (affordability) | **E** | What does an entry-level home cost | "starter homes in las vegas" | 8 / 6 | No |
| 25 | New-Home Sales Jumped in July 2026 | `/guides/las-vegas-new-home-sales-july-2026` | 2026-08-25 | 2026-08-31 | Market update (new construction data) | **E** (sec. D) | Is the new-build market slowing | "las vegas new home sales" | 9 / 6 | No. **Highest GSC page** (107 impr, pos 6.2) |
| 26 | Mortgage Rates Hit a 13-Month High | `/guides/las-vegas-mortgage-rates-september-2026` | 2026-09-07 | — | Market update (rates) | **E** | What rates mean for my payment | "mortgage rates las vegas" | 6 / 6 | No |
| 27 | Mortgage Rates Are Nearing 7% | `/guides/las-vegas-mortgage-rates-approach-7-percent` | 2026-09-17 | — | Market update (rates) | **E** | Same as #26 | Same as #26 | 2 / 6 | Weak |
| 28 | Mortgage Rates Hit a 19-Month High | `/guides/las-vegas-mortgage-rates-19-month-high` | 2026-09-23 | — | Market update (rates) | **E** | Same as #26 | Same as #26 | 1 / 5 | **Yes.** 1 inbound link |
| 29 | Fiesta Henderson Site Finally Has a Plan | `/guides/fiesta-henderson-redevelopment` | 2026-09-13 | — | Local development (commercial concept) | **UNCLUSTERED** | What happens to the old casino site | "fiesta henderson redevelopment" | 3 / 4 | Pillar-attached (Henderson) |
| 30 | One Civic Center (NLV old City Hall) | `/guides/one-civic-center-north-las-vegas-redevelopment` | 2026-09-05 | — | Local development (civic/mixed-use) | **UNCLUSTERED** | What's happening downtown NLV | "one civic center north las vegas" | 2 / 3 | Pillar-attached (NLV) |
| 31 | Gholson Landing: 121 Affordable Apartments | `/guides/gholson-landing-affordable-housing-east-las-vegas` | 2026-09-25 | — | Local development (income-restricted rental) | **UNCLUSTERED** | Who qualifies / what opened | "gholson landing" | 1 / 3 | **Yes.** 1 inbound link |

**Not live, but in flight:** PR #25 (open since 2026-09-01), branch
`claude/fervent-davinci-9aez0p`, adds `/guides/las-vegas-income-needed-to-buy-a-home-2026`
(Market Watch, Redfin data as of June 2026). Treated as a **HOLD** item in §13.

**Registry notes (flag only, nothing changed):**

- The `guides[]` entry whose `slug` is `"cost-of-living-2026"` actually points at
  the **property-tax** article (`/guides/nevada-property-tax-abatement-resale-buyers`).
  Any tooling that maps clusters by registry slug will read that page as a
  cost-of-living piece, and it isn't one. LVINIT has **no** cost-of-living
  article.
- The four big area pillars (Summerlin, Henderson, Southwest, North Las Vegas)
  are **not** in `guides[]`. That's by design, but it means registry-only
  inventory scans undercount Cluster B.

---

## 3. Cluster A: Moving to Las Vegas

**Pages (1):** `/guides/first-summer-in-vegas`

**Pillar status:** **NO CLEAR PILLAR.**

**Map:**

```
(no pillar)
  └─ first-summer-in-vegas ──► all 5 area pillars, what-500k
        ▲ only inbound: new-build-vs-resale
```

**Observations**

- This is the cluster LVINIT's own homepage leads with. The featured video in
  position 0 is *"Moving to Las Vegas in 2026? Choose the Area Before the
  House"* (`nyK0cchUt14`), and a second homepage video, *"Rent First or Buy
  First When Moving to Las Vegas?"* (`2rboWkJ9j48`), sits in the same cluster.
  **Neither has a companion article on the site.**
- The homepage `MovingToLasVegas` section shows four topic chips (Cost of
  Living, Getting Around, Schools & Family, Climate & Lifestyle) that all link
  to the `#guides` anchor. **No real page exists for any of them.** (Only
  Climate is partly covered, by the first-summer piece.)
- GSC shows small but real relocation/orientation queries: "moving to north
  las vegas", "is north las vegas its own city", "is north las vegas clark
  county", "where is summerlin". These currently land on area pillars at
  positions 40–95.
- The one existing page is effectively isolated (1 inbound link).

---

## 4. Cluster B: Where to Live / Neighborhoods

**Pages (11):** 5 area pillars, 3 comparisons, 3 child features.

**Pillar status:** **STRONG EXISTING PILLAR** at the area level. Summerlin,
Henderson and Southwest are each ~5,000–6,000 words with maps, rosters and
related-story clusters. There is **no cluster-level "where to live in Las
Vegas" hub**; the three-way comparison is the de-facto one.

**Map:**

```
Summerlin pillar ─── Fourth of July parade (card-only link)
Henderson pillar ─┬─ Water Street District
                  ├─ Henderson Sport & Social
                  ├─ Four Seasons (D)
                  ├─ Wayne Newton (D)
                  └─ Fiesta Henderson (unclustered)
Southwest pillar ─── (no children; Mountain's Edge, Rhodes Ranch, Southern
                      Highlands, UnCommons named but unlinked)
North Las Vegas pillar (thin) ─┬─ Sandstone (D) ─ Monument Hills (D)
                               └─ One Civic Center (unclustered)
Downtown Arts District pillar ─ (no children)

Comparisons: S vs H ── H vs SW ── S vs H vs SW (3-way, video companion)
```

**Observations**

- **The North Las Vegas pillar is the weak link.** ~1,240 words vs 5–6k for its
  siblings, no `datePublished`/`dateModified`, and it's the page with the most
  GSC momentum (59 impressions, position 62.9 → 54.3). It already has a Mikey
  home-tour video embedded. It doesn't yet embed or link the Sandstone tour.
- **The Summerlin pillar** is the target of the only current update brief
  (BRIEF-2026-09-22-001: "What does someone deciding where to live need to
  understand about Summerlin?", position ~58).
- **None of the three big pillars links to the three-way comparison**, which is
  the most complete "which area" page on the site.
- **Northwest Las Vegas** (Centennial Hills, Skye Canyon, the Monument Hills
  area) has no pillar. Monument Hills (City of Las Vegas land) currently hangs
  off the *North Las Vegas* pillar, which the Monument Hills article itself
  says is the wrong city.
- Henderson child guides named as next in `PROJECT_STATE.md`: **Lake Las
  Vegas** and **Green Valley Ranch**. Southwest children named in its own copy:
  **Mountain's Edge**, **Rhodes Ranch**, **Southern Highlands**, **UnCommons**.
  Summerlin planned children: **Downtown Summerlin**, **Fox Hill Park**.

---

## 5. Cluster C: Buying a Home in Las Vegas

**Pages (4):** new-build-vs-resale, down-payment assistance, property-tax
abatement, what-$500K-buys.

**Pillar status:** **USABLE BUT NEEDS EXPANSION.** The best candidate is
`/guides/new-build-vs-resale-las-vegas` (~3,700 words, 11 outbound links,
video companion). But it's a decision guide, not a "how buying a home in Las
Vegas works" core page, and it's under-linked (2 inbound).

**Map:**

```
new-build-vs-resale (best candidate) ──► DPA, property tax, 500K, pillars, market
      ▲ only from: henderson-vs-southwest, new-home-sales-july
DPA ◄──► property tax, starter homes, rate pages, Gholson
what-500k ◄── 17 pages   ──► only /neighborhoods/southwest-las-vegas
property tax ◄── DPA, starter, new-build-vs-resale, 3-way
```

**Observations**

- The cluster has the right *kind* of pages (local, specific, honest), but the
  core ownership-cost topics are missing: **closing costs, HOA fees, SID/LID
  assessments, the step-by-step process, buying from out of state**.
- `what-500k-buys` is a link sink. It's the most-linked page on the site and
  sends readers almost nowhere. That's a real cluster weakness because it's a
  video companion with high user intent.
- GSC: property tax (15 impr, pos 6.4) and DPA (14 impr, pos 33.9; query "low
  money down mortgage las vegas nv") show Google testing the cluster.

---

## 6. Cluster D: Las Vegas New Construction

**Pages (4):** Sandstone at Tule Springs, Monument Hills, Four Seasons Private
Residences, Wayne Newton / Casa de Shenandoah (weak fit: a proposed 77-lot
subdivision). Strongly related but assigned elsewhere: new-build-vs-resale (C)
and new-home-sales July (E).

**Pillar status:** **NO CLEAR PILLAR.** Every D page is a single-community news
piece. No page explains how buying new construction in Las Vegas works: builder
incentives, preferred-lender terms, lot premiums, phases, HOA/SID, agent
representation at the model, or where the building is happening.

**Map:**

```
(no pillar)  ··· closest: new-build-vs-resale (C)
  Sandstone ◄──► Monument Hills ──► NLV pillar
  Four Seasons ◄── Henderson pillar only
  Wayne Newton ◄── Henderson pillar only
  (none of the four link to new-build-vs-resale)
```

**Observations**

- This is where LVINIT has **the most original first-party material that isn't
  on the site yet**: the Sandstone YouTube tour (`aBdmoKLjoeY`, up 2026-09-25)
  and its Shorts ("Under $390K", "NO HOA", "$62K upgrades", Strip views), plus
  Mikey's own Landings model-row photography.
- **GSC's highest-impression page is the new-home-sales report** (107
  impressions, position 6.2). Google associates LVINIT with new-construction
  data before LVINIT has an evergreen new-construction guide to catch that
  interest.
- Four Seasons is on the CLAUDE.md "current priority" list but is the thinnest
  page on the site (~470 words, 0 in-prose links, temporary thumbnail image).

---

## 7. Cluster E: Las Vegas Housing Market

**Pages (8):** July prices, August prices, will-prices-drop, starter homes,
new-home sales July, and three mortgage-rate installments.

**Pillar status:** **USABLE BUT NEEDS EXPANSION.** The best evergreen candidate
is `/guides/will-las-vegas-home-prices-drop` (market explainer), but it's
anchored in June 2026 data and has only 3 inbound links. The cluster is
otherwise a chain of dated installments with no stable page that holds
"the current state of the Las Vegas market".

**Map:**

```
Price series:   july-2026 ◄──► august-2026 ──► (September not yet published)
Rate series:    september-2026 ──► approach-7-percent ──► 19-month-high
Explainers:     will-prices-drop, starter-homes
New-build data: new-home-sales-july-2026 (top GSC page)
All of them ──► what-500k, DPA, starter (dense, healthy internal mesh)
```

**Observations**

- The internal mesh inside E is healthy. The problem is **authority
  fragmentation**: every month or rate move creates a new URL competing for the
  same head intent ("las vegas home prices", "mortgage rates las vegas").
- The Fact-Decay Agent is already flagging the older installments (July prices
  FACT-001/002; September rates FACT-003/005, per the 2026-09-28 weekly plan).
  Dated series decay by design.
- Timely hooks this week: Freddie Mac PMMS 7.03% (week of Sept 24), LVR
  September report expected around Oct 7–9 (date unconfirmed), and the next
  Home Builders Research new-home release (not yet checked).

---

## 8. Unclustered content

**UNCLUSTERED / NEEDS STRATEGY REVIEW (3 pages):**

| Page | Why it doesn't fit | Closest relationship | Recommendation |
|---|---|---|---|
| `/guides/fiesta-henderson-redevelopment` | Commercial concept (youth sports, hotel, retail). No housing, no buyer decision | B (Henderson pillar) | Keep. Useful as Henderson context. Don't produce more non-residential concept pieces unless they change a neighborhood's livability or access |
| `/guides/one-civic-center-north-las-vegas-redevelopment` | Civic/mixed-use redevelopment with a long, uncertain timeline | B (NLV pillar) | Keep. Fold future updates into the NLV pillar's development section rather than new URLs |
| `/guides/gholson-landing-affordable-housing-east-las-vegas` | Income-restricted rental housing, explicitly not a path to ownership | E (affordability), C (DPA contrast) | Keep. Good civic journalism, but it isn't buyer/relocation intent. Low priority for follow-ups |

**Strategy note:** LVINIT has no "local development" cluster, yet 6 of 31 pages
are development-news pieces (these three plus Monument Hills, Wayne Newton and
Sport & Social). Mikey should decide whether development coverage stays
**attached to area pillars** (current practice, recommended) or becomes its own
strand. The Publisher shouldn't create one on its own (§1a.3).

---

## 9. Pillar status by cluster

| Cluster | Status | Current best page | Why |
|---|---|---|---|
| **A. Moving to Las Vegas** | **NO CLEAR PILLAR** | `/guides/first-summer-in-vegas` (not pillar-grade) | One narrow page. The homepage's featured relocation video has no companion. Homepage topic chips point nowhere |
| **B. Where to Live** | **STRONG EXISTING PILLAR** | `/neighborhoods/summerlin`, `/henderson`, `/southwest-las-vegas` (+ 3-way comparison as de-facto hub) | Deep, photographed, well-linked area guides. Weak spots: the NLV pillar is thin, there's no Northwest pillar, and no valley-level hub |
| **C. Buying a Home** | **USABLE BUT NEEDS EXPANSION** | `/guides/new-build-vs-resale-las-vegas` | Deep and honest, but it's a decision guide, not a process pillar. Only 2 inbound links. Core cost topics missing |
| **D. New Construction** | **NO CLEAR PILLAR** | (none; nearest is new-build-vs-resale in C) | All D pages are single-community news. No evergreen new-construction guide despite the strongest first-party footage and the top GSC page being new-build data |
| **E. Housing Market** | **USABLE BUT NEEDS EXPANSION** | `/guides/will-las-vegas-home-prices-drop` | Only semi-evergreen explainer, June-anchored. The rest are dated installments that fragment authority. No page represents "the market right now" |

> The Publisher may not create new hub/pillar **routes** on its own (§1a.3 /
> §1a.9). The pillar-building items in §13 are written as **articles under
> `/guides/`** that can act as a cluster's core. Promoting any of them to a
> dedicated hub route, or consolidating dated series, is **Mikey's call**.

---

## 10. Major content gaps

Each gap is chosen for local specificity and durable value. Items tied to real
LVINIT material (video, photos, existing pages) are marked ★.

### A. Moving to Las Vegas
1. ★ **Choose the area before the house.** Companion to the featured homepage
   video. The natural core for A: how to choose a part of the valley before
   touring homes, linking out to every area pillar and comparison.
2. ★ **Rent first or buy first when moving to Las Vegas.** Companion to the
   existing video. Bridges A → C and sets up DPA and new-build links.
3. **What "Las Vegas" actually means: city vs Henderson vs North Las Vegas vs
   unincorporated Clark County.** GSC long-tail questions exist. The Southwest
   pillar and the Wayne Newton piece already teach the unincorporated lesson in
   passing. Very LVINIT, very durable.
4. **Cost of living in Las Vegas.** A homepage chip already promises it. Must be
   strictly sourced and must not duplicate the property-tax article.
5. **Setting up utilities in Las Vegas** (NV Energy, water district by
   jurisdiction, trash, internet). Includes the NV Energy daily demand charge
   **only if verified** (weekly plan flags it as unconfirmed).
6. **Getting around / commute tradeoffs** (215 Beltway, I-15, Summerlin Pkwy,
   airport access). A homepage chip already promises it.

### B. Where to Live
1. **Expand the North Las Vegas pillar** (not a new page). ★ Sandstone tour,
   ★ existing NLV home tour, Beltway Trail news, "is NLV its own city".
2. **Sharpen the Summerlin pillar** answer-first (BRIEF-2026-09-22-001).
3. **Northwest Las Vegas area guide** (Centennial Hills / Skye Canyon / the
   Monument Hills area). Fixes the geography mismatch. Needs photography.
4. **Lake Las Vegas** and **Green Valley Ranch** child guides (named in
   `PROJECT_STATE.md`. Roster `href` flips from plain text to a link).
5. ★ **Mountain's Edge** (Southwest child). Mikey's own Mountain's Edge park
   drone photo is already in the repo.
6. **Downtown Summerlin** child (planned in `PROJECT_STATE.md`).

### C. Buying a Home
1. **Closing costs in Las Vegas** (who pays what in Clark County, the transfer
   tax, escrow/title norms). Every figure sourced.
2. **HOA fees in Las Vegas** (master vs sub-association, what they cover, how
   to check before offering). ★ Sandstone "no HOA" content shows the audience
   cares.
3. **SIDs and LIDs** (special improvement / local improvement district
   assessments). Very Las Vegas, buyers rarely know to ask, and it pairs with
   the property-tax page.
4. **Buying in Las Vegas from out of state** (remote touring, timing a move,
   verification). A ↔ C bridge with clear lead intent.
5. **How buying a home in Las Vegas works, step by step** (C core candidate,
   later).

### D. New Construction
1. ★ **Buying new construction in Las Vegas** (incentives vs price, preferred
   lender strings, lot premiums, phases, HOA/SID, bringing your own agent to
   the model). D core candidate. Draws on the Sandstone tour and
   new-build-vs-resale.
2. **Where new homes are being built in Las Vegas** (corridor map: Tule
   Springs, far northwest, Southwest, West Henderson/Inspirada, Cadence).
   Connects existing D pages.
3. **Builder incentives when rates are near 7%** (rate buydowns vs price cuts).
   Timely hook, evergreen mechanics. Could be a section of #1 instead.
4. **Four Seasons expansion** (needs new real material from Mikey).

### E. Housing Market
1. **Rates: one updatable page, not a fourth installment.**
2. **September 2026 LVR report** (when published). Format decision needed
   (§11 R2).
3. **New-home sales follow-up** (next Home Builders Research release). Tied to
   the top GSC page.
4. **Refresh `will-las-vegas-home-prices-drop`** with current data so the
   cluster has a live explainer.
5. **Rent vs buy math in Las Vegas.** Best folded into A-2 rather than a
   separate E page.

---

## 11. Cannibalization / overlap risks

| # | Risk | Pages | Level | Guidance (flag only, nothing merged) |
|---|---|---|---|---|
| R1 | **Mortgage-rate installments competing for one intent.** Three URLs in 16 days. `<title>`s for #26 and #28 differ by one phrase ("13-Month" vs "19-Month High — What It Means for Las Vegas Buyers"). The weekly plan wants the 7.03% print this week | `las-vegas-mortgage-rates-september-2026`, `…-approach-7-percent`, `…-19-month-high` | **HIGH** | No new rate URL. Update `…-19-month-high` in place. Consolidating into one evergreen rates page is a **Mikey decision** |
| R2 | **Monthly price reports as new URLs.** July and August already split "las vegas home prices". July is the one Google is testing (pos 7.9) and it's decaying (Fact-Decay flags) | `las-vegas-home-prices-july-2026`, `…-august-2026`, future September | **MEDIUM** (HIGH if it continues through Q4) | Before September ships, decide: new monthly URL plus a "latest" link chain, or one updated tracker page. Hub route = Mikey decision |
| R3 | **New "Summerlin guide" or "moving to North Las Vegas" articles** would duplicate pillars | `/neighborhoods/summerlin`, `/neighborhoods/north-las-vegas` | **HIGH if created** | Brief Generator and GSC both say expand the pillar. Don't create standalone articles on these intents |
| R4 | **Three comparisons with overlapping pairs.** The 3-way (~3,200 words) contains both pairings. S vs H (~1,160 words) is the thinnest | `summerlin-vs-henderson`, `henderson-vs-southwest-las-vegas`, `summerlin-vs-henderson-vs-southwest-las-vegas` | **MEDIUM** | No new comparisons of these same areas. If S vs H is touched, give it a differentiated angle (e.g., cost of ownership, commute) and point to the 3-way for the full picture |
| R5 | **Affordability pieces overlapping.** will-prices-drop, starter homes, DPA and the unmerged PR #25 (income needed) all answer "can I afford Las Vegas". PR #25 has been open 4 weeks on June data and edits files that have changed since | `will-las-vegas-home-prices-drop`, `las-vegas-starter-home-prices-2026`, DPA, PR #25 | **MEDIUM** | Resolve PR #25 (close, or refresh then merge) before any new affordability article |
| R6 | **Future "Moving to Las Vegas" core vs the 3-way comparison.** Both could target "where should I live in Las Vegas" | future A-1 article, 3-way comparison | **MEDIUM** | Scope A-1 as the *decision process* (area-first, rent-vs-buy, timing, what to check) and hand off to the 3-way for the actual comparison |
| R7 | **Future Tule Springs area page vs Sandstone** | `sandstone-tule-springs-north-las-vegas` | **MEDIUM if created** | Any Tule Springs area coverage belongs in the NLV pillar expansion first, not a new URL that competes with the Sandstone page |
| R8 | **Henderson development features vs the Henderson pillar's Development Watch section** | Fiesta, Sport & Social, Water Street, Henderson pillar | **LOW** | Already disambiguated and cross-linked. Keep new Henderson development news as pillar updates unless it's major |
| R9 | **New-build-vs-resale vs a future "buying new construction" guide** | `new-build-vs-resale-las-vegas`, future D-1 | **MEDIUM** | D-1 must be *how new-build buying works* (process, incentives, representation), not *whether* to buy new. Link to new-build-vs-resale for that decision |
| R10 | **Monument Hills filed under the NLV cluster** though it's City of Las Vegas | `monument-hills-northwest-las-vegas`, NLV pillar | **LOW** (IA hygiene) | Keep as-is. A future Northwest guide becomes its natural parent |

---

## 12. Internal-link opportunities

*For the Internal Linking Agent and the Publisher's own back-link duty. None
implemented. Every link below must still pass the agent's anchor, density and
Fair Housing gates.*

### Pillar → support (missing today)
- `/neighborhoods/summerlin` → `summerlin-vs-henderson-vs-southwest-las-vegas`,
  `new-build-vs-resale-las-vegas`, `las-vegas-new-home-sales-july-2026` (its
  hero photo is a Lennar street *in Summerlin*), `first-summer-in-vegas`, and
  an in-prose (not card-only) link to the Fourth of July parade.
- `/neighborhoods/henderson` → `summerlin-vs-henderson-vs-southwest-las-vegas`,
  `new-build-vs-resale-las-vegas`; an in-prose link to Four Seasons (card-only
  today).
- `/neighborhoods/southwest-las-vegas` → `summerlin-vs-henderson-vs-southwest-las-vegas`,
  `new-build-vs-resale-las-vegas`, `las-vegas-new-home-sales-july-2026`.
- `/neighborhoods/north-las-vegas` → `new-build-vs-resale-las-vegas`,
  `las-vegas-starter-home-prices-2026`, `first-summer-in-vegas`; the Sandstone
  tour video.

### Support → pillar / core (missing today)
- `sandstone-tule-springs-north-las-vegas`, `monument-hills-northwest-las-vegas`,
  `wayne-newton-casa-de-shenandoah-redevelopment` → `new-build-vs-resale-las-vegas`
  (acting D core until a D guide exists).
- `las-vegas-mortgage-rates-19-month-high` and `…-approach-7-percent` →
  `will-las-vegas-home-prices-drop` (E's explainer).
- `las-vegas-home-prices-august-2026` → the newest rate installment (it links
  only to the September 7 one).

### Strong support ↔ related support
- `what-500k-buys-in-las-vegas` → `las-vegas-down-payment-assistance-programs-2026`,
  `new-build-vs-resale-las-vegas`, `summerlin-vs-henderson-vs-southwest-las-vegas`,
  `las-vegas-home-prices-august-2026`. **Highest-value single fix.** The most
  linked-to page on the site currently leads nowhere.
- `nevada-property-tax-abatement-resale-buyers` ↔ `las-vegas-down-payment-assistance-programs-2026`
  (DPA links in, no link back).
- `las-vegas-starter-home-prices-2026` → `sandstone-tule-springs-north-las-vegas`
  (Sandstone is priced from the high $300Ks, the starter-home story in
  practice).
- `fiesta-henderson-redevelopment` → `water-street-district-henderson`
  (LINK-2026-09-22-002, review-only at 0.668).
- `will-las-vegas-home-prices-drop` → `las-vegas-new-home-sales-july-2026`
  (LINK-2026-09-22-003, review-only at 0.574).

### Orphan-ish pages (≤1 inbound editorial link)
`first-summer-in-vegas` · `las-vegas-mortgage-rates-19-month-high` ·
`wayne-newton-casa-de-shenandoah-redevelopment` ·
`gholson-landing-affordable-housing-east-las-vegas` ·
`/neighborhoods/henderson/four-seasons-private-residences` (0 in-prose) ·
`/neighborhoods/summerlin/fourth-of-july-parade` (0 in-prose).

### Pages that should be surfaced from multiple guides
1. `new-build-vs-resale-las-vegas`: from all 4 big pillars, every D page,
   `what-500k`, `starter-homes`, DPA.
2. `summerlin-vs-henderson-vs-southwest-las-vegas`: from all 3 of its pillars,
   `what-500k`, `first-summer`.
3. `first-summer-in-vegas`: from every area pillar (heat is a valley-wide move
   factor), and from new Cluster A articles as they ship.
4. `will-las-vegas-home-prices-drop`: from every rate installment.

### Structural (for Mikey, not agents)
- The homepage `MovingToLasVegas` chips link to `#guides`. Once Cluster A
  articles exist, wiring the chips to them is a design change (not Publisher
  or Linking Agent scope).

---

## 13. Top 30 editorial priority queue

**Key.** *Src* = opportunity source. *E/T* = evergreen / timely. *Conf* =
confidence. *Expand instead?* answers "should an existing page be expanded
instead of creating this?". Input IDs are cited where they exist.

| Rank | Action | Topic / title direction | Cluster | Target intent | Why it matters | Supports | Expand instead? | Dup risk | Link relationships | Src | E/T | Conf |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | EXPAND EXISTING PAGE | North Las Vegas pillar: answer "is NLV its own city / is it Clark County" early; add Tule Springs + Sandstone section with the tour video; add 215 Northern Beltway Trail (DEV-2026-09-24-003, sourced); set honest `datePublished`/`dateModified` | B | Deciding whether to move to NLV | Page with the most GSC momentum (GSC-2026-09-22-002), thinnest pillar, flagged by the weekly plan | NLV pillar itself | **Is** the expansion | HIGH if a new NLV article is made instead (R3) | → Sandstone, Monument Hills, One Civic, new-build-vs-resale, starter homes, first-summer | GSC, cluster weakness, existing video, local development | E | HIGH |
| 2 | BUILD PILLAR (as `/guides/` article) | "Moving to Las Vegas in 2026: Choose the Area Before the House" (companion to `nyK0cchUt14`) | A | Relocating, don't know where to start | Fills an empty cluster with the homepage's featured video. Becomes A's core | All area pillars, 3-way comparison, first-summer | No. Nothing covers this | MEDIUM vs 3-way (R6). Scope as process | → all 5 pillars, 3-way, first-summer, rent-or-buy (#3), DPA. ← first-summer, pillars | Existing video, cluster weakness | E | HIGH |
| 3 | NEW ARTICLE | "Rent First or Buy First When Moving to Las Vegas?" (companion to `2rboWkJ9j48`) | A | Timing a move; rent vs buy | Second orphaned homepage video. A→C bridge with real lead intent | #2, DPA, new-build-vs-resale | No | LOW | → #2, DPA, 500K, starter homes, rates page. ← #2, DPA | Existing video, content gap | E | HIGH |
| 4 | EXPAND EXISTING PAGE | Update `las-vegas-mortgage-rates-19-month-high` with the Sept 24 PMMS print (7.03%) and subsequent weekly prints, honest `dateModified` | E | Current rate & payment impact | Timely, most-searched topic this week (weekly plan), and avoids a 4th installment | Rate thread | **Yes: expand, don't create** | HIGH if a new URL (R1) | → will-prices-drop, DPA, #3. ← August prices | Market data, weekly plan | T | HIGH |
| 5 | BUILD PILLAR (as `/guides/` article) | "Buying New Construction in Las Vegas: Incentives, Lot Premiums, Phases, and Bringing Your Own Agent" | D | Touring models, about to sign with a builder | D has no core. Strongest first-party footage (Sandstone tour + Shorts). New-build data is the top GSC page | new-build-vs-resale, Sandstone, Monument Hills, new-home sales | No. new-build-vs-resale covers *whether*, not *how* | MEDIUM (R9) | → new-build-vs-resale, Sandstone, Monument Hills, new-home sales, HOA (#9), SID (#11). ← all D pages | Cluster weakness, existing video, GSC (adjacent) | E | HIGH |
| 6 | INTERNAL-LINK FOLLOW-UP | Give `what-500k-buys` real outbound links; surface `new-build-vs-resale` from pillars and D pages (§12) | C | n/a | Two highest-leverage link fixes on the site | what-500k, new-build-vs-resale | n/a | None | See §12 | Cluster weakness | E | HIGH |
| 7 | EXPAND EXISTING PAGE | `las-vegas-home-prices-july-2026`: date-anchor the rate and $480K figures (Fact-Decay FACT-001/002) and add a clear "newer data" pointer to August | E | Current prices | Second GSC page (60 impr, pos 7.9). Decaying facts on the page Google tests most | July prices | **Yes** | LOW | → August (inline), will-prices-drop | GSC (GSC-2026-09-22-001), fact decay | E | HIGH |
| 8 | EXPAND EXISTING PAGE | Summerlin pillar: answer-first intro ("what you need to understand before choosing Summerlin"), sharpen the map section, add missing links | B | Deciding on Summerlin | BRIEF-2026-09-22-001; position ~58 | Summerlin pillar | **Is** the expansion | HIGH if a new Summerlin article is made (R3) | → 3-way, new-build-vs-resale, new-home sales, parade (in prose), first-summer | Search brief, GSC | E | MEDIUM |
| 9 | NEW ARTICLE | "HOA Fees in Las Vegas: What They Cover, Master vs Sub-HOA, and What to Check Before You Offer" | C | Budgeting true monthly cost | Core ownership cost with no page. Audience interest shown by Sandstone "no HOA" content | new-build-vs-resale, #5 | No | LOW | → new-build-vs-resale, #5, property tax, Sandstone. ← #5, pillars | Content gap, existing video (social) | E | MEDIUM |
| 10 | NEW ARTICLE | "Closing Costs When Buying a Home in Las Vegas" (buyer vs seller norms, Clark County transfer tax, escrow/title), every figure sourced | C | Cash-to-close planning | Durable, locally specific, high commercial intent. Pairs with DPA | DPA, property tax | No | LOW | → DPA, property tax, #9. ← DPA, #3 | Content gap | E | MEDIUM |
| 11 | NEW ARTICLE | "SIDs and LIDs in Las Vegas: The Assessment Some Buyers Don't See Coming" | C (sec. D) | Understanding a tax-bill line item | Very local, buyers rarely know to ask. Strengthens property-tax page and D | property tax, #5 | Could be a section of property-tax page. Separate intent, so new is fine | LOW | ↔ property tax, → #5, Summerlin pillar | Content gap | E | MEDIUM |
| 12 | MARKET UPDATE | LVR September 2026 report (expected ~Oct 7–9, unconfirmed) | E | Current prices | Recurring, proven E format that Google tests | August prices | **Decision needed** (R2): new monthly URL vs update | MEDIUM | ↔ August, → will-prices-drop, rates page | Market data | T | MEDIUM |
| 13 | MARKET UPDATE | New-home sales follow-up (next Home Builders Research release) | E (sec. D) | Is the new-build market slowing | Top GSC page (107 impr, pos 6.2) is the July installment | new-home sales July | Consider updating July page vs new month (same R2 logic) | MEDIUM | → #5, new-build-vs-resale, Sandstone | GSC, market data | T | MEDIUM |
| 14 | NEW ARTICLE | "Las Vegas, Henderson, North Las Vegas or Clark County? How the Valley's Cities Actually Work" | A (sec. B) | Orientation: where is what, who governs it | GSC long-tail ("is north las vegas its own city", "where is summerlin"). LVINIT already teaches this in pieces | #2, pillars | No (valley-wide; NLV-specific answers stay on #1) | LOW–MEDIUM | → all pillars, Wayne Newton, SW pillar. ← #2 | GSC, content gap | E | MEDIUM |
| 15 | NEW ARTICLE | "Cost of Living in Las Vegas (2026)": housing, utilities, taxes, insurance, strictly sourced | A | Can I afford to move | Promised by a homepage chip. Durable relocation demand | #2, property tax, DPA | No | MEDIUM (registry slug `cost-of-living-2026` already points at the property-tax page; pick a distinct slug) | → property tax, #16, starter homes, #3 | Content gap | E | MEDIUM |
| 16 | NEW ARTICLE | "Setting Up Utilities in Las Vegas": NV Energy, water by jurisdiction, trash, internet (+ daily demand charge **only if verified**) | A | Practical move-in tasks | Evergreen with a possible timely hook (weekly plan) | #2, #15 | No | LOW | → first-summer, #15, #14 | Content gap, local development (utility rate change) | E (T hook) | MEDIUM |
| 17 | NEW ARTICLE | "Where New Homes Are Being Built in Las Vegas": corridor map linking every D page | D (sec. B) | Scanning new-build options by area | Connects isolated D pages into a network | #5, Sandstone, Monument Hills | Could be a section of #5. Build #5 first, split later if long | MEDIUM (R9) | → all D pages, pillars | Cluster weakness | E | MEDIUM |
| 18 | EXPAND EXISTING PAGE | `will-las-vegas-home-prices-drop`: refresh with the latest LVR data and make it E's live explainer | E | Should I wait for prices to drop | E's only evergreen candidate. June-anchored today | Market cluster | **Yes** | LOW | ← all rate pages, price reports | Cluster weakness, fact decay | E | MEDIUM |
| 19 | EXPAND EXISTING PAGE | Summerlin vs. Henderson: differentiate (ownership cost, commute) and point to the 3-way | B | Two-suburb decision | Thinnest comparison. Overlaps the 3-way | S vs H | **Yes** | MEDIUM (R4) | → 3-way, both pillars | Cluster weakness | E | MEDIUM |
| 20 | NEW ARTICLE | "Buying a Home in Las Vegas From Out of State" | C (sec. A) | Remote relocation buyer | Clear lead intent. Bridges A and C | #2, #3, DPA | No | LOW | → #2, #3, #10, new-build-vs-resale | Content gap | E | MEDIUM |
| 21 | NEW ARTICLE | Mountain's Edge community guide (Southwest child) | B | Evaluating a specific master plan | Named in SW pillar but unlinked. Mikey drone photo already exists | SW pillar | No | LOW | ↔ SW pillar, H vs SW | Content gap | E | MEDIUM |
| 22 | NEW ARTICLE | Lake Las Vegas community guide (Henderson child) | B | Evaluating a specific community | Named in `PROJECT_STATE.md` as next Henderson child. Roster `href` ready | Henderson pillar | No | LOW | ↔ Henderson pillar | Content gap | E | MEDIUM |
| 23 | EXPAND EXISTING PAGE | Four Seasons Private Residences: replace temporary image, add confirmed status updates (**needs Mikey's material**) | D | Luxury buyer tracking the project | CLAUDE.md current priority. Thinnest page, 0 in-prose links | Four Seasons | **Yes** | LOW | ← Henderson pillar (in prose) | Cluster weakness | E | LOW (blocked on source material) |
| 24 | EXPAND EXISTING PAGE | DPA guide: resolve FACT-2026-09-17-001 (Home Is Possible for Teachers deadline) and add links from new C pages | C | Low-down-payment options | Durable page with a dated fact. GSC query "low money down mortgage" | DPA | **Yes** | LOW | ↔ #10, #3, property tax | Fact decay, GSC | E | MEDIUM |
| 25 | LOCAL DEVELOPMENT OPPORTUNITY | Jewel (Chinatown, 380 units, 10.54 acres, 2029 target): DEV-2026-09-23-001 | UNCLUSTERED → B if kept | What's being built near the Strip core | Weekly plan named it. Real supply news. But likely rental, and geography doesn't match the SW pillar Dev Watch mapped it to | (none cleanly) | Could be a paragraph on a pillar instead | LOW | → SW pillar or none | Local development | T | LOW |
| 26 | NEW ARTICLE | Green Valley Ranch community guide (Henderson child) | B | Evaluating a specific community | Named in `PROJECT_STATE.md` | Henderson pillar | No | LOW | ↔ Henderson pillar | Content gap | E | LOW–MEDIUM |
| 27 | NEW ARTICLE | Northwest Las Vegas area guide (Centennial Hills / Skye Canyon / Monument Hills area) | B | Evaluating the far northwest | Fixes Monument Hills' parent mismatch (R10). **Needs photography.** A new pillar-level guide may be a Mikey call | Monument Hills | No | LOW | ← Monument Hills, → Sandstone, NLV pillar | Cluster weakness | E | LOW |
| 28 | HOLD / DO NOT CREATE | A 4th mortgage-rate installment as a new URL | E | n/a | Covered by #4 | Rate thread | Yes (#4) | HIGH (R1) | n/a | Market data | T | HIGH |
| 29 | HOLD / DO NOT CREATE | PR #25 income-needed article (June data, open since 9/1) or any new affordability piece before it's resolved | E | n/a | Stale data, conflicting edits, overlaps R5 | starter homes, DPA, will-prices-drop | Mikey to close or refresh | MEDIUM (R5) | n/a | Other | T | HIGH |
| 30 | HOLD / DO NOT CREATE | Standalone pages for: Paradise Hills data-center cancellation (DEV-2026-09-24-002, no reader action), "Apex Industrial Park" (DEV-2026-09-24-004/09-25-001; the detected text describes a Switch data center in southwest Las Vegas, an **entity mismatch**), Beltway Trail (fold into #1) | n/a | n/a | Low buyer value or unreliable signal | NLV / Henderson pillars | Fold relevant facts into pillars | n/a | n/a | Local development | T | HIGH |

---

## 14. Do-not-prioritize list

Avoid these unless strong new evidence appears:

1. **Another dated mortgage-rate installment.** Update the live one (R1). A new
   URL is only justified by a genuinely different intent (e.g., a Fed policy
   explainer), not a new weekly print.
2. **New URLs that restate a pillar's intent:** "Moving to North Las Vegas",
   "Summerlin neighborhood guide", "Is Henderson a good place to live". Expand
   the pillar (R3).
3. **More comparisons of Summerlin, Henderson and Southwest in any pairing.**
   All three pairings and the 3-way exist (R4).
4. **Non-residential or civic development pieces with long, uncertain
   timelines** (casino-site concepts, civic buildings, data centers,
   industrial parks) unless they materially change housing supply, access or
   a community's day-to-day. Add a sourced line to the pillar's development
   section instead.
5. **Routine press releases** (single restaurant/venue openings, groundbreaking
   ceremonies without housing, rebrands).
6. **Celebrity/novelty real-estate stories** beyond the one already live
   (Casa de Shenandoah). Low durable buyer value.
7. **Income-restricted rental coverage as a series.** Gholson Landing was fine
   once. It isn't the buyer/relocation mission.
8. **Generic national real-estate explainers** ("what is escrow", "how
   mortgages work") without Las Vegas-specific mechanics, numbers or places.
9. **Affordability think-pieces** that overlap starter homes, DPA and
   will-prices-drop (R5), until PR #25 is resolved.
10. **Anything framed around schools rankings, safety or who lives somewhere**
    (Fair Housing). This includes the homepage "Schools & Family" chip topic,
    which needs a compliant framing decision from Mikey before any article.
11. **Tule Springs area articles** separate from the NLV pillar (R7).

---

## 15. Recommended next 10 Publisher runs

Mix: 7 cluster/search-intent runs, 3 timely/market runs (Runs 3, 6 and 9).
It's a target, not a quota. If a genuinely material story breaks, it can
displace a cluster run. A quiet news week should never produce a filler
timely piece.

| Run | Action | Topic | Cluster | New vs expansion | Why this order |
|---:|---|---|---|---|---|
| 1 | EXPAND EXISTING PAGE | North Las Vegas pillar (queue #1) | B | Expansion | Strongest live search signal, thinnest pillar, and every input agrees. Cheapest high-confidence win. Folds in the Beltway Trail news without a new URL |
| 2 | BUILD PILLAR (article) | Choose the Area Before the House (queue #2) | A | New page | Cluster A is empty and this is the homepage's featured video. Every later A article links up to it, so it must come first |
| 3 | EXPAND EXISTING PAGE | Mortgage rates: update `…-19-month-high` with 7.03% and later prints (queue #4) | E | Expansion | The week's timely item, done without creating a 4th URL. Early in the sequence because the news is current now |
| 4 | NEW ARTICLE | Rent First or Buy First (queue #3) | A | New page | Second orphaned video. Links immediately to Run 2 and to C pages, so A becomes a real cluster (3 pages) |
| 5 | BUILD PILLAR (article) | Buying New Construction in Las Vegas (queue #5) | D | New page | Gives D a core while the Sandstone tour is fresh. Makes the HOA and SID articles (Runs 8 and later) link into something |
| 6 | MARKET UPDATE | LVR September 2026 report (queue #12), **only once published** and after the R2 format decision. Include the July page's date-anchoring (queue #7) in the same pass | E | New page or expansion per R2 | Recurring E format Google already tests. Timed to the data, not the calendar. If LVR hasn't published, swap with Run 7 |
| 7 | EXPAND EXISTING PAGE | Summerlin pillar answer-first sharpening (queue #8) | B | Expansion | The brief is waiting on it. Also lands the missing pillar→comparison and pillar→new-build links |
| 8 | NEW ARTICLE | HOA Fees in Las Vegas (queue #9) | C | New page | First ownership-cost gap. Links into Run 5 and new-build-vs-resale |
| 9 | MARKET UPDATE | New-home sales follow-up (queue #13), if the next Home Builders Research release is out; otherwise the Jewel feature (queue #25) only if it verifies as material to buyers | E | Per R2 logic | Feeds the top GSC page's topic. Supports Run 5 |
| 10 | NEW ARTICLE | Closing Costs in Las Vegas (queue #10) | C | New page | Completes the core cost trio with HOA and property tax. Strong lead intent. Links to DPA and Run 4 |

**Running alongside, not a Publisher run:** queue #6 (the `what-500k` and
`new-build-vs-resale` link fixes) is Internal Linking Agent work. It can go
any week.

**Needs Mikey before or during these runs:** R1/R2 consolidation or hub
decisions, PR #25, the development-coverage strand question (§8), and the
homepage chip wiring (§12).

---

## 16. Missing data / unavailable inputs

| Input | Status | What was used |
|---|---|---|
| **GSC Opportunity Agent** | **Available.** Latest local run 2026-09-22 (`reports/gsc/run-35764839566/`), window 2026-08-23 → 2026-09-19 | 3 opportunities + raw query/page rows. **Very low volume:** 60 query impressions, 0 clicks in 28 days (below the agent's 200-impression line). Every GSC-sourced item here is an early signal only. GitHub Actions artifacts were **not** downloaded (`gh run download` not attempted), so a newer artifact may exist |
| **Content Brief Generator** | **Available.** 2026-09-22 local run | 1 low-confidence update brief (BRIEF-2026-09-22-001, Summerlin) + 1 rejected intent (NLV communities → existing pillar). First scheduled Actions run is Tue 2026-09-29; not yet available |
| **Development Watch** | **Available.** Daily reports through 2026-09-28 on `origin/lvinit-agent-state` | Weekly 2026-09-28: 5 meaningful changes, 24 monitor. Handoff queue empty (dry-run). Signals cited: DEV-2026-09-23-001, DEV-2026-09-24-002/003/004, DEV-2026-09-25-001. `local-development-signals.json` on the state branch contains 0 signals |
| **Weekly Publisher plan** | **Available.** 2026-09-28 (backfilled Monday) | Website section: Jewel article, rate update, July-prices fix, NLV update, link approvals |
| **Internal Linking Agent** | **Partly available.** Local 2026-09-22 report read. The 2026-09-23 run referenced by the weekly plan is **not** in the local repo | Orphans, weak links, LINK-2026-09-22-001/002/003. Link counts in this document were recomputed from current source, so they reflect links added after 09-22 |
| **Fact-Decay Agent** | **Partly available.** Local 2026-09-17 report read. The 2026-09-24 run (40 findings, cited by the weekly plan) is **not** in the local repo | FACT-2026-09-17-001 (DPA). FACT-001/002 (July prices) and FACT-003/005 (Sept rates) are cited via the weekly plan only |
| **Site Quality Agent** | **Available (local only).** 2026-09-23. Agent code is uncommitted and has never run in GitHub | Not material to editorial priority. QA-003 (NLV Article schema) noted via the weekly plan |
| **Executive Producer** | **Sample only** (2026-09-21). The 2026-09-27 run failed (MODULE_NOT_FOUND, per the weekly plan) | Not used beyond the weekly plan |
| **Local Trend Agent (social trends)** | **Present on state branch, not read in detail.** Runs rules-only (no API key), per the weekly plan | Not used. Social trends aren't search demand |
| **YouTube analytics / video performance** | **Unavailable.** No data in repo | Only the existence of videos (from `lib/content.ts`, page embeds and the weekly plan) was used |
| **Conversion / lead data** | **Unavailable.** Conversion Reporting Agent not built | Commercial intent judged editorially, not measured |
| **Query-level GSC per page** (e.g., which queries drive NLV's 59 page impressions) | **Unavailable.** Page and query dimensions don't join (anonymized queries) | Pillar-expansion items rely on page momentum + the visible query rows |
| **External market data** (LVR September, HBR release timing, PMMS after 9/24) | **Not researched.** Out of scope for an analysis-only run | Dates marked "unconfirmed" and must be verified at run time |

---

## 17. Strategic observations

1. **LVINIT's best pages come from Mikey's videos, and the backlog is already
   filmed.** The evergreen video companions (new-build-vs-resale, 3-way,
   what-500k) are the deepest, most-linked, most on-brand pages. Two homepage
   videos and the Sandstone tour still have no evergreen article built around
   them. That's the cheapest route to 70% evergreen that is also "from the
   inside".
2. **Scheduled runs have been defaulting to news.** 11 of the last 14 articles
   were timely. The content-map-first rule (§1a.2) exists to fix exactly this,
   and this document is meant to give it a concrete queue so "no fresh story
   cleared the bar" leads to a cluster article, not a scramble.
3. **Google is testing LVINIT's data pages, not its pillars.** Market Watch and
   buyer pages sit at positions 6–8. Pillars sit at 50–60. That argues for
   (a) keeping the data pages fresh in place rather than spawning new dated
   URLs, and (b) answer-first sharpening on the pillars (the NLV and Summerlin
   expansions).
4. **Dated series are an authority leak.** Rates (3 URLs) and prices (2 URLs,
   more coming) will keep splitting the same head intent every month. An
   evergreen "Las Vegas mortgage rates" page and an evergreen "Las Vegas
   housing market" page, updated in place with dated sections, would
   concentrate that authority. **That's a hub/route decision for Mikey**, not
   something the Publisher can do on its own. This document recommends
   deciding before the September LVR report lands.
5. **Cluster D is the biggest commercial opportunity and the weakest
   structure.** New construction is where buyers most need an advocate (model
   homes, builder lenders, incentives), where Mikey has the freshest footage,
   and where GSC impressions already cluster. The D core article (queue #5)
   should be treated as a flagship piece.
6. **Geography hygiene matters for trust.** LVINIT is already good at
   explaining the valley (Enterprise/Spring Valley, Paradise, NLV vs City of
   Las Vegas). The Monument Hills parent mismatch and Dev Watch mapping
   Chinatown's Jewel to the Southwest pillar are small signs that a
   valley-cities explainer (queue #14) and eventually a Northwest guide would
   help both readers and the agents.
7. **Input agents are thin, but they agree.** GSC, the Brief Generator, the
   Internal Linking Agent and the weekly plan all independently point to
   expanding the NLV and Summerlin pillars and fixing the same weak links. When
   data volume is this low, that agreement is the strongest evidence
   available.
8. **Housekeeping for Mikey (not Publisher scope):** PR #25 (open 4 weeks);
   PR #12 (docs housekeeping, open since 2026-08-24); the `cost-of-living-2026`
   registry slug pointing at the property-tax article; NLV pillar missing
   `datePublished`; homepage Moving-to-Las-Vegas chips linking to `#guides`;
   the "Schools & Family" chip needing a Fair-Housing-safe framing decision.
