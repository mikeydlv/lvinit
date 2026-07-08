// Barrel export for the LVINIT Story Page pattern.
// Import blocks from one place: `import { StoryPage, StorySection } from "@/components/story";`
// See docs/STORY_PAGE_STANDARD.md for the authoring standard.

export { default as StoryPage } from "./StoryPage";
export type { StoryPageProps } from "./StoryPage";

export { default as StoryHero } from "./StoryHero";
export type { StoryHeroProps, StoryHeroCta } from "./StoryHero";

export { default as StoryBreadcrumbs } from "./StoryBreadcrumbs";

export { default as StoryLede } from "./StoryLede";
export type { StoryLedeProps } from "./StoryLede";

export { default as StorySection } from "./StorySection";
export type { StorySectionProps } from "./StorySection";

export { default as StoryVideo } from "./StoryVideo";
export type { StoryVideoProps } from "./StoryVideo";

export { default as StoryPullQuote } from "./StoryPullQuote";
export type { StoryPullQuoteProps } from "./StoryPullQuote";

export { default as StoryGallery } from "./StoryGallery";
export type { StoryGalleryProps, GalleryImage } from "./StoryGallery";

export { default as RelatedStories } from "./RelatedStories";
export type { RelatedStoriesProps, RelatedStory } from "./RelatedStories";

export { default as RelatedNeighborhood } from "./RelatedNeighborhood";
export type { RelatedNeighborhoodProps } from "./RelatedNeighborhood";

export { default as StoryCTAs } from "./StoryCTAs";
export type { StoryCTAsProps, StoryCtaButton } from "./StoryCTAs";
