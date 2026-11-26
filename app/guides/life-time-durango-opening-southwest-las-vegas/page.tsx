import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY — Life Time Durango, 8555 W. Sunset Rd, southwest Las Vegas
// (Durango Dr and Sunset Rd, across from IKEA). Built by the LVINIT Daily
// Publisher from Local Radar assignment LR-LIFE-TIME-DURANGO.
//
// FACT DISCIPLINE — read this run (2026-11-20):
// - lifetime.life/locations/nv/durango.html (read): "Arriving December 14.
//   Become a member today and receive preopening benefits." 8555 West Sunset
//   Road, Las Vegas, NV 89113; 725-277-6200; 128,000 square feet; 15 acres.
//   No pricing; dues "may vary by location and are subject to change."
// - experiencelife.lifetime.life "Step Inside Life Time Durango" (read; Sept 8,
//   2026, Life Time's own publication): 200th location; third Life Time
//   athletic country club in the Las Vegas area; indoor six-lane lap pool,
//   six-lane lesson pool and leisure pool; outdoor leisure pool, six-lane pool,
//   waterslides, 12 cabanas, bistro; six indoor pickleball courts plus a
//   lounge; LifeSpa with 8 styling stations and 5 treatment rooms; Kids Academy
//   ages 3 months to 11 years; hydrotherapy suites in the locker rooms (sauna,
//   steam, whirlpool, cold plunge); third-floor workout floor; LT Recovery
//   zone; LifeCafe; Life Time Work standalone coworking reached from the
//   second floor, separate membership; LifeClinic chiropractic at extra cost.
// - lifetime.life/lp/neighborhood/durango.html (read): "A Durango membership
//   includes access to Life Time Summerlin and Life Time Green Valley."
//   "Membership pricing is not yet available." Pre-opening benefits listed.
//   (That page still says "Arriving Late 2026"; the location page has the
//   newer Dec. 14 date, so the article attributes the date to Life Time and
//   calls it scheduled.)
// DELIBERATELY OMITTED (unresolved / mustNotClaim): any price or founding rate;
// investment/construction cost ($29M is unverified); the RJ's 125,500 sq ft
// figure; grand-opening event details and hours; history of the site; any
// claim the club is open; any claim LVINIT toured it; any endorsement.
// IMAGERY — No Life Time or Durango/Sunset photography exists in the image
// library and no first-party media was added before this run. Photoless
// StoryHero and no card image, per the standard fallback. No Life Time
// renderings (rights not confirmed) and no generic southwest aerials standing
// in for this site.
// ---------------------------------------------------------------------------

