import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — the RTC RED LINE on Maryland Parkway. Built by the
// LVINIT Daily Publisher from Local Radar assignment LR-RTC-RED-LINE-MARYLAND-PKWY.
//
// FACT DISCIPLINE — read this run:
// - Mass Transit Magazine, republishing the RTC launch release (read): service
//   begins Aug. 23; 12.5 miles, South Strip Transit Terminal to Medical
//   District; every 12 minutes in daytime, seven days; 15 hydrogen fuel cell
//   buses; 7.2 miles of dedicated lanes; connections to Bonneville Transit
//   Center, South Strip Transit Terminal and Harry Reid International Airport;
//   $149.9M FTA Capital Investment Grant (awarded 2024); RTC estimates about
//   20% time savings vs. Route 109.
// - Fox5, Sept. 30, 2026 (read): $378M total, $219M federal; construction began
//   Aug. 2024, originally due Aug. 2026; Maryland Pkwy still torn up south of
//   Sahara; largely complete by end of 2026; red paint south of Sahara waits
//   until June 2027; May paint faded and will be repainted.
// - KTNV (read, undated page): smaller asphalt projects April-June 2027;
//   business owners quoted.
// DELIBERATELY OMITTED: station list, fares, exact service hours (rtcsnv.com
// returns 403 to automated fetch and no read source gives them), ridership or
// performance, and any merge of the $149.9M and $219M federal figures.
// IMAGERY — No LVINIT photography of the Red Line exists in the image library
// yet and no Maryland Parkway imagery is indexed. Photoless StoryHero and no
// card image, per the standard fallback. Nothing stands in for the corridor.
// ---------------------------------------------------------------------------

