import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY — Holiday lights around the Las Vegas Valley, 2026 season:
// Glittering Lights (LVMS), Opportunity Village's Magical Forest, Ethel M
// Chocolates Cactus Garden and Enchant at Las Vegas Ballpark.
// Built by the LVINIT Daily Publisher from Local Radar assignment
// LR-HOLIDAY-LIGHTS-GUIDE-2026.
//
// FACT DISCIPLINE — every official page re-read this run (2026-11-26):
// - Opportunity Village Magical Forest page: Nov 27-29, Dec 3-24, Dec 26-Jan 1;
//   Sun-Thu 5:30-9 p.m., Fri-Sat 5:30-9:30 p.m.; box office closes 30 min
//   before close; tickets date-specific (new this year), non-refundable,
//   online purchase recommended; seniors 65+ $3 off, military/first
//   responders $5 off, kids 3 and under free; bulk 10+ $19/$21; free parking
//   in the CSN lot; 6300 W. Oakey Blvd (Linda Smith and Christopher Smith
//   Family Campus); Forest Express train, Avalanche Slide, carousel, mini golf,
//   Santa, Cookie Cabin, midway games ($5). Standard price NOT printed.
// - Glittering Lights official site: drive-thru at LVMS, 7000 Las Vegas Blvd
//   N; 3 miles; 600+ displays; "6 million lights"; nightly from 5 p.m., 7 days;
//   carload $39 cash on site / $44 card; season pass about $149 per vehicle;
//   Fast Pass select nights (no price); GPS warning, use I-15 exit 54 Speedway
//   Blvd; portion of every ticket supports local charities. No 2026-27 season
//   dates printed (LVMS listing Jan 4 vs Fox5 Jan 3) -> "through early January".
// - Ethel M Cactus Garden page: nightly Nov 5-Jan 3 from 5 p.m.; 10 p.m. close
//   except Dec 24, Dec 31, Jan 1 (8 p.m.); closed Dec 25; $3 per person, under
//   2 and 65+ free; cash or card; no reservations for garden entry; proceeds
//   to HELP of Southern Nevada and Three Square; Santa photos $35/$50/$20 extra,
//   Santa through Dec 23 only; park in Ethel M lots or the Smith's lot across
//   the street, NOT Green Valley Business Park or Roseman (towed);
//   2 Cactus Garden Dr, Henderson 89014.
// - Enchant Las Vegas page: Las Vegas Ballpark; "Open Through December 27";
//   light maze; Santa; live entertainment; shopping village; add-ons (ice
//   skating, snow slide, s'mores) vary by market; arrival windows; Premier
//   Pass $30. No start date, hours or GA price printed.
// MUST NOT CLAIM / OMITTED: Glittering Lights exact closing date; Magical
// Forest and Enchant GA prices; Enchant start date; that any venue is open
// Thanksgiving night (no venue lists Thanksgiving hours); Magical Forest open
// Nov 30-Dec 2 or Dec 25; Fox5's free nights for veterans/teachers (not on the
// official site this run); named Glittering Lights beneficiary; any LVINIT
// visit.
// IMAGERY — No LVINIT photography of any of these displays exists in the
// image library and none was added the morning of publication. Photoless
// StoryHero and no card image, per the standard fallback. No venue or news
// photos (no rights).
// ---------------------------------------------------------------------------

const PATH = "/guides/holiday-lights-las-vegas-2026";
const TITLE =
  "Where to See Holiday Lights in Las Vegas This Year: Glittering Lights, Magical Forest, Ethel M and Enchant";
const MAGICAL_FOREST_URL = "https://www.opportunityvillage.org/pages/magical-forest";
const GLITTERING_URL = "https://www.glitteringlightslasvegas.com/";
const ETHEL_M_URL = "https://www.ethelm.com/cactusgardenholidaylights.html";
const ENCHANT_URL = "https://enchantchristmas.com/las-vegas/";
const LVMS_URL = "https://www.lvms.com/events/glittering-lights/";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const listCls = "mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray";
const pCls = "text-body-lg text-lvinit-warmgray";