const PATH = "/guides/life-time-durango-opening-southwest-las-vegas";
const TITLE =
  "Life Time Durango Is Set to Open Dec. 14. Here's What's Going Into the Big Club Across From IKEA";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title: "Life Time Durango Opening Dec. 14: What's Inside | LVINIT",
  headline: TITLE,
  description:
    "Life Time says its 128,000-square-foot Durango club at Durango and Sunset, across from IKEA, is arriving Dec. 14. Pools, pickleball, kids space and coworking: what's planned and what isn't public yet.",
  path: PATH,
  datePublished: "2026-11-20",
  dateModified: "2026-11-20",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Life Time Durango", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function LifeTimeDurangoPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "The building at Durango and Sunset has a date. Here's what Life Time says is inside, who it's for, and what still isn't public.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's opening and being built in the southwest valley.",
        stories: [
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Neighborhoods",
            dek: "The full LVINIT guide to the area, Durango corridor included.",
          },
          {
            name: "Mountain's Edge rec center and park",
            href: "/guides/mountains-edge-recreation-center-regional-park-phase-ii-southwest-las-vegas",
            category: "Growth & Development",
            dek: "The public-side rec center and park expansion Clark County just approved.",
          },
          {
            name: "Pavilion Center Pool",
            href: "/guides/pavilion-center-pool-olympic-size-aquatics-summerlin",
            category: "Local Feature",
            dek: "The city's new Olympic-size public pool in Summerlin.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about living near Durango?",
        body:
          "This corner of the southwest is changing fast. Tell me what you want close to home and I'll give you a straight answer on which neighborhoods fit.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="If you've driven past Durango and Sunset lately, you've seen it: the huge new building on the southeast corner, across Sunset from IKEA. It's Life Time Durango, and Life Time's own location page now says it's arriving December 14. The company describes it as a 128,000-square-foot athletic country club on 15 acres, with indoor and outdoor pools, indoor pickleball, kids space and coworking under one roof."
      />

      <StorySection heading="What it is and where">
        <p className="text-body-lg text-lvinit-warmgray">
          Life Time Durango is at 8555 W. Sunset Road, on the southeast corner
          of Durango Drive and Sunset Road, just west of the 215. IKEA is
          directly across Sunset, which is how most people out here are going
          to describe it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          According to Life Time, it&rsquo;s the company&rsquo;s 200th
          location and its third athletic country club in the Las Vegas area,
          after Life Time Summerlin and Life Time Green Valley. Martin Martinez, who leads the Durango club, put the reason
          simply in Life Time&rsquo;s own write-up: &ldquo;Las Vegas is
          growing, and we need to grow along with it.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          One thing to be clear on: December 14 is the date Life Time is
          advertising. As of today the club isn&rsquo;t open, and opening
          dates for buildings this size can move.
        </p>
      </StorySection>

      <StorySection muted heading="What Life Time says is inside">
        <p className="text-body-lg text-lvinit-warmgray">
          Life Time published a detailed walkthrough in September. The
          highlights:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Indoor pools.</span> A
            six-lane lap pool, a six-lane lesson pool and a leisure pool.
          </li>
          <li>
            <span className="text-lvinit-black">An outdoor pool deck.</span> A
            leisure pool, another six-lane pool, waterslides, 12 cabanas and a
            bistro.
          </li>
          <li>
            <span className="text-lvinit-black">Six indoor pickleball courts</span>{" "}
            plus a pickleball lounge. Indoor is the key word in a city where
            outdoor courts are rough from June to September.
          </li>
          <li>
            <span className="text-lvinit-black">A third-floor workout floor</span>{" "}
            with free weights, machines and cardio, plus studio space for
            group classes, yoga and reformer Pilates.
          </li>
          <li>
            <span className="text-lvinit-black">Recovery.</span> Hydrotherapy
            suites in the men&rsquo;s and women&rsquo;s locker rooms with a
            sauna, steam room, whirlpool and cold plunge, and a separate
            recovery zone with massage chairs and compression gear.
          </li>
          <li>
            <span className="text-lvinit-black">Kids Academy</span> for ages 3
            months to 11 years, with a kids gym, studios and infant and toddler
            areas.
          </li>
          <li>
            <span className="text-lvinit-black">LifeSpa and LifeCafe.</span>{" "}
            The spa has eight styling stations and five treatment rooms.
          </li>
          <li>
            <span className="text-lvinit-black">Coworking.</span> A Life Time
            Work lounge inside the club, plus a standalone Life Time Work
            office space reached from the second floor. The standalone space
            needs its own membership.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Life Time also lists chiropractic care through its LifeClinic, by
          appointment and at extra cost. This list comes from Life Time. LVINIT
          hasn&rsquo;t been inside the building.
        </p>
      </StorySection>

      <StorySection heading="What membership covers, and what it costs">
        <p className="text-body-lg text-lvinit-warmgray">
          Life Time&rsquo;s Durango sign-up page says a Durango membership
          includes access to Life Time Summerlin and Life Time Green Valley.
          That matters if you live in the southwest but work closer to one of
          the other two.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          On price, there&rsquo;s nothing to report yet. The same page says
          membership pricing isn&rsquo;t available, and the location page
          says dues vary by location and can change. Life Time is offering
          pre-opening benefits to people who join before the club opens,
          including what it calls preferred pre-opening pricing, but it
          doesn&rsquo;t publish the number. If price is the deciding factor,
          the only real answer is to call the club at 725-277-6200 and ask.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Worth saying plainly: this is a private, paid club, and
          LVINIT isn&rsquo;t affiliated with Life Time. It&rsquo;s on our
          radar because of what it adds to this part of town, not because
          we&rsquo;re recommending it over anything else.
        </p>
      </StorySection>

      <StorySection muted heading="Why it matters for the southwest">
        <p className="text-body-lg text-lvinit-warmgray">
          Until now, if you lived in Enterprise, Spring Valley or around
          Rhodes Ranch and wanted a Life Time, you were driving to Summerlin
          or Green Valley. Durango and Sunset puts
          one in the middle of the southwest, right off the 215.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It also adds to how much the Durango corridor has filled in. Between
          the IKEA, the newer office and retail around the 215, and the
          projects tracked in our{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas guide
          </Link>
          , this stretch is becoming a place people go, not just drive through.
          Expect more traffic at Durango and Sunset once it opens, on top of
          the county&rsquo;s ongoing ramp work at the 215 interchanges there.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you don&rsquo;t want a private membership, the public side of
          the southwest is growing too. Clark County just approved a builder
          for a{" "}
          <Link
            href="/guides/mountains-edge-recreation-center-regional-park-phase-ii-southwest-las-vegas"
            className={linkCls}
          >
            new Mountain&rsquo;s Edge recreation center and park expansion
          </Link>
          , a{" "}
          <Link
            href="/guides/echo-trail-park-community-center-southwest-las-vegas"
            className={linkCls}
          >
            community center is planned at Echo Trail Park
          </Link>
          , and the{" "}
          <Link
            href="/guides/blue-diamond-wash-trail-southwest-las-vegas"
            className={linkCls}
          >
            Blue Diamond Wash Trail
          </Link>{" "}
          is under construction. For a public pool, the city&rsquo;s{" "}
          <Link
            href="/guides/pavilion-center-pool-olympic-size-aquatics-summerlin"
            className={linkCls}
          >
            Pavilion Center Pool
          </Link>{" "}
          in Summerlin is the big recent one. And if you&rsquo;re still
          deciding where in the valley to land, start with{" "}
          <Link
            href="/guides/summerlin-vs-henderson-vs-southwest-las-vegas"
            className={linkCls}
          >
            Summerlin vs. Henderson vs. Southwest Las Vegas
          </Link>{" "}
          or{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="What isn't public yet">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Pricing.</span> Life Time
            hasn&rsquo;t published membership rates for Durango.
          </li>
          <li>
            <span className="text-lvinit-black">Opening-day details.</span>{" "}
            No grand-opening event or hours for December 14 are posted on the
            pages I read.
          </li>
          <li>
            <span className="text-lvinit-black">What it cost to build.</span>{" "}
            You may see a dollar figure floating around. I couldn&rsquo;t
            confirm one from a primary source, so I&rsquo;m leaving it out.
          </li>
          <li>
            <span className="text-lvinit-black">Photos.</span> There are no
            LVINIT photos of the club yet, so this page has no imagery rather
            than a rendering or a stand-in from somewhere else.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Life Time</span>, Life Time
            Durango location page (opening date, address, size, phone).{" "}
            <a
              href="https://www.lifetime.life/locations/nv/durango.html"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              lifetime.life
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Life Time</span>, Durango
            membership page (access to Summerlin and Green Valley, pricing
            status, pre-opening benefits).{" "}
            <a
              href="https://www.lifetime.life/lp/neighborhood/durango.html"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              lifetime.life
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Experience Life</span> (Life
            Time&rsquo;s publication), &ldquo;Step Inside Life Time
            Durango,&rdquo; September 8, 2026 (amenities, 200th location,
            third Las Vegas-area club).{" "}
            <a
              href="https://experiencelife.lifetime.life/article/step-inside-life-time-durango/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              experiencelife.lifetime.life
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
