import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryGallery,
  StoryLede,
  StorySection,
} from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY — Municipal Gym at Downtown Summerlin. Built by the LVINIT
// Daily Publisher from Local Radar assignment LR-MUNICIPAL-GYM-DOWNTOWN-SUMMERLIN.
//
// FACT DISCIPLINE — read this run:
// - municipalgym.com (official, Oct 29, 2026): "Coming Soon" to Summerlin;
//   Nov 2 Pre-Opening Founding Members Sale; posted rates; month-to-month,
//   ten-day cancellation notice, 16+; no address or opening date on the page.
// - Fox5, Oct 22, 2026: free pre-opening workout Tue Oct 20 on The Lawn;
//   2315 Summa Drive; opening early 2027; one-day online-only sale Mon Nov 2;
//   no individual quoted; square footage not stated.
// - News 3, Nov 14, 2024: 32,000 sq ft former Bed Bath & Beyond space, south
//   end of the center; first Municipal Gym; EoS Fitness; then expected to open
//   by 2026; amenity list (2024).
// DELIBERATELY OMITTED: firm opening date, whether the 2024 square footage and
// amenity list are unchanged, contract/fee terms beyond the posted page,
// celebrity quotes, anything from the unread Review-Journal piece.
// IMAGERY — Hero is the LVINIT-supplied storefront photo at 2315 Summa Drive
// (added 2026-10-29), showing Municipal Gym signage and "Future Home" window
// graphics reading "late winter 2026". The two Downtown Summerlin drone stills
// (Aug 19, 2026) are CONTEXT only, and their captions say so.
// ---------------------------------------------------------------------------

const HERO =
  "/images/municipal-gym-storefront-downtown-summerlin-coming-soon.webp";
const HERO_ALT =
  "Storefront at 2315 Summa Drive in Downtown Summerlin with Municipal Gym signage over the doors, Future Home window graphics reading late winter 2026, a blue panel above the entrance and two palm trees.";
const LAWN =
  "/images/editorial/downtown-summerlin-park-lawn-mountains-aerial.jpg";
const LAWN_ALT =
  "Aerial view of a green park lawn and tree-lined parking at Downtown Summerlin with desert mountains in the distance.";
const RETAIL =
  "/images/editorial/downtown-summerlin-retail-lawn-hotel-tower-aerial.jpg";
const RETAIL_ALT =
  "Aerial view of Downtown Summerlin lawns and retail buildings with a hotel tower and desert mountains behind.";

