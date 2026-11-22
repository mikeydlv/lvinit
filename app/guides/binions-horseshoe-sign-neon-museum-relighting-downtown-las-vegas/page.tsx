import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY — the restored 1988 Binion's Horseshoe sign relights at the
// Neon Museum's Neon Boneyard on Tue Dec 1, 2026 (Giving Tuesday). Built by the
// LVINIT Daily Publisher from Local Radar assignment
// LR-BINIONS-HORSESHOE-SIGN-NEON-MUSEUM.
//
// FACT DISCIPLINE — re-read this run (2026-11-22):
// - Neon Museum event page (read): "Binion's Horseshoe Relighting," Tuesday
//   Dec 1 (Giving Tuesday), 5-6 p.m., Neon Boneyard, 770 N. Las Vegas Blvd.,
//   ~1 hour. Tickets: Future Members $35, Discounted $30, Children 7-17
//   $17.50, Members free, 6 and under free. Champagne toast, stories about the
//   Binion's Horseshoe Hotel & Casino, celebration of community support for
//   preservation; western dress encouraged. Restoration made possible by Alise
//   and Roxy Roxborough; event support from Cashman Photo Enterprises.
// - Neon Museum homepage (read): open daily 3-11 p.m. Sept-May; 2026 Daytime
//   Admission (3-5 p.m.) from $25 and Evening Admission (5-11 p.m.) from $35
//   through Dec 31, 2026; tickets for Jan 1, 2027 onward become a single
//   "2027 Admission" (daily 3-11 p.m.) from $21. Phone (702) 387-6366.
// - Fox5, Nov 20, 2026 (read): 1988, 25 ft, one of three horseshoes, west
//   entrance near Fremont/First, Hartlauer restoration, remarks by Aaron
//   Berger and Katie O'Neill (Binion's Family Foundation); Nick and Danielle
//   Bogdanovich relight the sign.
// - News3LV, Nov 20, 2026 (read): designed by Rudy
//   Crisostomo, fabricated 1988 by YESCO, about 25 ft tall and 10 ft wide; one
//   of three horseshoe elements on the property; marked the west entrance at
//   Fremont and 1st. Restoration by the museum's collections and exhibitions
//   team with Hartlauer Signs: electrical upgrades, replacement lighting,
//   structural repairs, new base; original red-and-white paint kept under a
//   clear protective coat. Additional support from Events with a Twist.
//   Sign specs are attributed to News3LV/Fox5, not the museum.
// MUST NOT CLAIM: permanent display after Dec 1; ticket availability (sold out
// or not); restoration cost; that LVINIT has museum access or attended; sign
// specs as museum statements.
// IMAGERY — No Neon Museum, Fremont Street or Binion's photography exists in
// the image library and no first-party media was added before this run.
// Photoless StoryHero, no card image. No museum or news photos (no rights).
// ---------------------------------------------------------------------------

const PATH = "/guides/binions-horseshoe-sign-neon-museum-relighting-downtown-las-vegas";
const TITLE =
  "The Binion’s Horseshoe Sign Relights at the Neon Museum Dec. 1. Here’s What It Is and How to See It";
