import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// HOMEOWNER GUIDE — Clark County's short-term rental (STR) ordinance adopted
// November 3, 2026 (Ordinance No. 5427) and the January 2027 reopening of STR
// license applications in UNINCORPORATED Clark County.
//
// FACT DISCIPLINE (read before editing). Every rule, date and number below was
// checked against primary records during the November 10, 2026 build pass:
//
// - Legistar file 26-2339 (Matter 111367), BCC agenda item #31, Nov. 3, 2026.
//   History: "Approved (Ordinance 5427; Effective 11/18/2026)." Read via the
//   Legistar web API (webapi.legistar.com/v1/clark/matters/111367).
//   The signed ordinance itself was not yet posted. The adopted text was taken
//   from the two attachments: "Bill 10-20-26-1" (scanned bill, 27 pp.) as
//   amended by "#31 changes to ord" (3 pp. hearing changes to §7.100.110 and
//   §21). NOTE: the county's separate "ordintro-str-amendments-20261020.pdf"
//   is an EARLIER draft (it still requires a notarized signature and lacks the
//   pending-application section). Don't cite it for final text.
// - From the bill + hearing changes: lottery repealed (old §7.100.100(a)-(g));
//   §7.100.110 (a) any order, except (b) complete applications within 1,000 ft
//   of each other decided in order received; (c) decided within 45 BUSINESS
//   days of receipt of a complete application, tolled while info is requested,
//   during any inspection, and until earlier-received applications within
//   1,000 ft are final; (d)(2) denial possible if no response / no inspection
//   scheduled within 14 CALENDAR days; (e) hearing under §6.04.090(j);
//   (f) annual fee + $150 nonrefundable inspection fee before issuance;
//   (g) "final determination" includes the appeal period. §7.100.090: $45
//   nonrefundable application fee; notarization removed; insurance proof
//   removed from the application (insurance still required before operating,
//   §7.100.170(c)). §7.100.080: sewer, rural townships, mobile homes,
//   apartments, HOA authorization retained; 36-month code-violation bar
//   (old (h)) deleted; 1,000 ft / 2,500 ft moved into Title 30 §30.03.06(E)(6)
//   ("shall not be waived or varied"), measured radially property line to
//   property line; condo-style units mapped for individual ownership in a
//   multifamily dwelling exempt from the 1,000 ft rule. Ordinance §21 (as
//   amended at the hearing): pre-existing complete applications use the old
//   eligibility standards, the new procedures, clocks starting no earlier than
//   the effective date, and the old drawing order, ahead of new applications.
// - Unchanged sections read on Municode (Ch. 7.100) on Nov. 10, 2026:
//   §7.100.060 (eligible owners: natural persons 18+, entities/trusts only if
//   every member etc. is a disclosed natural person 18+), §7.100.070 (one STR
//   license / interest per owner in unincorporated county; 7-year bars for
//   revoked licenses etc.), §7.100.120 (annual fee $750 for 3 or fewer
//   bedrooms, $1,500 for more).
// - County staff presentation, Nov. 3, 2026 ("#31 STR_Hearing_SHORT_
//   Presentation"): process-not-policy framing; what doesn't change; Dec. 1 /
//   Dec. 15 / Jan. 5, 2027 8:00 a.m. dates; 168 appointments per week, three
//   technicians, Mon-Thu 8 a.m.-4 p.m., in person only; fire inspection goal of
//   14 days on average; 30 calendar days to appeal under Title 6, 14 only if a
//   separate ordinance passes; pending applications to appear on the public map.
// - Appeal deadline (news reports said 14 and 30): RESOLVED. Today it is 30
//   calendar days (§6.04.090(j), per the county presentation). Bill 11-3-26-1
//   (Legistar 26-2376 / 26-2424) would cut Business License appeals to 14
//   calendar days; introduced Nov. 3, public hearing Nov. 17, 2026. NOT law as
//   of publication. Update this page after Nov. 17.
// - Ninth Circuit memorandum, No. 26-278, filed Oct. 7, 2026 (read in full).
//   District court docket 2:25-cv-01173-MMD-BNW (CourtListener RECAP, read
//   Nov. 10): ECF 51, Dec. 17, 2025 order enjoining §§ 7.100.030,
//   7.100.230(d)(1)(I), 7.100.220, 7.100.250 and 1.14.020(g) pending a final
//   decision (read in full). Mandate issued and "Order on Mandate" entered
//   Nov. 3, 2026; a minute order set a motion hearing Oct. 23. The text of
//   those entries was NOT available, so the article says only that the
//   narrowing is pending and LVINIT hadn't confirmed a narrowed order.
// - Backlog numbers are attributed: 830 complete applications, 242 approved,
//   47 pending (Deputy DA Jeff Rogan to commissioners, via FOX5 and KTNV).
//   The county's slide counted 241 licensed rentals; we don't print a live
//   count of our own.
// - GIS map: layer list and legend read from the ArcGIS web map behind the
//   county's "Short-Term Rental License Informational Map". County approved-
//   license parcels draw dark green; their 1,000-ft buffers draw semi-
//   transparent green. City of Las Vegas and Henderson STR buffers, resort-
//   hotel 2,500-ft buffers, septic property type and rural-township layers
//   are also on the map. Quoted disclaimer wording is the county's.
// - Ordinance 5407 (Ch. 7.110, effective Sept. 2, 2026), platform payment
//   verification: title read on Legistar (26-2045). Mentioned only as a fact.
// - Deliberately NOT stated: state business license cost, insurance pricing,
//   final county application checklist (forms not published until Dec. 1),
//   City of Las Vegas / Henderson / North Las Vegas rules, how many licenses
//   remain under the 1% cap, any legal conclusion about what the narrowed
//   injunction will say.
//
// HERO: LVINIT Media Image Library still, Mikey's own drone footage
// ("Rent vs Buy" video, 00:01:12, footage 2026-08-17). Library location is
// null, so the alt text names no place. Never used before (no usedOn, no
// usage, no repo references) => hero-eligible. Record `usage` in
// data/image-library/lvinit-image-library.json ONLY after this page is live.
// Graphics below (timeline, 1,000-ft diagram, process comparison, checklist)
// are LVINIT-built HTML/SVG, not copies of county artwork. The diagram is
// labeled illustrative.
// ---------------------------------------------------------------------------

const PATH = "/guides/clark-county-short-term-rental-license-2027";
const HERO_IMAGE =
  "/images/editorial/las-vegas-valley-residential-neighborhood-aerial-mountain-backdrop.jpg";
const HERO_ALT =
  "Aerial view of tile-roofed single-family homes and townhomes on curving streets in the Las Vegas Valley, with mountains on the horizon at golden hour.";
const HEADLINE =
  "Clark County STR Applications Reopen January 2027: New Rules, Dates & Who Qualifies";