const PATH = "/guides/municipal-gym-downtown-summerlin";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title:
    "Municipal Gym at Downtown Summerlin: What We Know Before the Nov. 2 Sale | LVINIT",
  headline:
    "Municipal Gym Is Coming to Downtown Summerlin: What We Know Before the Nov. 2 Founding Sale",
  description:
    "Mark Wahlberg's Municipal Gym is headed to 2315 Summa Drive at Downtown Summerlin, with a one-day Founding Members sale Nov. 2. Posted rates, terms and what's still unconfirmed.",
  path: PATH,
  image: HERO,
  imageWidth: 1148,
  imageHeight: 736,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-29",
  dateModified: "2026-10-29",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Municipal Gym at Downtown Summerlin", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function MunicipalGymDowntownSummerlinPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline:
          "Municipal Gym Is Coming to Downtown Summerlin: What We Know Before the Nov. 2 Founding Sale",
        subheadline:
          "A luxury-style gym with a Mark Wahlberg name on it is taking over the old Bed Bath & Beyond space. It isn't open, but a one-day pricing sale is days away. Here's what's published and what isn't.",
        image: HERO,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on Summerlin and how the valley's neighborhoods compare.",
        stories: [
          {
            name: "Summerlin Neighborhood Guide",
            href: "/neighborhoods/summerlin",
            category: "Neighborhoods",
            dek: "Villages, Summerlin West, Downtown Summerlin and what's being built.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparisons",
            dek: "Where amenities like this fit into the bigger decision.",
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
        heading: "Thinking about Summerlin?",
        body:
          "Amenities like a new gym are one piece of choosing where to live. Tell me what matters to you and I'll give you an honest read on where it fits.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="Municipal Gym, the fitness brand tied to actor Mark Wahlberg, is coming to Downtown Summerlin at 2315 Summa Drive. It is not open. Opening is listed as early 2027, and a one-day, online-only Founding Members sale is set for Monday, November 2. Here's what the official page and local reporting actually say."
      />

      <StorySection heading="What's confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Where:</span> 2315 Summa Drive
            at Downtown Summerlin (Fox5). News 3 reported in 2024 that the
            club takes over a{" "}
            <span className="text-lvinit-black">32,000-square-foot</span>{" "}
            former Bed Bath &amp; Beyond space on the south end of the center.
          </li>
          <li>
            <span className="text-lvinit-black">When:</span> early 2027, per
            Fox5. In 2024 News 3 reported it was expected to open by 2026, so
            the timeline has slipped. The official page says only
            &ldquo;Coming Soon.&rdquo;
          </li>
          <li>
            <span className="text-lvinit-black">The preview:</span> a free
            pre-opening workout was held Tuesday, October 20, on The Lawn at
            Downtown Summerlin. Attendees could join a waitlist for Founding
            Membership alerts (Fox5).
          </li>
          <li>
            <span className="text-lvinit-black">The sale:</span> a one-day,
            online-only Founding Members sale on Monday, November 2.
          </li>
          <li>
            <span className="text-lvinit-black">Who&rsquo;s behind it:</span>{" "}
            Mark Wahlberg and EōS Fitness leadership (Fox5). This would be the
            first Municipal Gym location.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="The posted pricing">
        <p className="text-body-lg text-lvinit-warmgray">
          The rates below are what{" "}
          <span className="text-lvinit-black">municipalgym.com</span> posts as
          of October 29. I&rsquo;m reporting them, not recommending them.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-body text-lvinit-warmgray">
            <thead>
              <tr className="border-b border-lvinit-black/20 text-lvinit-black">
                <th className="py-2 pr-4 font-semibold">Membership</th>
                <th className="py-2 pr-4 font-semibold">Nov. 2&ndash;30</th>
                <th className="py-2 pr-4 font-semibold">Dec. 1&ndash;28</th>
                <th className="py-2 font-semibold">Grand opening</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-lvinit-black/10">
                <td className="py-2 pr-4 text-lvinit-black">Municipal</td>
                <td className="py-2 pr-4">$99/mo</td>
                <td className="py-2 pr-4">$109/mo</td>
                <td className="py-2">$129/mo</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-lvinit-black">Municipal Mindset</td>
                <td className="py-2 pr-4">$129/mo</td>
                <td className="py-2 pr-4">$149/mo</td>
                <td className="py-2">$179/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The page lists memberships as month-to-month with a ten-day
          cancellation notice, for members 16 and older (16- and 17-year-olds
          need a guardian to sign). It also says promotional offers are
          limited-time, taxes and restrictions apply, rates vary by club and
          membership type, and discounted rates may not include locations in
          presale. The page also describes the $99 as a &ldquo;Founding Member
          rate&rdquo; on the one-day sale, which reads a little differently
          from the Nov. 2&ndash;30 window in the table. If you&rsquo;re
          considering it, read the terms on sale day.
        </p>
      </StorySection>

      <StoryGallery
        columns={2}
        images={[
          {
            src: LAWN,
            alt: LAWN_ALT,
            label: "Downtown Summerlin",
            caption:
              "A lawn and parking area at Downtown Summerlin from the air in August. Area context only, not the gym.",
          },
          {
            src: RETAIL,
            alt: RETAIL_ALT,
            label: "Downtown Summerlin",
            caption:
              "Downtown Summerlin's retail core from the air in August. Area context only, not the gym.",
          },
        ]}
      />

      <StorySection heading="What it means for Summerlin">
        <p className="text-body-lg text-lvinit-warmgray">
          Downtown Summerlin already works as the area&rsquo;s walkable hub for
          dining, shopping and events, as I cover in the{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            Summerlin neighborhood guide
          </Link>
          . A large fitness club with recovery services adds a daily-use
          reason to be there, not just a dinner-and-shopping one. Fox5 says
          members will get advanced recovery, longevity-focused wellness and
          spa-inspired amenities. That&rsquo;s the same kind of thing people
          weigh when they compare{" "}
          <Link href="/guides/summerlin-vs-henderson" className={linkCls}>
            Summerlin and Henderson
          </Link>
          : what&rsquo;s close enough to use every week.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Premium gyms are also a category with a lot of options in the valley.
          Whether this one is worth the monthly price depends on how you work
          out and how close you live, and nothing published yet lets me judge
          the experience. New to the area? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="What's still unconfirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">A firm opening date.</span>{" "}
            &ldquo;Early 2027&rdquo; is what Fox5 reported. The storefront
            window graphics in the photo above read &ldquo;late winter
            2026,&rdquo; which looks older than that report, so I&rsquo;m
            going with the later, published timeline.
          </li>
          <li>
            <span className="text-lvinit-black">The final amenity list.</span>{" "}
            News 3&rsquo;s 2024 report listed cryotherapy, compression therapy,
            infrared saunas, eucalyptus steam rooms, cold plunges, red light
            therapy, a juice bar and cafe, and retail. The official page
            today doesn&rsquo;t list specifics, so treat that as the 2024
            plan, not a current menu.
          </li>
          <li>
            <span className="text-lvinit-black">The current square footage.</span>{" "}
            The 32,000 figure is from 2024.
          </li>
          <li>
            <span className="text-lvinit-black">Contract and fee details</span>{" "}
            beyond what&rsquo;s on the posted page.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I haven&rsquo;t been inside, and there&rsquo;s nothing to tour yet:
          the space is still in buildout.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Municipal Gym</span>, official
            site, read October 29, 2026.{" "}
            <a
              href="https://municipalgym.com"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              municipalgym.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>,
            pre-opening workout coverage, October 22, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/10/22/mark-wahlberg-municipal-gym-brings-free-pre-opening-workout-downtown-summerlin/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News 3 Las Vegas</span>,
            announcement coverage, November 14, 2024.{" "}
            <a
              href="https://www.news3lv.com/news/local/luxury-gym-from-actor-mark-wahlberg-coming-to-downtown-summerlin"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