const EVENT_URL = "https://neonmuseum.org/whats-on/fy27-binions-horseshoe/";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title: "Binion's Horseshoe Sign Relighting at the Neon Museum, Dec. 1 | LVINIT",
  headline: TITLE,
  description:
    "The restored 1988 Binion's Horseshoe sign that once marked Fremont and 1st gets relit in the Neon Boneyard on Giving Tuesday, Dec. 1. What the sign is, what was restored, and what tickets cost.",
  path: PATH,
  datePublished: "2026-11-22",
  dateModified: "2026-11-22",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Binion's Horseshoe Sign Relighting", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function BinionsHorseshoeSignPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "A piece of Fremont Street history is getting its lights back in the Neon Boneyard. Here's the short version, and what to know before you buy a ticket.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's changing downtown.",
        stories: [
          {
            name: "Downtown & the Arts District",
            href: "/neighborhoods/downtown-arts-district",
            category: "Neighborhoods",
            dek: "The full LVINIT guide to living in and around downtown Las Vegas.",
          },
          {
            name: "The Third Street arts campus",
            href: "/guides/third-street-arts-campus-downtown-las-vegas",
            category: "Local Feature",
            dek: "What's planned for a new arts hub a few blocks from Fremont.",
          },
          {
            name: "The Foundry at Cashman",
            href: "/guides/the-foundry-lennar-cashman-downtown-las-vegas",
            category: "Local Feature",
            dek: "New homes going up on the old Cashman Center land, just up Las Vegas Boulevard.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about living near downtown?",
        body:
          "Downtown is one of the few parts of the valley with real history you can walk to. If you're curious what living close to it is actually like, ask me.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="For decades, a big red-and-white horseshoe marked the west entrance of Binion's at Fremont and 1st. That sign has been restored, and the Neon Museum is turning it back on. The museum will relight the 1988 Binion's Horseshoe sign in the Neon Boneyard on Tuesday, Dec. 1, Giving Tuesday, from 5 to 6 p.m., at a ticketed event with a champagne toast and stories about the old casino."
      />

      <StorySection heading="The sign">
        <p className="text-body-lg text-lvinit-warmgray">
          The horseshoe dates to 1988. News3LV reports it was designed by Rudy
          Crisostomo and fabricated by YESCO, the Young Electric Sign Company,
          and measures about 25 feet tall and 10 feet wide. Both News3LV and
          Fox5 say it was one of three horseshoe signs on the outside of the
          Binion&rsquo;s Horseshoe Hotel &amp; Casino, marking the west
          entrance near the corner of Fremont and 1st streets.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;ve walked the Fremont Street Experience, you know that
          corner. Binion&rsquo;s is one of the names that made downtown
          downtown, and the horseshoe was its calling card. Now one of those
          horseshoes lives at the Neon Museum, a short drive north up Las Vegas
          Boulevard.
        </p>
      </StorySection>

      <StorySection muted heading="What was restored">
        <p className="text-body-lg text-lvinit-warmgray">
          News3LV and Fox5 report the museum worked with Hartlauer Signs on
          the restoration: electrical upgrades,
          replacement lighting, structural repairs and a new base to stand it
          on. The original red-and-white paint was kept rather than repainted,
          sealed under a clear protective coat. That matters if you care about
          this kind of thing. You&rsquo;re looking at the 1988 finish, not a
          fresh reproduction.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Neon Museum credits Alise and Roxy Roxborough with making the
          restoration possible. Cashman Photo Enterprises is supporting the
          event, and News3LV also lists Events with a Twist. Nobody has
          published what the restoration cost.
        </p>
      </StorySection>

      <StorySection heading="The Dec. 1 relighting: what to know">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">When:</span> Tuesday, Dec. 1,
            2026, 5 to 6 p.m. The museum lists it at about an hour.
          </li>
          <li>
            <span className="text-lvinit-black">Where:</span> The Neon
            Boneyard at the Neon Museum, 770 N. Las Vegas Blvd., near Bonanza
            Road.
          </li>
          <li>
            <span className="text-lvinit-black">Tickets:</span> $35 for
            &ldquo;Future Members,&rdquo; $30 discounted, $17.50 for kids 7
            to 17. Museum members and kids 6 and under get in free.
          </li>
          <li>
            <span className="text-lvinit-black">What happens:</span> The
            relighting, a champagne toast, stories about Binion&rsquo;s, and
            a nod to the people who fund preservation work like this. Fox5
            reports remarks from museum CEO and Executive Director Aaron
            Berger and Katie O&rsquo;Neill of the Binion&rsquo;s Family
            Foundation, with former Binion&rsquo;s Horseshoe sports book
            director Nick Bogdanovich and his wife, Danielle, flipping the
            switch. The
            museum is leaning into a western theme and encourages guests to
            dress for it.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s a Giving Tuesday event, so ticket sales and any extra
          donations go toward the museum. Check availability on the{" "}
          <a
            href={EVENT_URL}
            className={extCls}
            target="_blank"
            rel="noopener noreferrer"
          >
            Neon Museum&rsquo;s event page
          </a>{" "}
          before you plan around it. I&rsquo;m not going to tell you
          it&rsquo;s open or sold out, because that can change by the hour.
          Questions go to the museum at (702) 387-6366.
        </p>
      </StorySection>

      <StorySection muted heading="Can’t make Dec. 1?">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s the honest answer: the museum hasn&rsquo;t said whether
          the sign stays on display in the Boneyard after the event. It would
          be unusual to restore a sign and then hide it, but until the museum
          says so, I won&rsquo;t promise it. Ask when you book.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re planning a regular visit, the museum&rsquo;s
          admission is changing. Through Dec. 31, 2026, it sells separate
          daytime tickets (3 to 5 p.m., from $25) and evening tickets (5 to
          11 p.m., from $35). For visits on Jan. 1, 2027 and later, those
          become one &ldquo;2027 Admission&rdquo; ticket, good any time from
          3 to 11 p.m., starting at $21. Locals who&rsquo;ve put off going
          because the night ticket felt steep may want to wait for January.
        </p>
      </StorySection>

      <StorySection heading="Why this one matters">
        <p className="text-body-lg text-lvinit-warmgray">
          Las Vegas doesn&rsquo;t keep much. Casinos get remodeled, renamed
          and imploded, and the signs usually go with them. The Boneyard is
          where some of them end up instead, and every one that gets its
          light back is a little more of the old town you can actually stand
          in front of, instead of just reading about.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It also fits a bigger pattern on this stretch of Las Vegas
          Boulevard. Between the Neon Museum, the{" "}
          <Link
            href="/guides/the-foundry-lennar-cashman-downtown-las-vegas"
            className={linkCls}
          >
            new homes planned at the old Cashman Center
          </Link>{" "}
          and the{" "}
          <Link
            href="/guides/third-street-arts-campus-downtown-las-vegas"
            className={linkCls}
          >
            Third Street arts campus
          </Link>
          , the north end of downtown is getting more reasons to stop. If
          you&rsquo;re trying to figure out whether downtown is a place
          you&rsquo;d want to live, not just visit, start with our{" "}
          <Link href="/neighborhoods/downtown-arts-district" className={linkCls}>
            Downtown &amp; Arts District guide
          </Link>{" "}
          or the bigger-picture{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>{" "}
          guide.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          LVINIT hasn&rsquo;t photographed the sign or the Boneyard for this
          story, so there are no photos here rather than borrowed ones.
          We&rsquo;ll add our own if we get them.
        </p>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The Neon Museum</span>,
            &ldquo;Binion&rsquo;s Horseshoe Relighting&rdquo; event page.{" "}
            <a
              href={EVENT_URL}
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              neonmuseum.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">The Neon Museum</span>,
            homepage (hours and 2026/2027 admission).{" "}
            <a
              href="https://neonmuseum.org/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              neonmuseum.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News3LV</span>, &ldquo;Neon
            Museum to relight restored Binion&rsquo;s Horseshoe sign,&rdquo;
            Nov. 20, 2026.{" "}
            <a
              href="https://news3lv.com/news/local/neon-museum-to-relight-restored-binions-horseshoe-sign-in-las-vegas-downtown-history-culture-nevada-casinos"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5</span>, &ldquo;Historic
            Binion&rsquo;s Horseshoe sign to shine again at Neon Museum,&rdquo;
            Nov. 20, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/11/20/historic-binions-horseshoe-sign-shine-again-neon-museum/"
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