const meta: StoryMeta = {
  title: "Clark County Short-Term Rental License 2027: Dates, Rules & Who Qualifies | LVINIT",
  headline: HEADLINE,
  description:
    "Clark County's new STR ordinance ends the lottery, and license appointments start Jan. 5, 2027. Key dates, fees, the 1,000-foot rule, and who can actually qualify.",
  path: PATH,
  image: HERO_IMAGE,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-10",
  dateModified: "2026-11-10",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: HEADLINE, path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// --- Sources ---------------------------------------------------------------
const SRC = {
  legistar: "https://clark.legistar.com/LegislationDetail.aspx?ID=8301706",
  bill: "https://clark.legistar1.com/clark/attachments/4999892a-ee5f-4b61-904b-ba2ef7174eba.pdf",
  changes: "https://clark.legistar1.com/clark/attachments/89dbbe6f-e16b-42e3-add7-698a631305af.pdf",
  presentation:
    "https://clark.legistar1.com/clark/attachments/031d0136-f78e-4817-8493-61be861faa8f.pdf",
  appealBill:
    "https://clark.legistar1.com/clark/attachments/c7cbf8a5-2eb5-4e3a-a126-1b547938ab3b.pdf",
  countyStr:
    "https://www.clarkcountynv.gov/business/doing_business_with_clark_county/divisions/regulated_business/short_term_rentals/",
  map: "https://ccgismo.maps.arcgis.com/apps/webappviewer/index.html?id=8aef3548c506431d8ad2820c99b5c0f5",
  code: "https://library.municode.com/nv/clark_county/codes/code_of_ordinances?nodeId=TIT7BURE_CH7.100SHRMREUN",
  ninth: "https://cdn.ca9.uscourts.gov/datastore/memoranda/2026/10/07/26-278.pdf",
  docket:
    "https://www.courtlistener.com/docket/70678838/greater-las-vegas-short-term-rental-association-v-clark-county/",
  duOrder:
    "https://storage.courtlistener.com/recap/gov.uscourts.nvd.175530/gov.uscourts.nvd.175530.51.0.pdf",
  fox5: "https://www.fox5vegas.com/2026/11/04/clark-county-approves-proposal-speed-up-short-term-rental-licenses/",
  ktnv: "https://www.ktnv.com/news/clark-county-eyes-2027-opening-of-short-term-rental-licensing-after-approving-new-rules-for-hosts",
  sun: "https://lasvegassun.com/news/2026/nov/03/clark-county-speeds-up-short-term-rental-licensing/",
  rj: "https://www.reviewjournal.com/business/clark-county-approves-new-short-term-rental-licensing-process-3910323/",
  glvstra: "https://www.glvstra.org/",
};

// --- FAQ (rendered below and mirrored word for word in FAQPage JSON-LD) ------
const FAQS: { q: string; a: string }[] = [
  {
    q: "When can I apply for a Clark County Airbnb license?",
    a: "Revised applications are scheduled to be available December 1, 2026. Appointment scheduling opens December 15, 2026, and the first in-person intake appointments start January 5, 2027 at 8 a.m. Applications are accepted in person, by appointment only. There's no online application.",
  },
  {
    q: "Can anyone apply in January 2027?",
    a: "Anyone who owns a property can book an appointment and submit an application, but only eligible properties and owners can be licensed. The property has to be in unincorporated Clark County, in an allowed zoning district and property type, on sewer, at least 1,000 feet from an existing short-term rental and 2,500 feet from a resort hotel, and allowed by any HOA's governing documents. The owner also can't hold another STR license in unincorporated Clark County.",
  },
  {
    q: "Is the Clark County STR lottery gone?",
    a: "Yes. Ordinance No. 5427 repealed the random-number drawing. Applications are now accepted on a continuing basis. When two or more complete applications are within 1,000 feet of each other, they're decided in the order the county received them. Applications still pending from 2023 keep their old drawing order and go ahead of new ones.",
  },
  {
    q: "How do I check the 1,000-foot restriction?",
    a: "Search your address or parcel number on Clark County's Short-Term Rental License Informational Map. County-approved licenses show as dark green parcels with a lighter green 1,000-foot buffer around them. If your parcel sits inside one of those buffers, it likely can't qualify. The map is informational only. It doesn't guarantee approval or denial, so ask the county in writing about borderline properties.",
  },
  {
    q: "Can I apply if another Airbnb is nearby?",
    a: "It depends on whether the nearby rental is licensed or has an earlier pending application. Under the ordinance, an STR can't be within 1,000 feet of another short-term rental use, measured from property line to property line. An unlicensed listing down the street isn't a licensed STR. A licensed one within 1,000 feet, or an earlier application nearby that gets approved, would rule your property out.",
  },
  {
    q: "Can an LLC apply for a Clark County short-term rental license?",
    a: "Yes, if it's the owner of record. County code lets a business entity or trust hold a license only if every member, manager, officer, trustee and beneficiary, as applicable, is a natural person 18 or older and all of them are disclosed on the application. The one-STR-per-owner limit applies to those people too.",
  },
  {
    q: "Can previously fined homeowners apply?",
    a: "Generally, yes. A past fine doesn't by itself bar an application. Ordinance No. 5427 deleted the rule that made a property ineligible for multiple unresolved code violations in the previous 36 months. Other bars remain, though. One example is a short-term rental license revoked, suspended or not renewed in the past seven years. Renewing a license also requires paying fines owed under the code.",
  },
  {
    q: "Are unlicensed Airbnb properties currently protected?",
    a: "For now, partly, and it's temporary. Judge Miranda Du's December 17, 2025 preliminary injunction blocks the county from enforcing the license requirement and related fines and liens while the lawsuit continues. On October 7, 2026 the Ninth Circuit called that injunction too broad and sent it back to be narrowed. It suggested protection could be limited to people with a pending application. As of November 10, 2026, LVINIT had not seen a narrowed order.",
  },
  {
    q: "Does the new ordinance apply in Henderson or the City of Las Vegas?",
    a: "No. Ordinance No. 5427 covers only unincorporated Clark County, such as Spring Valley, Enterprise, Paradise and Winchester. The City of Las Vegas, Henderson, North Las Vegas, Boulder City and Mesquite set their own rules. A Las Vegas mailing address doesn't tell you which one governs your property.",
  },
  {
    q: "How long does Clark County STR approval take?",
    a: "The ordinance requires a decision within 45 business days of a complete application. The clock pauses while the county waits on you for information, during the fire inspection, and while an earlier application within 1,000 feet is decided, including its appeal period. Inside a cluster of nearby applications, it can take much longer than 45 business days.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// --- Small building blocks -------------------------------------------------
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={linkCls} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function In({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={linkCls}>
      {children}
    </Link>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
      <span>{children}</span>
    </li>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 text-subhead font-semibold text-lvinit-black">{children}</h3>;
}

function P({ children, first = false }: { children: React.ReactNode; first?: boolean }) {
  return <p className={`text-body-lg text-lvinit-warmgray ${first ? "" : "mt-5"}`}>{children}</p>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-lg border-l-4 border-lvinit-blue bg-lvinit-blue/5 px-5 py-4 text-body text-lvinit-black">
      {children}
    </div>
  );
}

// --- Visual 1: key dates timeline -----------------------------------------
const TIMELINE: { date: string; title: string; body: string; key?: boolean; pending?: boolean }[] = [
  {
    date: "Nov. 3, 2026",
    title: "Commission adopts Ordinance No. 5427",
    body: "The county ends the lottery and sets up a rolling, appointment-based process.",
  },
  {
    date: "Nov. 17, 2026",
    title: "Hearing on the 14-day appeal ordinance",
    body: "A separate proposal would cut appeal time from 30 to 14 calendar days. It isn't law unless adopted.",
    pending: true,
  },
  {
    date: "Nov. 18, 2026",
    title: "Ordinance No. 5427 takes effect",
    body: "The new rules apply from here, but the county isn't taking applications yet.",
  },
  {
    date: "Dec. 1, 2026",
    title: "Revised applications available",
    body: "Download the new form and start gathering documents.",
  },
  {
    date: "Dec. 15, 2026",
    title: "Appointment scheduling opens",
    body: "Book an in-person intake appointment with Business License. First come, first served.",
    key: true,
  },
  {
    date: "Jan. 5, 2027 · 8 a.m.",
    title: "First intake appointments",
    body: "Complete applications are received in person and processing begins. Not January 1.",
    key: true,
  },
];

function Timeline() {
  return (
    <figure
      id="key-dates"
      aria-labelledby="key-dates-title"
      className="mt-8 scroll-mt-24 rounded-lg border border-lvinit-lightgray bg-lvinit-white p-5 sm:p-8"
    >
      <p id="key-dates-title" className="text-caption uppercase tracking-wide text-lvinit-blue">
        Clark County STR licensing: 2026–2027 timeline
      </p>
      <ol className="mt-6 space-y-0">
        {TIMELINE.map((t, i) => (
          <li key={t.date} className="relative flex gap-4 pb-7 last:pb-0">
            {i < TIMELINE.length - 1 && (
              <span aria-hidden="true" className="absolute left-[9px] top-6 h-full w-px bg-lvinit-lightgray" />
            )}
            <span
              aria-hidden="true"
              className={`relative mt-1.5 h-[19px] w-[19px] shrink-0 rounded-full border-2 ${
                t.key
                  ? "border-lvinit-blue bg-lvinit-blue"
                  : t.pending
                    ? "border-dashed border-lvinit-warmgray bg-lvinit-white"
                    : "border-lvinit-blue bg-lvinit-white"
              }`}
            />
            <div>
              <p className={`text-caption uppercase tracking-wide ${t.key ? "text-lvinit-blue" : "text-lvinit-warmgray"}`}>
                {t.date}
                {t.pending ? " · proposed" : ""}
              </p>
              <p className="mt-1 text-body font-semibold text-lvinit-black">{t.title}</p>
              <p className="mt-1 text-body text-lvinit-warmgray">{t.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="mt-6 border-t border-lvinit-lightgray pt-4 text-caption text-lvinit-warmgray">
        Dates from Clark County&rsquo;s November 3, 2026 staff presentation and Legistar records.
        Appointments: Monday–Thursday, 8 a.m.–4 p.m., in person only. The county may adjust its
        schedule, so confirm on its STR page before you plan around a date.
      </figcaption>
    </figure>
  );
}

// --- Visual 2: illustrative 1,000-foot diagram ----------------------------
function BufferDiagram() {
  // Scale: 1,000 ft = 120 px. Purely illustrative; not a map of any real place.
  return (
    <figure className="mt-8 rounded-lg border border-lvinit-lightgray bg-lvinit-white p-4 sm:p-6">
      <p className="text-caption uppercase tracking-wide text-lvinit-blue">
        Illustration only · not an official eligibility map
      </p>
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-labelledby="buffer-title buffer-desc"
        className="mt-4 h-auto w-full"
      >
        <title id="buffer-title">How the 1,000-foot separation works</title>
        <desc id="buffer-desc">
          A simplified grid of home lots. One licensed short-term rental sits at the center of a
          circle representing 1,000 feet from its property line. Home A sits inside the circle and
          likely can&rsquo;t qualify. Home B sits outside the circle and may be able to qualify if it
          meets every other rule.
        </desc>
        <rect x="0" y="0" width="640" height="360" fill="#FFFFFF" />
        {/* street grid */}
        {[60, 140, 220, 300].map((y) => (
          <rect key={`h${y}`} x="0" y={y} width="640" height="10" fill="#E8E6E1" />
        ))}
        {[100, 220, 340, 460, 580].map((x) => (
          <rect key={`v${x}`} x={x} y="0" width="10" height="360" fill="#E8E6E1" />
        ))}
        {/* lots */}
        {Array.from({ length: 4 }).flatMap((_, r) =>
          Array.from({ length: 6 }).map((__, c) => {
            const bx = c * 120 - 10;
            const by = r * 80 - 10;
            return [0, 1, 2].map((k) => (
              <rect
                key={`l${r}-${c}-${k}`}
                x={bx + 22 + k * 32}
                y={by + 22}
                width="26"
                height="34"
                rx="2"
                fill="none"
                stroke="#6E6A63"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
            ));
          })
        )}
        {/* buffer: licensed STR at center (lot centered near x=286,y=189) */}
        <circle cx="286" cy="185" r="137" fill="#2B6CB0" fillOpacity="0.12" stroke="#2B6CB0" strokeWidth="2" strokeDasharray="6 5" />
        <rect x="273" y="168" width="26" height="34" rx="2" fill="#2B6CB0" />
        <text x="286" y="232" textAnchor="middle" fontSize="22" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fill="#111111">
          Licensed STR
        </text>
        {/* 1,000 ft radius line */}
        <line x1="299" y1="185" x2="423" y2="185" stroke="#2B6CB0" strokeWidth="2" />
        <text x="361" y="174" textAnchor="middle" fontSize="22" fontFamily="Inter, system-ui, sans-serif" fill="#2B6CB0" fontWeight="600">
          1,000 ft
        </text>
        {/* Home A inside */}
        <rect x="177" y="248" width="26" height="34" rx="2" fill="#C8A46A" />
        <text x="190" y="308" textAnchor="middle" fontSize="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fill="#111111">A</text>
        {/* Home B outside */}
        <rect x="529" y="88" width="26" height="34" rx="2" fill="#111111" />
        <text x="542" y="148" textAnchor="middle" fontSize="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fill="#111111">B</text>
      </svg>
      <ul className="mt-5 space-y-2 text-body text-lvinit-warmgray">
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 rounded-sm bg-lvinit-blue" />
          <span><span className="font-semibold text-lvinit-black">Licensed STR.</span> The dashed circle stands for 1,000 feet measured from its property line in every direction.</span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 rounded-sm bg-lvinit-gold" />
          <span><span className="font-semibold text-lvinit-black">Home A</span> is inside the buffer, so it likely can&rsquo;t be licensed while that STR is licensed, even though applications are reopening.</span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 rounded-sm bg-lvinit-black" />
          <span><span className="font-semibold text-lvinit-black">Home B</span> is outside it, which is only one test passed. It still has to meet every other rule.</span>
        </li>
      </ul>
      <figcaption className="mt-4 border-t border-lvinit-lightgray pt-4 text-caption text-lvinit-warmgray">
        LVINIT illustration of Clark County Code &sect;30.03.06(E)(6) as adopted by Ordinance No.
        5427. Simplified and not to survey scale. The county measures from the nearest property line
        of each parcel, so a real buffer follows the lot&rsquo;s shape, not a perfect circle around
        the house. Check your actual parcel on the county&rsquo;s map.
      </figcaption>
    </figure>
  );
}

// --- Visual 3: old vs new process -----------------------------------------
const PROCESS: { topic: string; before: string; now: string }[] = [
  {
    topic: "When you can apply",
    before: "One online window that closed Aug. 21, 2023",
    now: "On a continuing basis, starting with appointments Jan. 5, 2027",
  },
  {
    topic: "How you apply",
    before: "Online, through the county's licensing system",
    now: "In person at a scheduled appointment. No online applications.",
  },
  {
    topic: "Order of review",
    before: "Random-number drawing (the “lottery”)",
    now: "Any order, except applications within 1,000 ft of each other, which go in the order received",
  },
  {
    topic: "Decision deadline",
    before: "None",
    now: "45 business days from a complete application, with pauses",
  },
  {
    topic: "Your response time",
    before: "No set deadline",
    now: "14 calendar days to answer a request or schedule the inspection, or the application may be denied",
  },
  {
    topic: "Fees",
    before: "Paid before approval, which could hold up the line",
    now: "$45 at application. The license fee and $150 inspection fee come after approval, before the license issues.",
  },
  {
    topic: "Paperwork",
    before: "Notarized signature and proof of insurance at application",
    now: "No notary, and insurance proof is due before you operate, not at application",
  },
  {
    topic: "Appeal deadline",
    before: "30 calendar days",
    now: "Still 30 calendar days. A 14-day proposal is up for hearing Nov. 17, 2026.",
  },
];

function ProcessComparison() {
  return (
    <figure className="mt-8">
      <p className="text-caption uppercase tracking-wide text-lvinit-blue">
        Old process vs. Ordinance No. 5427
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-lvinit-lightgray">
        <div className="hidden grid-cols-[180px_1fr_1fr] bg-lvinit-lightgray/60 px-5 py-3 text-caption uppercase tracking-wide text-lvinit-warmgray sm:grid">
          <span>&nbsp;</span>
          <span>2022–2023 process</span>
          <span className="text-lvinit-blue">New process</span>
        </div>
        {PROCESS.map((r, i) => (
          <div
            key={r.topic}
            className={`grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[180px_1fr_1fr] sm:gap-6 ${
              i % 2 ? "bg-lvinit-white" : "bg-lvinit-lightgray/25"
            }`}
          >
            <p className="text-body font-semibold text-lvinit-black">{r.topic}</p>
            <p className="text-body text-lvinit-warmgray">
              <span className="text-caption uppercase tracking-wide sm:hidden">Before: </span>
              {r.before}
            </p>
            <p className="text-body text-lvinit-black">
              <span className="text-caption uppercase tracking-wide text-lvinit-blue sm:hidden">Now: </span>
              {r.now}
            </p>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-caption text-lvinit-warmgray">
        Source: Ordinance No. 5427 (Bill 10-20-26-1 as amended Nov. 3, 2026) and the county&rsquo;s
        Nov. 3 staff presentation.
      </figcaption>
    </figure>
  );
}

// --- Visual 4: what doesn't change ----------------------------------------
const STAYS: { rule: string; status: string }[] = [
  { rule: "1,000 feet from any other short-term rental", status: "Kept. Moved into the zoning code, and it can't be waived or varied." },
  { rule: "2,500 feet from a resort hotel", status: "Kept, and it can't be waived or varied" },
  { rule: "Countywide cap of 1% of housing units", status: "Kept" },
  { rule: "Must be on municipal sewer (no septic)", status: "Kept" },
  { rule: "No STRs in Mt. Charleston, Moapa, Moapa Valley, Mesquite or Bunkerville townships", status: "Kept" },
  { rule: "HOA/common-interest community must expressly allow transient rentals", status: "Kept" },
  { rule: "One STR per owner in unincorporated Clark County", status: "Kept (not amended)" },
  { rule: "Occupancy: lesser of 2 per bedroom or 10 total; 2-night minimum; no parties", status: "Kept" },
  { rule: "Fire inspection, safety equipment, local rep within 30 minutes, cameras, noise monitors", status: "Kept" },
  { rule: "Unlicensed operation fines of $1,000–$10,000 per day", status: "Still in the code, but currently blocked by the court injunction (see below)" },
  { rule: "Multiple unresolved code violations in the past 36 months make a property ineligible", status: "Removed" },
  { rule: "Random lottery and fixed application windows", status: "Removed" },
];

function StaysTable() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-white">
      <table className="w-full text-left text-body">
        <caption className="sr-only">Rules kept and removed by Ordinance No. 5427</caption>
        <thead>
          <tr className="border-b border-lvinit-lightgray">
            <th scope="col" className="px-5 py-3 text-caption font-normal uppercase tracking-wide text-lvinit-warmgray">Rule</th>
            <th scope="col" className="px-5 py-3 text-caption font-normal uppercase tracking-wide text-lvinit-warmgray">After Nov. 18, 2026</th>
          </tr>
        </thead>
        <tbody>
          {STAYS.map((s) => (
            <tr key={s.rule} className="border-b border-lvinit-lightgray align-top last:border-0">
              <td className="px-5 py-3 text-lvinit-black">{s.rule}</td>
              <td
                className={`px-5 py-3 ${
                  s.status.startsWith("Removed") ? "font-semibold text-lvinit-blue" : "text-lvinit-warmgray"
                }`}
              >
                {s.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Visual 5: preparation checklist --------------------------------------
const PREP: { title: string; body: React.ReactNode }[] = [
  {
    title: "Confirm who governs your property",
    body: (
      <>
        Look up your parcel with the Clark County Assessor or on the county&rsquo;s STR map, which shows
        city boundaries. This ordinance only matters if the property is in unincorporated Clark County.
      </>
    ),
  },
  {
    title: "Screen the parcel on the county STR map",
    body: (
      <>
        Check for green 1,000-foot buffers, resort-hotel buffers, the septic layer and rural-township
        shading. The map&rsquo;s own instructions ask applicants to save the Parcel Search result as a
        PDF or screenshot for their application documents.
      </>
    ),
  },
  {
    title: "Pull your ownership records",
    body: (
      <>
        Confirm the owner of record matches who will apply. For an LLC or trust, list every member,
        manager, officer, trustee and beneficiary. All of them must be natural persons 18 or older.
      </>
    ),
  },
  {
    title: "Check the bedroom count on file",
    body: (
      <>
        Occupancy and the annual fee are based on the Assessor&rsquo;s bedroom count. A casita or
        other accessory living quarters counts as a bedroom.
      </>
    ),
  },
  {
    title: "Get your HOA documents",
    body: (
      <>
        If you&rsquo;re in an HOA, find the CC&amp;Rs or governing documents. They have to{" "}
        <em>expressly</em> allow transient rentals. Staying silent on it isn&rsquo;t enough.
      </>
    ),
  },
  {
    title: "Find a recent sewer bill",
    body: <>The code requires a copy of your most recent sewer bill. Septic properties aren&rsquo;t eligible.</>,
  },
  {
    title: "Line up a Nevada state business license",
    body: <>The code requires a copy of the applicant&rsquo;s state business license.</>,
  },
  {
    title: "Name your local representative",
    body: (
      <>
        Pick someone who can respond to the property within 30 minutes whenever it&rsquo;s rented, plus
        a 24-hour complaint line. Have property manager contact details too, if you use one.
      </>
    ),
  },
  {
    title: "Prepare for the fire inspection",
    body: (
      <>
        Fire extinguishers on every floor, interconnected smoke alarms in and outside sleeping rooms,
        CO detectors on each floor, posted evacuation plans, and no obstructed exits (including
        window security bars). You&rsquo;ll have 14 days to schedule once asked.
      </>
    ),
  },
  {
    title: "Get an insurance quote",
    body: (
      <>
        Before operating, licensees need general liability coverage of at least $500,000 per
        occurrence. The certificate must show the home is used for transient lodging.
      </>
    ),
  },
  {
    title: "Download the revised application Dec. 1, book Dec. 15",
    body: (
      <>
        Use the county&rsquo;s actual form once it&rsquo;s posted. It may ask for more than the
        minimums listed here.
      </>
    ),
  },
];

function PrepChecklist() {
  return (
    <ol className="mt-6 space-y-4">
      {PREP.map((item, i) => (
        <li key={item.title} className="flex gap-4 rounded-lg border border-lvinit-lightgray bg-lvinit-white p-4 sm:p-5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-lvinit-blue text-caption font-semibold text-lvinit-blue"
          >
            {i + 1}
          </span>
          <div>
            <p className="text-body font-semibold text-lvinit-black">{item.title}</p>
            <p className="mt-1 text-body text-lvinit-warmgray">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// --- Visual 6: the application path ----------------------------------------
const STEPS: { n: string; title: string; body: string }[] = [
  { n: "1", title: "Screen the property", body: "Check jurisdiction, zoning, sewer, HOA rules and the 1,000-ft and 2,500-ft buffers before you book." },
  { n: "2", title: "Intake appointment", body: "Bring a complete application and the $45 fee. Staff check completeness and review the map with you. Your place in line is time-stamped here." },
  { n: "3", title: "Eligibility check", body: "County GIS and Business License confirm location, distance and owner eligibility. If you're ineligible, you get a written denial." },
  { n: "4", title: "Fire inspection", body: "Schedule within 14 days of the county's request. The county's stated goal is a pass/fail result within 14 days on average." },
  { n: "5", title: "Approval or denial", body: "A written decision within 45 business days, not counting pauses. Any denial comes with the reasons and the right to a hearing." },
  { n: "6", title: "Pay and get licensed", body: "Pay the annual license fee and the $150 inspection fee by the deadline in your approval notice. The license is issued after payment." },
];

function ProcessSteps() {
  return (
    <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {STEPS.map((s) => (
        <li key={s.n} className="rounded-lg border border-lvinit-lightgray bg-lvinit-white p-5">
          <p className="text-caption uppercase tracking-wide text-lvinit-blue">Step {s.n}</p>
          <p className="mt-1 text-body font-semibold text-lvinit-black">{s.title}</p>
          <p className="mt-2 text-body text-lvinit-warmgray">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

// --- Page ------------------------------------------------------------------
export default function ClarkCountyStrLicense2027Page() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Homeowner Guide · Unincorporated Clark County",
        headline: HEADLINE,
        subheadline:
          "The lottery is gone and applications reopen by appointment in January. The 1,000-foot rule, the HOA test and the sewer requirement are all still here. Here's what changed, the dates that matter, and how to tell whether your property can qualify.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        backLink: { label: "LVINIT", href: "/" },
        ctas: [
          { label: "See the key dates", href: "#key-dates", variant: "primary" },
          { label: "Check the 1,000-foot rule", href: "#thousand-foot-rule", variant: "secondary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on owning, buying and living in the Las Vegas Valley.",
        stories: [
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Neighborhoods",
            dek: "Most of the southwest valley is unincorporated Clark County, mainly Enterprise and Spring Valley.",
          },
          {
            name: "HOA Fees in Las Vegas: What to Check Before You Make an Offer",
            href: "/guides/hoa-fees-las-vegas-what-to-check",
            category: "Buyer Guide",
            dek: "What to read in an HOA's documents before you buy, including the rental rules.",
          },
          {
            name: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
            href: "/guides/nevada-property-tax-abatement-resale-buyers",
            category: "Cost of Living",
            dek: "How Nevada's property tax caps work, and why the cap you get depends on how you use the home.",
          },
          {
            name: "Moving to Las Vegas: Where to Start",
            href: "/guides/moving-to-las-vegas",
            category: "Moving Here",
            dek: "City vs. county, neighborhoods and the first decisions that matter.",
          },
        ],
      }}
      ctas={{
        heading: "Buying or selling a home where STR rules matter?",
        body:
          "I can help you work out a property's jurisdiction, HOA documents and location before you buy. Whether a home can be licensed as a short-term rental is the county's decision, not mine or LVINIT's. Get in touch when you're ready to talk through a property.",
      }}
    >
      <StoryLede
        kicker="Updated November 10, 2026"
        lead="Clark County will start taking short-term rental license applications again on January 5, 2027, by in-person appointment only. Booking opens December 15. On November 3, 2026, the County Commission adopted Ordinance No. 5427, which takes effect November 18. It ends the old lottery and requires a decision within 45 business days. It does not loosen who can qualify."
      >
        <P>
          That last part is the one most homeowners will run into. The 1,000-foot separation from
          other short-term rentals, the 2,500-foot buffer around resort hotels, the HOA test, the
          sewer requirement and the one-rental-per-owner limit all survived. The county&rsquo;s own
          presentation called the changes{" "}
          <span className="text-lvinit-black">&ldquo;process, not policy.&rdquo;</span> So reopening
          applications doesn&rsquo;t mean reopening eligibility. If your home sits inside an existing
          licensed rental&rsquo;s buffer, the new process won&rsquo;t change the answer.
        </P>
        <P>
          This applies only in <span className="text-lvinit-black">unincorporated Clark County</span>,
          places like Spring Valley, Enterprise, Paradise and Winchester. It doesn&rsquo;t cover the
          City of Las Vegas, Henderson or North Las Vegas. Everything below is from the{" "}
          <Ext href={SRC.legistar}>adopted ordinance record</Ext>, county code and the federal court
          filings, with sources at the end.
        </P>
      </StoryLede>

      {/* A ---------------------------------------------------------------- */}
      <StorySection heading="What Clark County approved on November 3, 2026">
        <P first>
          Commissioners approved Ordinance No. 5427 at their November 3 meeting. The county
          record lists it as effective November 18, 2026, after the required two weeks of newspaper
          publication. It rewrites how Chapter 7.100 of the county code handles applications:
        </P>
        <ul className="mt-5 space-y-3 text-body-lg text-lvinit-warmgray">
          <Bullet>
            <span className="text-lvinit-black">The lottery is repealed.</span> The 2022–23 random
            drawing and fixed application windows are gone. Applications are accepted on a
            continuing basis.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">Most applications can move in parallel.</span> The
            county may approve or deny applications in any order. The exception is complete
            applications within 1,000 feet of each other, which must be decided in the order
            received.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">There&rsquo;s a decision deadline.</span> 45{" "}
            <em>business</em> days from a complete application, with defined pauses.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">Applicants have a deadline too.</span> 14 calendar
            days to answer a county request or schedule an inspection.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">Short-term rentals become a zoning use.</span> The
            ordinance adds &ldquo;short-term rental&rdquo; as a conditional commercial use in the
            county&rsquo;s zoning code. That&rsquo;s also where the distance rules now live.
          </Bullet>
        </ul>
        <H3>Why the county changed the process</H3>
        <P first>
          The short answer is the federal lawsuit. In October, the Ninth Circuit said homeowners need
          a meaningful chance to apply and have applications processed in a reasonable time. The
          county had accepted applications in only one window, in 2022–23. Staff told commissioners
          the backlog came from volume and the distance rule. An approval or denial for one
          application often decided its neighbors&rsquo; eligibility, so each cluster had to be
          worked one by one. Deputy District Attorney Jeff Rogan told the board the county received
          830 complete applications, approved 242 licenses, and had 47 still pending, according to{" "}
          <Ext href={SRC.fox5}>FOX5</Ext> and <Ext href={SRC.ktnv}>KTNV</Ext>.
        </P>
        <Note>
          <span className="font-semibold">Effective date isn&rsquo;t the application date.</span> The
          ordinance takes effect November 18, 2026, but nobody can submit a new application that day.
          New applications are taken only at intake appointments, which start January 5, 2027.
        </Note>
      </StorySection>

      {/* B ---------------------------------------------------------------- */}
      <StorySection muted heading="Key Clark County STR application dates">
        <P first>
          Here&rsquo;s the schedule the county presented on November 3. The two dates to circle are{" "}
          <span className="text-lvinit-black">December 15</span>, when appointment booking opens, and{" "}
          <span className="text-lvinit-black">January 5, 2027 at 8 a.m.</span>, when the first
          appointments happen.
        </P>
        <Timeline />
        <H3>January 1 is not the start date</H3>
        <P first>
          You may see &ldquo;January 2027&rdquo; or &ldquo;the new year&rdquo; in coverage. The first
          intake appointments are January 5, 2027, a Tuesday. Nothing is accepted on January 1.
        </P>
        <H3>How many appointments are there?</H3>
        <P first>
          The county says it will offer{" "}
          <span className="text-lvinit-black">168 appointments per week</span>, staffed by three
          dedicated technicians, Monday through Thursday from 8 a.m. to 4 p.m. Booking is first come,
          first served. Your place in line is set by the time stamp at your appointment, not when you
          booked. That matters if a neighbor within 1,000 feet applies too. If you show up with an
          incomplete application, the county&rsquo;s presentation says you can come back with the
          missing pieces without booking a new appointment.
        </P>
      </StorySection>

      {/* C ---------------------------------------------------------------- */}
      <StorySection heading="How the new Clark County STR application process works">
        <P first>From the county&rsquo;s presentation and the ordinance text, the path looks like this:</P>
        <ProcessSteps />

        <H3>The 45-business-day clock, and when it stops</H3>
        <P first>
          The ordinance says applications &ldquo;will be approved or denied&rdquo; within 45 business
          days of the county receiving a complete application. That&rsquo;s about nine weeks, not 45
          calendar days. The clock is paused (&ldquo;tolled&rdquo;):
        </P>
        <ul className="mt-4 space-y-3 text-body-lg text-lvinit-warmgray">
          <Bullet>while the county is waiting on more information from you,</Bullet>
          <Bullet>while an inspection is pending, and</Bullet>
          <Bullet>
            until every earlier-received application within 1,000 feet has a final determination,
            meaning the appeal window has run or the hearing officer has ruled.
          </Bullet>
        </ul>

        <H3>The 14-day response window</H3>
        <P first>
          If the county asks for more information or asks you to schedule an inspection, you have 14
          calendar days. Miss it and the application may be denied. Before a license issues, county
          agencies can inspect the home on 48 hours&rsquo; notice. Applicants who fail or refuse to
          cooperate with an inspection can also be denied.
        </P>

        <H3>Fees: what&rsquo;s actually in the code</H3>
        <div className="mt-4 overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-white">
          <table className="w-full text-left text-body">
            <caption className="sr-only">Clark County STR fees</caption>
            <tbody>
              {[
                ["Application fee", "$45, nonrefundable, paid at intake"],
                ["Inspection fee", "$150, nonrefundable, paid before the license issues"],
                ["Annual license fee, 3 or fewer bedrooms", "$750"],
                ["Annual license fee, more than 3 bedrooms", "$1,500"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-lvinit-lightgray last:border-0">
                  <th scope="row" className="px-5 py-3 font-normal text-lvinit-black">{k}</th>
                  <td className="px-5 py-3 font-semibold text-lvinit-blue">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Bedrooms are counted from the Assessor&rsquo;s records. These are the county fees in Chapter
          7.100. They don&rsquo;t include a state business license, insurance, safety equipment or
          transient lodging taxes.
        </P>

        <H3>Appeals: 30 days now, maybe 14 later</H3>
        <P first>
          News reports have described both a 14-day and a 30-day appeal deadline, and both have a
          basis. Here&rsquo;s where things stand:
        </P>
        <ul className="mt-4 space-y-3 text-body-lg text-lvinit-warmgray">
          <Bullet>
            <span className="text-lvinit-black">Today it&rsquo;s 30 calendar days.</span> A denied
            applicant can request an administrative hearing under the general Business License appeal
            rule, Section 6.04.090(j). The county&rsquo;s presentation puts that at 30 calendar days.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">14 days is proposed, not adopted.</span> A separate
            ordinance, <Ext href={SRC.appealBill}>Bill 11-3-26-1</Ext>, would cut the time to appeal a
            Business License decision to 14 calendar days. It was introduced November 3 and has a
            public hearing on November 17, 2026. It isn&rsquo;t law unless commissioners adopt it.
          </Bullet>
          <Bullet>
            Either way, read the deadline printed on your denial notice and follow it. The county says
            STR appeal hearings will be held at least twice a month.
          </Bullet>
        </ul>

        <H3>Applications still pending from 2023</H3>
        <P first>
          A change made at the November 3 hearing covers the roughly 47 applications still pending
          from the 2022–23 window. Those applicants keep the eligibility rules that were in place
          when they applied, but the new procedures and deadlines now apply to them. Their 45-day and
          14-day clocks can&rsquo;t start before November 18. They also keep their lottery order and
          are treated as received <em>before</em> any new application. In practice, a pending 2023
          application near your home goes ahead of you.
        </P>

        <H3>Overlapping 1,000-foot buffers</H3>
        <P first>
          When complete applications sit within 1,000 feet of each other, the county calls it a
          cluster. The county can&rsquo;t approve or deny a later application until the earlier one
          is final, including its appeal period. If the earlier one is approved, the later one
          becomes ineligible. If it&rsquo;s denied, the later one moves up. Staff said they expect
          &ldquo;fewer and smaller clusters&rdquo; this time and that most applications won&rsquo;t
          be in one. Pending applications will also appear on the county&rsquo;s public map once
          intake begins, so you can see who is ahead of you.
        </P>
      </StorySection>

      {/* D ---------------------------------------------------------------- */}
      <StorySection muted heading="Who can qualify for a Clark County short-term rental license?">
        <P first>
          Use this as a screening list, not a guarantee. Every item has to be true. The county makes
          the final call after review and inspection.
        </P>
        <ul className="mt-6 space-y-4 text-body-lg text-lvinit-warmgray">
          <Bullet>
            <span className="text-lvinit-black">The property is in unincorporated Clark County.</span>{" "}
            Not the City of Las Vegas, Henderson, North Las Vegas, Boulder City or Mesquite.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">It&rsquo;s in an allowed zoning district.</span> STRs
            are a conditional use in the county&rsquo;s residential districts (RS80 through RM50). In
            the CG, CC, CU and CR commercial districts, they&rsquo;re allowed only in the multifamily
            part of a mixed-use development or in a legal nonconforming dwelling.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">It&rsquo;s an eligible property type.</span> Not a
            mobile or manufactured home, RV or trailer. Not an apartment building, timeshare or
            income-restricted or subsidized unit. In other multifamily buildings, the license
            can&rsquo;t push STRs above 10% of the units or break the owner&rsquo;s own ban.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">It&rsquo;s at least 1,000 feet from any other
            short-term rental</span>, measured property line to property line. Condo-style units
            mapped for individual ownership inside a multifamily building are exempt from this rule.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">It&rsquo;s at least 2,500 feet from a resort
            hotel</span>, or from a property approved for one, property line to property line.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">The HOA allows it in writing.</span> In a
            common-interest community, the governing documents must <em>expressly</em> authorize
            transient rentals. See our guide to{" "}
            <In href="/guides/hoa-fees-las-vegas-what-to-check">reading HOA documents</In>.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">It&rsquo;s on municipal sewer.</span> Septic
            properties aren&rsquo;t eligible.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">It&rsquo;s not in a barred rural area:</span> the
            Town of Mt. Charleston or the Moapa, Moapa Valley, Mesquite or Bunkerville townships.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">The owner qualifies.</span> The applicant is the owner
            of record, 18 or older. An LLC or trust qualifies only if every member, manager, officer,
            trustee and beneficiary is a disclosed adult. No owner can hold more than one STR
            license, or a financial interest in more than one STR, in unincorporated Clark County.
            Certain history in the past seven years is disqualifying, such as a revoked license.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">The home is safe and permitted.</span> It must be
            habitable and hazard-free, with no unpermitted construction unless it was later fixed to
            the county&rsquo;s satisfaction. It also has to pass the fire inspection.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">A license is available under the cap.</span> Total
            licenses can&rsquo;t exceed 1% of housing units in unincorporated Clark County.
          </Bullet>
        </ul>

        <H3>Once licensed, the operating rules</H3>
        <P first>
          Maximum occupancy is two people per bedroom or 10 total, whichever is lower, with a two-night
          minimum and one booking at a time. Parties are banned, and outdoor amenities like pools,
          spas and fire pits are off-limits from 10 p.m. to 7 a.m. Licensees need a local
          representative who can respond within 30 minutes and a 24-hour complaint line. They also
          need $500,000 in liability insurance, a street-facing camera, noise monitors, an exterior
          placard and the license number on every listing. The license must be renewed every year.
          Operating as an STR also affects your property tax: the county&rsquo;s own findings say it
          makes a home ineligible for Nevada&rsquo;s primary-residence tax cap. Our{" "}
          <In href="/guides/nevada-property-tax-abatement-resale-buyers">property tax cap guide</In>{" "}
          explains why that matters.
        </P>

        <H3>A Las Vegas address doesn&rsquo;t mean the City of Las Vegas</H3>
        <P first>
          Most of the valley uses &ldquo;Las Vegas&rdquo; as a mailing address, including large
          unincorporated areas. Much of{" "}
          <In href="/neighborhoods/southwest-las-vegas">Southwest Las Vegas</In> is unincorporated
          county (mainly Enterprise and Spring Valley). Most of{" "}
          <In href="/neighborhoods/summerlin">Summerlin</In> is inside the City of Las Vegas, but
          Summerlin South is unincorporated. <In href="/neighborhoods/henderson">Henderson</In> and{" "}
          <In href="/neighborhoods/north-las-vegas">North Las Vegas</In> are separate cities with their
          own rules. Go by the parcel&rsquo;s jurisdiction, not the ZIP code or the post office name.
        </P>
      </StorySection>

      {/* E ---------------------------------------------------------------- */}
      <StorySection id="thousand-foot-rule" heading="The 1,000-foot rule: the biggest obstacle for many homeowners">
        <P first>
          The county rebuilt the process but kept the distance rule. Ordinance No. 5427 moved the
          1,000-foot separation from the business-license chapter into the zoning code, under
          standards that &ldquo;shall not be waived or varied.&rdquo; Staff told commissioners state
          law (AB 363, 2021) still requires distance separation. The county&rsquo;s November 3 slide
          counted 241 licensed rentals already operating. Each one has a 1,000-foot buffer where no
          one else can be licensed.
        </P>
        <BufferDiagram />

        <H3>How to check your property on the county&rsquo;s map</H3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-body-lg text-lvinit-warmgray marker:text-lvinit-blue">
          <li>
            Open the county&rsquo;s{" "}
            <Ext href={SRC.map}>Short-Term Rental License Informational Map</Ext> and read the
            instructions panel.
          </li>
          <li>Type your address or parcel number into the Parcel Search box.</li>
          <li>
            Open the Legend. County-approved STR licenses show as{" "}
            <span className="text-lvinit-black">dark green parcels</span>. The{" "}
            <span className="text-lvinit-black">lighter green shading</span> around them is the
            1,000-foot buffer.
          </li>
          <li>
            Check the other layers too: the 2,500-foot resort-hotel buffers, the septic property-type
            layer, the shaded rural townships, and the City of Las Vegas and Henderson boundaries and
            their STR buffers.
          </li>
          <li>Save or print the Parcel Search result, as the map&rsquo;s instructions suggest.</li>
        </ol>

        <H3>What the map can&rsquo;t tell you</H3>
        <P first>
          A parcel inside a green buffer likely can&rsquo;t qualify while that license is active, even
          though applications are reopening. A parcel outside every buffer has passed one test, not
          all of them. The map also won&rsquo;t show an application someone else filed last week until
          the county adds pending applications after intake starts. The county&rsquo;s disclaimer says
          the map can only &ldquo;provisionally indicate&rdquo; whether a unit is likely able or
          unable to get a license, and that it doesn&rsquo;t guarantee approval or issuance. If your
          lot sits near a buffer edge, email{" "}
          <a href="mailto:STR@ClarkCountyNV.gov" className={linkCls}>STR@ClarkCountyNV.gov</a> and
          ask for the answer in writing before spending money on furniture, listings or a purchase.
        </P>
        <Note>
          <span className="font-semibold">Buying a home to run as an Airbnb?</span> Treat STR
          eligibility as unknown until the county confirms it. A licensed neighbor, an earlier nearby
          application or an HOA rule can each end the plan. A license can&rsquo;t be transferred to a
          new owner, either.
        </Note>
      </StorySection>

      {/* F ---------------------------------------------------------------- */}
      <StorySection muted heading="What about homeowners already operating without a license?">
        <P first>Keep these four situations separate, because they aren&rsquo;t the same thing:</P>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              t: "Eligible to apply",
              b: "Anyone can book an appointment. Being able to apply says nothing about whether the property qualifies.",
            },
            {
              t: "Actually licensed",
              b: "Only an issued license, after approval, inspection and fees, makes operating legal under county code.",
            },
            {
              t: "Application pending",
              b: "A pending application is not a license. The ordinance doesn't let you operate while you wait.",
            },
            {
              t: "Covered by the injunction",
              b: "A temporary court order, not a permit. The Ninth Circuit has ordered it narrowed, and its future scope isn't settled.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-lg border border-lvinit-lightgray bg-lvinit-white p-5">
              <p className="text-body font-semibold text-lvinit-black">{c.t}</p>
              <p className="mt-2 text-body text-lvinit-warmgray">{c.b}</p>
            </div>
          ))}
        </div>
        <H3>Can previously fined homeowners apply?</H3>
        <P first>
          Generally, yes. The ordinance deleted the rule that made a property ineligible if code
          enforcement had multiple substantiated, unresolved violations there in the previous 36
          months. FOX5 reported that homeowners the county previously fined could still be eligible
          for a license. Other owner-level bars weren&rsquo;t touched. One example is a short-term
          rental license revoked, suspended or not renewed in the past seven years. And submitting
          an application doesn&rsquo;t make an existing unlicensed rental legal.
        </P>
        <P>
          Separately, the county adopted <span className="text-lvinit-black">Ordinance No. 5407</span>{" "}
          (effective September 2, 2026). It amends the rules for booking platforms and bars them from
          processing payment for an STR unless they&rsquo;ve verified it&rsquo;s properly licensed.
        </P>
      </StorySection>

      {/* G ---------------------------------------------------------------- */}
      <StorySection heading="The federal lawsuit and Judge Du's injunction">
        <P first>
          In June 2025, the Greater Las Vegas Short-Term Rental Association (GLVSTRA) and a group of
          homeowners sued Clark County in federal court. Airbnb is now also a plaintiff. The case is{" "}
          <Ext href={SRC.docket}>No. 2:25-cv-01173</Ext> before U.S. District Judge Miranda Du in
          Nevada. The plaintiffs argue the county enforced a license requirement while offering no
          working way to get a license.
        </P>
        <H3>December 17, 2025: the preliminary injunction</H3>
        <P first>
          Judge Du found the plaintiffs likely to win on their procedural due process claim and{" "}
          <Ext href={SRC.duOrder}>granted a preliminary injunction</Ext> in part. Until a final
          decision, the county is barred from enforcing five code provisions: the license requirement
          (&sect;7.100.030), the $1,000–$10,000 daily fine for operating without a license
          (&sect;7.100.230(d)(1)(I)), the nuisance declaration (&sect;7.100.220), and two provisions
          tied to collecting fines through liens (&sect;7.100.250 and &sect;1.14.020(g)). That&rsquo;s
          why the county hasn&rsquo;t been fining unlicensed hosts.
        </P>
        <H3>October 7, 2026: the Ninth Circuit</H3>
        <P first>
          A three-judge panel <Ext href={SRC.ninth}>affirmed in part and remanded</Ext> in an
          unpublished memorandum. The panel held:
        </P>
        <ul className="mt-4 space-y-3 text-body-lg text-lvinit-warmgray">
          <Bullet>
            Homeowners have shown{" "}
            <span className="text-lvinit-black">a protected property interest in leasing their
            homes on a short-term basis</span>.
          </Bullet>
          <Bullet>
            The county likely violated procedural due process by enforcing the license requirement
            &ldquo;without providing any functional process for obtaining a license.&rdquo; The court
            noted the portal opened only once, between 2022 and 2023.
          </Bullet>
          <Bullet>
            But the injunction is <span className="text-lvinit-black">too broad</span>. It
            &ldquo;effectively authorizes anyone in the County to operate unlicensed short-term
            rentals, including nonparties and those who have never applied.&rdquo;
          </Bullet>
          <Bullet>
            The district court must narrow it. The panel suggested ordering the county to reopen
            applications on a set processing timeline and protecting residents with a pending
            application.
          </Bullet>
        </ul>
        <H3>Where the case stands now</H3>
        <P first>
          The Ninth Circuit&rsquo;s mandate reached the district court on November 3, 2026, the same
          day commissioners adopted the new ordinance, and the court entered an order on the mandate.
          As of November 10, LVINIT had not been able to read a narrowed injunction or confirm its
          terms. What happens to unlicensed operators who never applied is still unsettled. The
          appeals panel signaled they shouldn&rsquo;t be covered, but the district court
          hasn&rsquo;t ruled on that yet. Neither court struck down the 1,000-foot rule or the
          county&rsquo;s other eligibility standards in these decisions. The Ninth Circuit ruled on
          the licensing process.
        </P>
        <P>
          GLVSTRA president Jackie Flores told <Ext href={SRC.ktnv}>KTNV</Ext> she hopes the new
          process runs smoothly and that the group can be a resource for homeowners applying. You can
          follow the association at <Ext href={SRC.glvstra}>glvstra.org</Ext>. We&rsquo;ll update
          this page when the district court acts.
        </P>
      </StorySection>

      {/* H ---------------------------------------------------------------- */}
      <StorySection muted heading="What the new ordinance does NOT change">
        <P first>
          This table is the quickest way to see that the process changed and most eligibility rules
          didn&rsquo;t.
        </P>
        <ProcessComparison />
        <StaysTable />
      </StorySection>

      {/* I ---------------------------------------------------------------- */}
      <StorySection id="prepare" heading="What homeowners should do before December 15">
        <P first>
          The county won&rsquo;t post the revised application until December 1, so nobody can give
          you its final document checklist yet. What you <em>can</em> do now is everything the
          ordinance already requires.
        </P>
        <PrepChecklist />
      </StorySection>

      {/* J ---------------------------------------------------------------- */}
      <StorySection muted heading="Frequently asked questions">
        <div className="space-y-8">
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3 className="text-body-lg font-semibold text-lvinit-black">{f.q}</h3>
              <p className="mt-2 text-body-lg text-lvinit-warmgray">{f.a}</p>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Clark County Board of County Commissioners</span>,
            Nov. 3, 2026, agenda item 31 (file 26-2339): <Ext href={SRC.legistar}>legislation record</Ext>,{" "}
            <Ext href={SRC.bill}>Bill 10-20-26-1</Ext>,{" "}
            <Ext href={SRC.changes}>changes adopted at the hearing</Ext>, and{" "}
            <Ext href={SRC.presentation}>staff presentation</Ext>. County records list the item as
            Ordinance No. 5427, effective Nov. 18, 2026.
          </li>
          <li>
            <span className="text-lvinit-black">Clark County</span>,{" "}
            <Ext href={SRC.appealBill}>Bill 11-3-26-1</Ext> (proposed 14-day appeal period; public
            hearing Nov. 17, 2026).
          </li>
          <li>
            <span className="text-lvinit-black">Clark County Code</span>,{" "}
            <Ext href={SRC.code}>Chapter 7.100, Short-Term Rental Units</Ext> (§§ 7.100.060, .070,
            .120).
          </li>
          <li>
            <span className="text-lvinit-black">Clark County Department of Business License</span>,{" "}
            <Ext href={SRC.countyStr}>Short-Term Rental Units page</Ext> and{" "}
            <Ext href={SRC.map}>STR License Informational Map</Ext>.
          </li>
          <li>
            <span className="text-lvinit-black">U.S. Court of Appeals for the Ninth Circuit</span>,{" "}
            <Ext href={SRC.ninth}>memorandum, No. 26-278</Ext>, filed Oct. 7, 2026.
          </li>
          <li>
            <span className="text-lvinit-black">U.S. District Court, District of Nevada</span>,{" "}
            <Ext href={SRC.duOrder}>order granting preliminary injunction in part</Ext> (ECF No. 51),
            Dec. 17, 2025, and <Ext href={SRC.docket}>case docket</Ext>.
          </li>
          <li>
            Reporting: <Ext href={SRC.sun}>Las Vegas Sun</Ext>,{" "}
            <Ext href={SRC.rj}>Las Vegas Review-Journal</Ext>, <Ext href={SRC.fox5}>FOX5</Ext> and{" "}
            <Ext href={SRC.ktnv}>KTNV</Ext>, Nov. 3–4, 2026.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Published and last updated November 10, 2026. This is general information, not legal
          advice. LVINIT and The Scofield Group don&rsquo;t issue licenses or decide eligibility.
          Rules, dates and court orders can change. Confirm your property&rsquo;s status with the Clark
          County Department of Business License, and talk to a Nevada attorney about your specific
          situation, especially if you&rsquo;re operating now or have received a notice of violation.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Mikey Del Rosario · Las Vegas Real Estate Advisor · The Scofield
          Group · Nevada License S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </StoryPage>
  );
}
