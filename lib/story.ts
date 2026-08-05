// ---------------------------------------------------------------------------
// STORY PAGE — shared types + SEO/schema helpers
// The single source of truth for LVINIT editorial "story" pages (lifestyle
// features, events, attractions, local experiences). See the components in
// components/story/ and the authoring standard in docs/STORY_PAGE_STANDARD.md.
//
// This pattern was EXTRACTED from the shipped Summerlin guide + Fourth of July
// Parade feature. It does not change those pages; it just makes the same shape
// reusable for the dozens of stories to come.
// ---------------------------------------------------------------------------

import type { Metadata } from "next";

export const SITE_URL = "https://www.lvinit.com";
export const DEFAULT_AUTHOR = "Mikey Del Rosario";

/** One crumb in the breadcrumb trail. `path` is root-relative, e.g. "/neighborhoods/summerlin". */
export type Breadcrumb = { name: string; path: string };

/**
 * VideoObject inputs for a story that features a video. When present on a
 * `StoryMeta`, `buildStoryJsonLd` emits a `VideoObject` into the @graph next to
 * the Article + BreadcrumbList. Provide only verified metadata — never fabricate
 * viewCount, ratings, or interactionStatistic.
 */
export type StoryVideoMeta = {
  /** The video's real name/title. */
  name: string;
  /** Short, accurate description of the video. */
  description: string;
  /** Thumbnail: root-relative (e.g. "/images/…jpg", absolutized here) or a full URL. */
  thumbnailUrl: string;
  /** ISO date (YYYY-MM-DD) the video was published. Must be real. */
  uploadDate: string;
  /** ISO 8601 duration, e.g. "PT12M16S". Omit if unknown. */
  duration?: string;
  /** Player embed URL, e.g. "https://www.youtube.com/embed/ID". */
  embedUrl?: string;
  /** Canonical watch URL, e.g. "https://www.youtube.com/watch?v=ID". Sets contentUrl + url. */
  contentUrl?: string;
};

/**
 * SEO + schema inputs for a story page. Drives both `buildStoryMetadata`
 * (Next Metadata) and `buildStoryJsonLd` (Article + BreadcrumbList), so the two
 * never drift apart.
 */
export type StoryMeta = {
  /** Full <title>, brand included — e.g. "… — A Local Feature | LVINIT". */
  title: string;
  /** Clean headline with no brand suffix, used for Article schema + OG/Twitter. Defaults to `title`. */
  headline?: string;
  description: string;
  /** Root-relative canonical path — e.g. "/neighborhoods/summerlin/fourth-of-july-parade". */
  path: string;
  /** Root-relative hero image — e.g. "/images/features/…webp". Omit if none exists yet (never fabricate one). */
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  /** ISO date (YYYY-MM-DD). Enables Article datePublished/dateModified. Must be real. */
  datePublished?: string;
  dateModified?: string;
  /** Defaults to Mikey Del Rosario. Use "LVINIT Editorial" for house pieces. */
  author?: string;
  /** Full breadcrumb trail: Home first, the current page last. */
  breadcrumbs: Breadcrumb[];
  /** Optional featured video — emits a VideoObject into the JSON-LD @graph. */
  video?: StoryVideoMeta;
};

const abs = (path: string) => `${SITE_URL}${path}`;

/** Build the Next.js Metadata object for a story page (canonical + Open Graph + Twitter). */
export function buildStoryMetadata(meta: StoryMeta): Metadata {
  const social = meta.headline ?? meta.title;
  const images = meta.image
    ? [
        {
          url: abs(meta.image),
          ...(meta.imageWidth ? { width: meta.imageWidth } : {}),
          ...(meta.imageHeight ? { height: meta.imageHeight } : {}),
          alt: meta.imageAlt ?? social,
        },
      ]
    : undefined;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.path },
    openGraph: {
      type: "article",
      url: abs(meta.path),
      title: social,
      description: meta.description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: social,
      description: meta.description,
      ...(meta.image ? { images: [abs(meta.image)] } : {}),
    },
  };
}

/**
 * Build the JSON-LD graph (Article + BreadcrumbList) for a story page.
 * Render it via a <script type="application/ld+json"> — StoryPage does this for
 * you. Dates/images are only asserted in schema when they're actually provided,
 * so we never claim data we don't have.
 */
export function buildStoryJsonLd(meta: StoryMeta) {
  const graph: Record<string, unknown>[] = [];

  const article: Record<string, unknown> = {
    "@type": "Article",
    headline: meta.headline ?? meta.title,
    description: meta.description,
    author: { "@type": "Person", name: meta.author ?? DEFAULT_AUTHOR },
    publisher: {
      "@type": "Organization",
      name: "LVINIT",
      logo: { "@type": "ImageObject", url: abs("/icon.png") },
    },
    mainEntityOfPage: abs(meta.path),
  };
  if (meta.image) article.image = abs(meta.image);
  if (meta.datePublished) article.datePublished = meta.datePublished;
  if (meta.dateModified ?? meta.datePublished) {
    article.dateModified = meta.dateModified ?? meta.datePublished;
  }
  graph.push(article);

  if (meta.breadcrumbs?.length) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: meta.breadcrumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: abs(c.path),
      })),
    });
  }

  if (meta.video) {
    const v = meta.video;
    const video: Record<string, unknown> = {
      "@type": "VideoObject",
      name: v.name,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl.startsWith("http")
        ? v.thumbnailUrl
        : abs(v.thumbnailUrl),
      uploadDate: v.uploadDate,
    };
    if (v.duration) video.duration = v.duration;
    if (v.embedUrl) video.embedUrl = v.embedUrl;
    if (v.contentUrl) {
      video.contentUrl = v.contentUrl;
      video.url = v.contentUrl;
    }
    graph.push(video);
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
