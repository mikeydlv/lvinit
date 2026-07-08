import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buildStoryJsonLd, type Breadcrumb, type StoryMeta } from "@/lib/story";
import StoryHero, { type StoryHeroProps } from "./StoryHero";
import StoryBreadcrumbs from "./StoryBreadcrumbs";
import RelatedStories, { type RelatedStoriesProps } from "./RelatedStories";
import RelatedNeighborhood, {
  type RelatedNeighborhoodProps,
} from "./RelatedNeighborhood";
import StoryCTAs, { type StoryCTAsProps } from "./StoryCTAs";

export type StoryPageProps = {
  /** SEO + schema. Pair with `buildStoryMetadata(meta)` in the route's `metadata` export. */
  meta: StoryMeta;
  hero: StoryHeroProps;
  /**
   * Visible breadcrumb trail. Defaults to `meta.breadcrumbs`; pass `null` to
   * hide the visible trail while keeping the JSON-LD.
   */
  breadcrumbs?: Breadcrumb[] | null;
  /** The editorial body: a stack of StoryLede / StorySection / StoryVideo /
   *  StoryPullQuote / StoryGallery blocks. */
  children: React.ReactNode;
  relatedStories?: RelatedStoriesProps;
  relatedNeighborhood?: RelatedNeighborhoodProps;
  ctas?: StoryCTAsProps;
};

/**
 * The canonical LVINIT story page. Provides the fixed chrome (nav, footer,
 * JSON-LD) and the standard top-and-tail (hero → breadcrumbs → … → related →
 * CTAs) so every story shares one structure. The editorial middle is `children`,
 * so each story stays free to arrange its own sections.
 */
export default function StoryPage({
  meta,
  hero,
  breadcrumbs,
  children,
  relatedStories,
  relatedNeighborhood,
  ctas,
}: StoryPageProps) {
  const trail =
    breadcrumbs === null ? null : breadcrumbs ?? meta.breadcrumbs;
  const jsonLd = buildStoryJsonLd(meta);

  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-lvinit-white">
        <StoryHero {...hero} />

        <article>
          {trail && <StoryBreadcrumbs trail={trail} />}
          {children}
        </article>

        {relatedStories && <RelatedStories {...relatedStories} />}
        {relatedNeighborhood && <RelatedNeighborhood {...relatedNeighborhood} />}
        {ctas && <StoryCTAs {...ctas} />}
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
