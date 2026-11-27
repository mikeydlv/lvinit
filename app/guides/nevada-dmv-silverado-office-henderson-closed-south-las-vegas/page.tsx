import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// MOVING HERE — Nevada DMV's new Silverado office (9850 S. Valley View Blvd.)
// replaces the Henderson office and the Donovan Way CDL office.
// Built by the LVINIT Daily Publisher from Local Radar assignment
// LR-NV-DMV-SILVERADO-RANCH-OFFICE.
//
// FACT DISCIPLINE — every DMV source re-read this run (2026-11-27):
// - DMV release Oct 12, 2026: opens to the public Mon Oct 26, 2026; replaces
//   the 18,540 sq ft Henderson office built in 1997; 72,619 sq ft total;
//   houses the main DMV office and CDL operations; Director Tonya Laney: "the
//   largest DMV facility in Nevada". Main building: 60 counters, two
//   drive-through kiosks, four walk-up exterior kiosks for after-hours
//   service, 301 customer parking spaces. CDL building: 15 counters, five
//   Motor Carrier Division counters, full-size CDL testing course, 42 customer
//   spaces, 16 semi-truck spaces.
// - DMV release Sept 8, 2026: Donovan Way CDL office closed end of business
//   Oct 9; Henderson office on American Pacific Drive closed end of business
//   Oct 14; permanent; aging facilities; MyDMV / DriveNV for registration and
//   renewals, license/ID renewals, address/name changes, driver history.
// - DMV release July 16, 2026: funding constraints don't allow additional
//   facilities, staffing and operating costs (Laney quote paraphrased).
// - DMV locations page: Silverado, 9850 S Valley View Blvd, Las Vegas NV
//   89141; 8-5 Mon-Fri, 8-4 Sat; VIN station; "Appointment Required!". No
//   Henderson DMV office listed. AAA Henderson (1511 W. Sunset Rd) and Green
//   Valley (1000 N. Green Valley Pkwy) listed for vehicle registration and
//   handicapped placards; AAA doesn't do VIN inspections, emissions
//   exemptions, mailed transactions or title transfers.
// - DMV appointments page: "All DMV services are by appointment only, except
//   for" plate drop-off, past-due debt payments, VIN inspections (metro
//   offices), title document drop-off after Turbo Titles payment. Metro
//   last-minute Wednesday appointments open the night before at 8 p.m.
//   Silverado also has a commercial (CDL) appointment calendar.
// - News 3 (Nov 12, 2026): ribbon cutting that day.
// MUST NOT CLAIM / OMITTED: construction cost; that general walk-ins are
// accepted; that the office is open Fri Nov 27 (Nevada Family Day); a total
// count of metro DMV offices; drive times or distances; the Sept 8 "over 350"
// parking figure (Oct 12 breakdown used instead); any LVINIT visit.
// IMAGERY — No LVINIT photography of the Silverado DMV exists in the image
// library and none was added the morning of publication. Photoless
// StoryHero and no card image, per the standard fallback. No DMV or news
// photos (no rights).
// ---------------------------------------------------------------------------

const PATH = "/guides/nevada-dmv-silverado-office-henderson-closed-south-las-vegas";
const TITLE =
  "The Henderson DMV Is Gone. What to Know About Nevada’s New Silverado DMV in the South Valley";
const OPENING_URL = "https://dmv.nv.gov/news/26012_Silverado_grand_opening.htm";
const CONSOLIDATION_URL =
  "https://dmv.nv.gov/news/26010_Henderson_and_Donovan_DMV_offices_to_consolidate_into_silverado_facility.htm";
const JULY_URL = "https://dmv.nv.gov/news/26009_Nevada_DMV_provides_updates_on_Silverado_Ranch.htm";
const LOCATIONS_URL = "https://dmv.nv.gov/locat.htm";
const APPOINTMENTS_URL = "https://dmv.nv.gov/appointments.htm";
const NEWS3_URL =
  "https://news3lv.com/news/local/dmv-opens-new-silverado-office-on-valleys-south-side-with-ribbon-cutting-ceremony";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const listCls = "mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray";
const pCls = "text-body-lg text-lvinit-warmgray";