const meta: StoryMeta = {
  title: "Holiday Lights in Las Vegas 2026: Dates, Hours & Tips | LVINIT",
  headline: TITLE,
  description:
    "The four big holiday light displays around Las Vegas this season: Glittering Lights at the Speedway, Opportunity Village's Magical Forest, the Ethel M cactus garden in Henderson and Enchant at Las Vegas Ballpark. Dates, hours, what it costs and what to know.",
  path: PATH,
  datePublished: "2026-11-26",
  dateModified: "2026-11-26",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Holiday Lights in Las Vegas", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function HolidayLightsLasVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "Four displays, four very different nights out, in different parts of the valley. Here's when each one runs, roughly what it costs, and the stuff the ticket page buries.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More things worth knowing about around the valley.",
        stories: [
          {
            name: "The Binion’s Horseshoe sign relights",
            href: "/guides/binions-horseshoe-sign-neon-museum-relighting-downtown-las-vegas",
            category: "Local Feature",
            dek: "Another reason to be out after dark in early December.",
          },
          {
            name: "Opportunity Village’s Northwest Campus",
            href: "/guides/opportunity-village-northwest-campus-bettys-village-north-las-vegas",
            category: "Local Feature",
            dek: "What the nonprofit behind Magical Forest is building off Decatur and the 215.",
          },
          {
            name: "Moving to Las Vegas",
            href: "/guides/moving-to-las-vegas",
            category: "Moving Here",
            dek: "The practical starting point if you're new here.",
          },
        ],
      }}
      ctas={{
        heading: "New to the valley this year?",
        body:
          "Holiday nights out are a good way to see how different parts of town feel. If you're trying to figure out where you'd actually want to live, ask me.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="Las Vegas has four big holiday light displays this season, and they're nothing alike. Glittering Lights is a three-mile drive-thru at the Las Vegas Motor Speedway. Opportunity Village's Magical Forest is a walk-through with rides on its Oakey Boulevard campus, and it opens Friday, Nov. 27. The Ethel M cactus garden in Henderson is the cheap, easy one at $3 a person. Enchant is the big ticketed light maze at Las Vegas Ballpark in Downtown Summerlin. Here's what each one is, when it runs and what to know before you go."
      />

      <StorySection heading="The quick version">
        <ul className={listCls.replace("mt-5 ", "")}>
          <li>
            <span className="text-lvinit-black">Glittering Lights</span>{" "}
            (Las Vegas Motor Speedway, northeast valley): Stay in your car.
            Nightly from 5 p.m. through early January. Priced per carload.
          </li>
          <li>
            <span className="text-lvinit-black">Magical Forest</span>{" "}
            (Opportunity Village, 6300 W. Oakey Blvd.): Walk through, with
            rides and Santa. Opens Nov. 27, runs through Jan. 1, with some
            closed nights. Date-specific tickets.
          </li>
          <li>
            <span className="text-lvinit-black">Ethel M Cactus Garden</span>{" "}
            (2 Cactus Garden Dr., Henderson): Walk through a lit cactus
            garden. Nightly through Jan. 3. $3 a person, no reservation.
          </li>
          <li>
            <span className="text-lvinit-black">Enchant</span> (Las Vegas
            Ballpark, Downtown Summerlin): A ticketed light maze with
            add-ons. Running now through Dec. 27. Timed arrival windows.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Glittering Lights at the Las Vegas Motor Speedway">
        <p className={pCls}>
          This is the one where nobody has to get out of the car, which makes
          it the easy pick with little kids, grandparents or anyone who
          doesn&rsquo;t want to walk around in the cold. The official site
          describes it as a three-mile drive through more than 600 light
          displays at the Speedway, 7000 Las Vegas Blvd. N.
        </p>
        <ul className={listCls}>
          <li>
            <span className="text-lvinit-black">When:</span> Open seven days
            a week, nightly from 5 p.m. The season started in early
            November. The site doesn&rsquo;t print this season&rsquo;s end
            date, and the Speedway&rsquo;s own listing and news coverage
            are a day apart, so plan on early January and check before you
            go late in the run.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> Priced per
            vehicle. A carload is $39 cash on site or $44 by card, and a
            season pass is about $149 per vehicle. A Fast Pass is offered on
            select nights; the site doesn&rsquo;t list its price.
          </li>
          <li>
            <span className="text-lvinit-black">Getting there:</span> The
            organizers say not to trust your GPS, which can send you to a
            spot with no entry. Take I-15 north to exit 54, Speedway
            Boulevard, and follow the signs.
          </li>
          <li>
            <span className="text-lvinit-black">Good to know:</span> The
            organizers say a portion of every ticket supports local
            charities. The Speedway is up I-15 in the northeast valley,
            so from Henderson or Summerlin, build the drive into the night.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Opportunity Village’s Magical Forest">
        <p className={pCls}>
          Magical Forest is a
          full night out rather than a quick look. It&rsquo;s on Opportunity
          Village&rsquo;s campus at 6300 W. Oakey Blvd., and on top of the
          lights there&rsquo;s the Forest Express train, a 50-foot snow-covered
          slide, a carousel, an eight-hole mini golf course, the Cookie Cabin,
          midway games, gift shops and Santa. Opportunity Village is the Las
          Vegas nonprofit that serves people with intellectual and
          developmental disabilities. It&rsquo;s also building a{" "}
          <Link
            href="/guides/opportunity-village-northwest-campus-bettys-village-north-las-vegas"
            className={linkCls}
          >
            new Northwest Campus off Decatur and the 215
          </Link>
          .
        </p>
        <ul className={listCls}>
          <li>
            <span className="text-lvinit-black">When:</span> Nov. 27-29,
            Dec. 3-24 and Dec. 26 through Jan. 1. It&rsquo;s closed Nov. 30
            through Dec. 2 and on Christmas Day, so don&rsquo;t plan on the
            Monday after Thanksgiving weekend.
          </li>
          <li>
            <span className="text-lvinit-black">Hours:</span> 5:30 to 9
            p.m. Sunday through Thursday, 5:30 to 9:30 p.m. Friday and
            Saturday. The box office closes 30 minutes before closing.
          </li>
          <li>
            <span className="text-lvinit-black">Tickets:</span> New this
            year, tickets are for a specific date, and sales are final.
            Opportunity Village recommends buying online, since on-site
            sales may not get you in on a sold-out night. The page
            doesn&rsquo;t list standard prices, so check the{" "}
            <a href={MAGICAL_FOREST_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              Magical Forest page
            </a>{" "}
            when you buy. Posted discounts: $3 off for seniors 65 and older,
            $5 off for military and first responders, and free for kids 3
            and under. Midway games are $5 each.
          </li>
          <li>
            <span className="text-lvinit-black">Parking:</span> Free, in the
            College of Southern Nevada lot.
          </li>
          <li>
            <span className="text-lvinit-black">Good to know:</span> Rides
            have a 42-inch height requirement unless a guardian rides along.
            It&rsquo;s all outdoors, so dress for an actual desert winter
            night, which gets colder than newcomers expect.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Ethel M Chocolates Cactus Garden in Henderson">
        <p className={pCls}>
          The Ethel M cactus garden is the low-effort option. You walk the
          garden paths among cactus and desert plants wrapped in lights, then
          go into the chocolate shop if you want. Admission is $3 a person.
          That makes it an easy stop on a weeknight, or the thing you do when
          family is in town and nobody wants to commit to a whole evening.
          It&rsquo;s at 2 Cactus Garden Dr. in Henderson, next to the
          Green Valley Business Park.
        </p>
        <ul className={listCls}>
          <li>
            <span className="text-lvinit-black">When:</span> Nightly from 5
            p.m. through Jan. 3, until 10 p.m. most nights. It closes at 8
            p.m. on Christmas Eve, New Year&rsquo;s Eve and New Year&rsquo;s
            Day, and it&rsquo;s closed Christmas Day.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> $3 per person,
            cash or card. Kids under 2 and seniors 65 and older get in free.
            Ethel M says the entrance fee supports HELP of Southern Nevada
            and Three Square Food Bank.
          </li>
          <li>
            <span className="text-lvinit-black">Reservations:</span> Not
            needed for the garden. Some extras, like the Santa Express Pass,
            trivia nights and chocolate tastings, do require booking.
          </li>
          <li>
            <span className="text-lvinit-black">Santa:</span> Santa photos
            run $35 for one, $50 for two and $20 for each additional photo.
            Santa is only there through Wednesday, Dec. 23.
          </li>
          <li>
            <span className="text-lvinit-black">Parking:</span> Use the Ethel
            M lots or the Smith&rsquo;s lot across the street. Ethel M warns
            that cars parked in the Green Valley Business Park or Roseman
            University lots will be towed.
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          If you&rsquo;re weighing that side of town as a place to live, our{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson guide
          </Link>{" "}
          covers it.
        </p>
      </StorySection>

      <StorySection heading="Enchant at Las Vegas Ballpark">
        <p className={pCls}>
          Enchant is the big production. It sets up a Christmas light maze
          inside Las Vegas Ballpark in Downtown Summerlin, with Santa, live
          entertainment and caroling, and a shopping village of vendors. Ice
          skating, a snow slide and a s&rsquo;mores pit are listed as
          add-ons.
        </p>
        <ul className={listCls}>
          <li>
            <span className="text-lvinit-black">When:</span> Already running,
            and the official page says it&rsquo;s open through Dec. 27.
            That&rsquo;s earlier than the other three, so don&rsquo;t leave it
            for the week between Christmas and New Year&rsquo;s.
          </li>
          <li>
            <span className="text-lvinit-black">Tickets:</span> You pick an
            arrival window when you buy. That&rsquo;s the earliest you can
            enter, and once you&rsquo;re in you can stay as long as you like.
            The{" "}
            <a href={ENCHANT_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              Enchant page
            </a>{" "}
            doesn&rsquo;t list general admission prices up front, so check
            your date there. The optional Premier Pass upgrade is $30 and
            includes a drink, a gift and fast-pass access for activities.
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          The ballpark sits right in Downtown Summerlin, so it&rsquo;s easy to
          pair with dinner nearby. Our{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            Summerlin guide
          </Link>{" "}
          has more on that part of town.
        </p>
      </StorySection>

      <StorySection muted heading="How to pick">
        <ul className={listCls.replace("mt-5 ", "")}>
          <li>
            <span className="text-lvinit-black">Cheapest and easiest:</span>{" "}
            Ethel M. It&rsquo;s $3, you don&rsquo;t need a reservation and you
            can be in and out.
          </li>
          <li>
            <span className="text-lvinit-black">Cold night, little kids or
            anyone who&rsquo;d rather not walk:</span> Glittering Lights, from
            the car.
          </li>
          <li>
            <span className="text-lvinit-black">A full night with rides:</span>{" "}
            Magical Forest. Buy for a specific date and skip Nov. 30 to Dec. 2.
          </li>
          <li>
            <span className="text-lvinit-black">The big ticketed
            production:</span> Enchant, before it closes Dec. 27.
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          One note for tonight. None of the four lists special Thanksgiving
          hours, so if you&rsquo;re hoping to go on Thanksgiving night, check
          the venue first. And Magical Forest doesn&rsquo;t open until Friday,
          Nov. 27.
        </p>
      </StorySection>

      <StorySection heading="Before you go">
        <p className={pCls}>
          Dates and prices here come from each venue&rsquo;s own site as of
          Nov. 26. Venues do change hours for weather and sell-outs, so check
          the official page the day you go. LVINIT hasn&rsquo;t visited these
          displays for this story, so there are no photos here instead of
          borrowed ones. We&rsquo;ll add our own when we have them.
        </p>
        <p className={`mt-5 ${pCls}`}>
          If this is your first winter here, the{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>{" "}
          guide covers the basics. If you want another night out in early
          December, the{" "}
          <Link
            href="/guides/binions-horseshoe-sign-neon-museum-relighting-downtown-las-vegas"
            className={linkCls}
          >
            Binion&rsquo;s Horseshoe sign relighting at the Neon Museum
          </Link>{" "}
          is Dec. 1.
        </p>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Glittering Lights Las Vegas</span>,
            official site.{" "}
            <a href={GLITTERING_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              glitteringlightslasvegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Motor Speedway</span>,
            Glittering Lights event listing.{" "}
            <a href={LVMS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              lvms.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Opportunity Village</span>,
            Magical Forest.{" "}
            <a href={MAGICAL_FOREST_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              opportunityvillage.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Ethel M Chocolates</span>,
            Holiday Lights at the Cactus Garden.{" "}
            <a href={ETHEL_M_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              ethelm.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Enchant Christmas</span>,
            Las Vegas.{" "}
            <a href={ENCHANT_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              enchantchristmas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>,
            Glittering Lights 2026 season coverage, Nov. 7, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/11/07/glittering-lights-returns-las-vegas-motor-speedway-2026-season/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
