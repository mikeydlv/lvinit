// Barrel export for the LVINIT Area Guide pattern.
//
// Area guides are the pillar pages for a whole side of the valley (Southwest,
// Summerlin, Henderson, Centennial Hills, Skye Canyon, Lake Las Vegas, North
// Las Vegas). They sit ON TOP of the Story Page system in components/story/ —
// an area guide is a StoryPage whose children include these blocks alongside
// the ordinary StorySection / StoryGallery / StoryPullQuote editorial beats.
//
// The blocks here handle the parts every area guide needs and no story does:
// orientation, a map, a communities roster, verified development status, a
// head-to-head, and an FAQ.
//
// REUSE THE STRUCTURE, NOT THE STORYTELLING. These components take data and
// nodes; they don't impose an order or a voice. Southwest leads with "it isn't
// one thing" because that's Southwest's actual story. Summerlin's guide should
// use the same blocks in whatever order Summerlin's story wants, and skip the
// ones it doesn't need. Nothing here should end up feeling like a template.

export { default as AreaQuickFacts } from "./AreaQuickFacts";
export type { AreaQuickFactsProps, AreaQuickFact } from "./AreaQuickFacts";

export { default as LocalsNote } from "./LocalsNote";
export type { LocalsNoteProps } from "./LocalsNote";

export { default as LVINITMap } from "./LVINITMap";
export type { LVINITMapProps, MapPlace } from "./LVINITMap";

export { default as AreaCommunities } from "./AreaCommunities";
export type { AreaCommunitiesProps, AreaCommunity } from "./AreaCommunities";

export { default as DevelopmentWatch } from "./DevelopmentWatch";
export type {
  DevelopmentWatchProps,
  DevelopmentProject,
  ProjectStatus,
} from "./DevelopmentWatch";

export { default as ComparisonBar } from "./ComparisonBar";
export type { ComparisonBarProps, ComparisonRow } from "./ComparisonBar";

export { default as AreaFAQ } from "./AreaFAQ";
export type { AreaFAQProps, AreaFaqItem } from "./AreaFAQ";

export { default as AreaVideoSlot } from "./AreaVideoSlot";
export type { AreaVideoSlotProps, AreaVideoConfig } from "./AreaVideoSlot";

export { default as AreaSources } from "./AreaSources";
export type { AreaSourcesProps, AreaSource } from "./AreaSources";