const PATH = "/guides/maryland-parkway-red-line-rtc-las-vegas";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title:
    "The Maryland Parkway RED LINE: What's Running and What's Still Under Construction | LVINIT",
  headline:
    "The Maryland Parkway RED LINE: What's Running, and What's Still Torn Up",
  description:
    "RTC's RED LINE rapid bus replaced Route 109 on Aug. 23 with a bus every 12 minutes. Here's what's confirmed, what's still under construction south of Sahara, and what hasn't been published.",
  path: PATH,
  datePublished: "2026-10-30",
  dateModified: "2026-10-30",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Maryland Parkway RED LINE", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function MarylandParkwayRedLinePage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline:
          "The Maryland Parkway RED LINE: What's Running, and What's Still Torn Up",
        subheadline:
          "The RTC's new rapid bus has been carrying riders since August, but the street it runs on isn't finished. Here's what's confirmed and what isn't.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on how the valley is changing and where to start.",
        stories: [
          {
            name: "Downtown Arts District Guide",
            href: "/neighborhoods/downtown-arts-district",
            category: "Neighborhoods",
            dek: "Another part of the urban core that's changing.",
          },
          {
            name: "The Foundry at Cashman",
            href: "/guides/the-foundry-lennar-cashman-downtown-las-vegas",
            category: "Local Feature",
            dek: "Another big change reshaping downtown Las Vegas.",
          },
          {
            name: "Moving to Las Vegas: Where to Start",
            href: "/guides/moving-to-las-vegas",
            category: "Moving to Las Vegas",
            dek: "The starting point if you're new to the valley.",
          },
        ],
      }}
      ctas={{
        heading: "Figuring out where in Las Vegas fits you?",
        body:
          "Commute options and getting around are part of the choice. Tell me what matters to you and I'll give you an honest read.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="The RTC's RED LINE replaced Route 109 on Maryland Parkway on August 23, with a bus every 12 minutes during the day. The service is running. The street is not finished: Maryland Parkway south of Sahara Avenue is still torn up, with most work expected to wrap by the end of 2026."
      />

      <StorySection heading="What's confirmed about the service">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Launch:</span> August 23,
            2026, replacing Route 109 (RTC release, as republished by Mass
            Transit Magazine; Fox5).
          </li>
          <li>
            <span className="text-lvinit-black">Route:</span> 12.5 miles from
            the South Strip Transit Terminal to the Las Vegas Medical
            District, with connections to Bonneville Transit Center and Harry
            Reid International Airport.
          </li>
          <li>
            <span className="text-lvinit-black">Frequency:</span> a bus every
            12 minutes during daytime hours, seven days a week.
          </li>
          <li>
            <span className="text-lvinit-black">Buses:</span> 15 hydrogen
            fuel cell buses, which the RTC describes as zero-emission.
          </li>
          <li>
            <span className="text-lvinit-black">Dedicated lanes:</span> 7.2
            miles of dedicated transit lanes plus traffic signal priority.
            The RTC estimates riders will save about 20% in travel time
            compared with Route 109.
          </li>
          <li>
            <span className="text-lvinit-black">Along the street:</span>{" "}
            wider sidewalks, larger and shadier shelters than the old 109
            stops, shared bus-bike lanes, and lighting and landscaping
            upgrades.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What's still under construction">
        <p className="text-body-lg text-lvinit-warmgray">
          Fox5 reported on September 30 that Maryland Parkway remains torn up
          south of Sahara Avenue. Construction began in August 2024 and the
          project was originally scheduled to be fully finished in August
          2026. The RTC told Fox5 the delays came from coordination with a
          utility undergrounding project and field and soil conditions on the
          corridor, and that grant deadlines had to be met to launch the
          service. It expects the work to be largely complete by the end of
          2026, including final paving.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Two details worth knowing. Red lane paint applied in May had faded
          within about four months, which the RTC blamed on dirt and fresh
          asphalt tracking onto the paint; it says money is budgeted for
          paint maintenance and the lanes will be repainted. And the red paint
          south of Sahara won&rsquo;t go down until June 2027. KTNV also
          reports smaller asphalt projects planned for April through June
          2027, which the RTC expects to be far less disruptive than earlier
          phases.
        </p>
      </StorySection>

      <StorySection muted heading="The cost, and two federal numbers">
        <p className="text-body-lg text-lvinit-warmgray">
          Fox5 reports a total project cost of $378 million, with $219 million
          from the federal government. The RTC&rsquo;s launch release
          separately cites a $149.9 million grant from the Federal Transit
          Administration&rsquo;s Capital Investment Grant program, awarded in
          2024. Those figures come from different sources and may cover
          different scopes, so I&rsquo;m reporting both and not combining
          them.
        </p>
      </StorySection>

      <StorySection heading="What it means if you live here or are moving here">
        <p className="text-body-lg text-lvinit-warmgray">
          Maryland Parkway runs past UNLV, and the Red Line ties it to the
          airport and the South Strip Transit Terminal. If you&rsquo;re
          weighing a car-light life in Las Vegas, a frequent daytime line with
          dedicated lanes is a real option, especially for UNLV and Medical
          District trips. If you&rsquo;re thinking about living near the
          corridor, expect construction to remain part of the picture south of
          Sahara through the end of the year.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The impact on businesses along the street is real too. KTNV spoke
          with owners including Mark &ldquo;Sketch&rdquo; Somoza of King of
          Hearts Tattoo, who said construction made it hard for customers to
          reach him over several months, and Sam Maxion of the DJ Museum, who
          said revenue lost during construction is gone for good. For how this
          fits with other changes in the core of the city, see the{" "}
          <Link href="/neighborhoods/downtown-arts-district" className={linkCls}>
            Downtown Arts District guide
          </Link>{" "}
          and our look at{" "}
          <Link
            href="/guides/the-foundry-lennar-cashman-downtown-las-vegas"
            className={linkCls}
          >
            The Foundry at Cashman
          </Link>
          . New to the valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Stations, fares and exact hours.</span>{" "}
            The RTC&rsquo;s own site wouldn&rsquo;t load for my automated
            check and none of the coverage I read lists them. Check{" "}
            <a
              href="https://www.rtcsnv.com"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              rtcsnv.com
            </a>{" "}
            before you ride.
          </li>
          <li>
            <span className="text-lvinit-black">Ridership and performance.</span>{" "}
            I found no published numbers since launch, so I won&rsquo;t say how
            well it&rsquo;s working.
          </li>
          <li>
            <span className="text-lvinit-black">A finished date.</span>{" "}
            &ldquo;Largely complete by end of 2026&rdquo; is the RTC&rsquo;s
            expectation as of Fox5&rsquo;s September 30 report.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I haven&rsquo;t ridden it for this piece, and there are no LVINIT
          photos of the line yet, so this page has no imagery rather than a
          stand-in. That ride is on my list.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Mass Transit Magazine</span>,
            RTC launch release.{" "}
            <a
              href="https://www.masstransitmag.com/bus/infrastructure/news/55395800/regional-transportation-commission-of-southern-nevada-rtc-rtc-of-southern-nevadas-red-line-brt-to-begin-passenger-service-aug-23"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              masstransitmag.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Cone
            Zone, September 30, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/09/30/cone-zone-maryland-parkway-construction-still-underway-despite-red-line-bus-launch/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, launch
            preview, August 4, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/08/04/rtc-launch-new-rapid-transit-route-las-vegas/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, end of major
            construction and business impact.{" "}
            <a
              href="https://www.ktnv.com/neighborhoods/east-las-vegas/rtc-says-end-of-major-red-line-construction-nears-as-maryland-parkway-businesses-push-through-losses"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