const meta: StoryMeta = {
  title: "Henderson DMV Closed: New Silverado DMV Location, Hours & Tips | LVINIT",
  headline: TITLE,
  description:
    "Nevada DMV closed its Henderson office and moved it, plus the Donovan Way CDL office, into a new Silverado facility at 9850 S. Valley View Blvd. Where it is, hours, appointments and what you can do without going in.",
  path: PATH,
  datePublished: "2026-11-27",
  dateModified: "2026-11-27",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Nevada DMV Silverado Office", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function NevadaDmvSilveradoOfficePage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Moving Here",
        headline: TITLE,
        subheadline:
          "The DMV map in the valley changed this fall. Henderson lost its office, CDL testing left North Las Vegas, and everything landed in one big building off Valley View. Here's what that means if you need the DMV.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More of the practical stuff for living here.",
        stories: [
          {
            name: "Moving to Las Vegas: Where to Start",
            href: "/guides/moving-to-las-vegas",
            category: "Moving Here",
            dek: "The order I'd tackle a move in, including the first-month basics.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "Two sides of the south valley, compared.",
          },
          {
            name: "Surviving Your First Las Vegas Summer",
            href: "/guides/first-summer-in-vegas",
            category: "Moving Here",
            dek: "The practical version, not the panicked version.",
          },
        ],
      }}
      ctas={{
        heading: "Just moved here, or about to?",
        body:
          "The DMV is one of those first-month chores everybody has to deal with. If you're still figuring out which part of the valley fits you, ask me.",
      }}
    >
      <StoryLede
        kicker="Moving Here"
        lead="If you live in Henderson and your DMV was the office on American Pacific Drive, it's closed for good. Nevada DMV shut it on Oct. 14 and moved its work to a new Silverado office at 9850 S. Valley View Blvd., just south of Silverado Ranch Boulevard in the south valley. The commercial driver's license office on Donovan Way closed too, and CDL services moved to the same site. The new building opened Oct. 26. Here's where it is, how to get in the door, and what you can handle without going at all."
      />

      <StorySection heading="The quick version">
        <ul className={listCls.replace("mt-5 ", "")}>
          <li>
            <span className="text-lvinit-black">Where:</span> 9850 S. Valley
            View Blvd., Las Vegas, NV 89141, near Silverado Ranch Boulevard
            and Valley View.
          </li>
          <li>
            <span className="text-lvinit-black">Hours:</span> 8 a.m. to 5 p.m.
            Monday through Friday, and 8 a.m. to 4 p.m. Saturday, per the
            DMV&rsquo;s office page.
          </li>
          <li>
            <span className="text-lvinit-black">Appointments:</span> Required.
            The DMV says all services are by appointment, with a few
            exceptions listed below.
          </li>
          <li>
            <span className="text-lvinit-black">What closed:</span> The
            Henderson office on American Pacific Drive (Oct. 14) and the CDL
            office on Donovan Way (Oct. 9). Both closures are permanent.
          </li>
          <li>
            <span className="text-lvinit-black">Today:</span> Friday, Nov. 27,
            is Nevada Family Day, a state holiday. Check the DMV site before
            you head out today.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What the new office is">
        <p className={pCls}>
          The Silverado facility is two buildings. The main one is the regular
          DMV office, for licenses, IDs, registration and the rest. The second
          handles commercial driver&rsquo;s licenses. Together they total
          72,619 square feet. The Henderson office it replaces was 18,540
          square feet and dated to 1997. DMV Director Tonya Laney called the
          new building &ldquo;the largest DMV facility in Nevada.&rdquo;
        </p>
        <p className={`mt-5 ${pCls}`}>Per the DMV&rsquo;s Oct. 12 release:</p>
        <ul className={listCls}>
          <li>
            <span className="text-lvinit-black">Main building:</span> 60
            customer service counters, two drive-through kiosks, four walk-up
            kiosks outside for after-hours service, and 301 customer parking
            spaces.
          </li>
          <li>
            <span className="text-lvinit-black">CDL building:</span> 15
            customer service counters, five Motor Carrier Division counters, a
            full-size CDL testing course, 42 customer parking spaces and 16
            spaces for semi-trucks.
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          The office opened to the public Monday, Oct. 26, and the DMV held a
          ribbon cutting on Nov. 12.
        </p>
      </StorySection>

      <StorySection heading="Why Henderson lost its office">
        <p className={pCls}>
          The DMV gave two reasons. In September it said both the Henderson and
          Donovan Way buildings were aging and no longer met the needs of a
          growing customer base. In July, Laney said the decision came down to
          funding: the agency doesn&rsquo;t have the money for more
          facilities, staff and operating costs, so it chose to replace the old
          offices with one modern location instead of running several.
        </p>
        <p className={`mt-5 ${pCls}`}>
          The practical result is that Henderson no longer has a DMV office of
          its own. Silverado is the office built to take the old Henderson
          office&rsquo;s customers. Other Las Vegas-area offices on the
          DMV&rsquo;s locations page include East Sahara, West Flamingo and
          North Decatur. Our{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson guide
          </Link>{" "}
          and{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas guide
          </Link>{" "}
          cover the parts of the valley on either side of it.
        </p>
      </StorySection>

      <StorySection muted heading="Getting in the door: appointments">
        <p className={pCls}>
          Don&rsquo;t just show up. The DMV&rsquo;s locations page marks
          Silverado &ldquo;Appointment Required!&rdquo; and its appointments
          page says all DMV services are by appointment only, except for:
        </p>
        <ul className={listCls}>
          <li>License plate drop-off</li>
          <li>Past-due debt payments</li>
          <li>VIN inspections (Silverado has a VIN station)</li>
          <li>Title document drop-off after a Turbo Titles payment</li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          Book on the{" "}
          <a href={APPOINTMENTS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
            DMV appointments page
          </a>
          . Silverado has its own general calendar and a separate one for
          commercial (CDL) appointments. One tip from that page: for the
          metro offices, last-minute Wednesday appointments open the night
          before, starting at 8 p.m.
        </p>
      </StorySection>

      <StorySection heading="What you can do without going in">
        <p className={pCls}>
          A lot of DMV business doesn&rsquo;t need a counter. The DMV points
          people to its MyDMV and DriveNV online services for:
        </p>
        <ul className={listCls}>
          <li>Vehicle registration and registration renewals</li>
          <li>Driver&rsquo;s license and ID card renewals</li>
          <li>Address and name changes</li>
          <li>Driver history printouts</li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          Silverado&rsquo;s drive-through and walk-up kiosks are meant for
          transactions outside office hours, too. And two AAA offices in
          Henderson, on West Sunset Road and on North Green Valley Parkway, are
          on the DMV&rsquo;s list of partner locations for vehicle registration
          and handicapped placards. The DMV notes that AAA doesn&rsquo;t do VIN
          inspections, emissions exemptions or title transfers, and AAA books
          its own appointments, so check its site first.
        </p>
      </StorySection>

      <StorySection muted heading="If you just moved here">
        <p className={pCls}>
          This is the part newcomers ask about. The Nevada DMV says new
          residents need a Nevada driver&rsquo;s license and need to register
          their vehicle within 30 days of establishing residency. Since the
          offices run on appointments, it&rsquo;s worth checking early whether
          your transaction can be done online and, if it can&rsquo;t, booking
          a slot well before the deadline. Check the DMV&rsquo;s own pages for
          the documents to bring.
        </p>
        <p className={`mt-5 ${pCls}`}>
          Our{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>{" "}
          guide covers the rest of the first-month list.
        </p>
      </StorySection>

      <StorySection heading="Before you go">
        <p className={pCls}>
          Everything here comes from the Nevada DMV&rsquo;s own releases and
          office pages as of Nov. 27. Hours and appointment rules change, so
          check the{" "}
          <a href={LOCATIONS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
            DMV locations page
          </a>{" "}
          the day you go. LVINIT hasn&rsquo;t photographed the new office
          yet, so there are no photos here instead of borrowed ones.
          We&rsquo;ll add our own when we have them.
        </p>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Nevada DMV</span>, Silverado
            facility opening release, Oct. 12, 2026.{" "}
            <a href={OPENING_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              dmv.nv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Nevada DMV</span>, Henderson and
            Donovan offices to consolidate into Silverado facility, Sept. 8,
            2026.{" "}
            <a href={CONSOLIDATION_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              dmv.nv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Nevada DMV</span>, Silverado
            update, July 16, 2026.{" "}
            <a href={JULY_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              dmv.nv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Nevada DMV</span>, office
            locations and appointments pages.{" "}
            <a href={LOCATIONS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              Locations
            </a>
            {" · "}
            <a href={APPOINTMENTS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              Appointments
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News 3 Las Vegas (KSNV)</span>,
            Silverado ribbon cutting, Nov. 12, 2026.{" "}
            <a href={NEWS3_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              news3lv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
