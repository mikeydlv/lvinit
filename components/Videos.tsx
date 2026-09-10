"use client";

import { useState } from "react";
import Container from "./ui/Container";
import VideoPlaceholder from "./ui/VideoPlaceholder";
import { videos } from "@/lib/content";

/**
 * How many videos the supporting row shows beneath the featured player.
 *
 * Four is a layout constant, not an arbitrary cap: the row is
 * grid-cols-1 / sm:grid-cols-2 / lg:grid-cols-4, and four divides evenly into
 * all three, so no card is ever left orphaned on a line of its own. The
 * registry in lib/content.ts is sized to match (five entries: one featured
 * plus four). If a sixth is ever added there it will not appear here — the
 * homepage set is curated, so retire one instead of appending.
 */
const SUPPORTING_COUNT = 4;

export default function Videos() {
  const [featuredId, setFeaturedId] = useState(videos[0].id);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const featured = videos.find((v) => v.id === featuredId) ?? videos[0];
  const secondary = videos
    .filter((v) => v.id !== featuredId)
    .slice(0, SUPPORTING_COUNT);
  const isPlaying = playingId === featured.id;

  return (
    <section id="videos" aria-labelledby="videos-heading" className="py-16 sm:py-24">
      <Container>
        <h2
          id="videos-heading"
          className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
        >
          Watch: Real Talk on Living in Las Vegas
        </h2>

        <div className="mt-10">
          {featured.youtubeId ? (
            isPlaying ? (
              <div className="relative aspect-video w-full overflow-hidden bg-lvinit-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${featured.youtubeId}?autoplay=1&start=0`}
                  title={featured.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPlayingId(featured.id)}
                aria-label={`Play video: ${featured.title}`}
                className="block w-full"
              >
                <VideoPlaceholder
                  src={`/images/video-${featured.id}.jpg`}
                  label={featured.title}
                  className="w-full"
                />
              </button>
            )
          ) : (
            <VideoPlaceholder
              src={`/images/video-${featured.id}.jpg`}
              label={featured.title}
              className="w-full"
            />
          )}
          <p className="mt-4 text-body-lg text-lvinit-black">{featured.title}</p>
          <p className="text-caption text-lvinit-warmgray">{featured.duration}</p>
        </div>

        {/* Supporting row. 1 / 2 / 4 across, mirroring the 1 / 2 / 3 ladder the
            guides feed uses, so SUPPORTING_COUNT items always fill whole rows. */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {secondary.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => {
                setFeaturedId(video.id);
                setPlayingId(video.id);
              }}
              aria-label={`Play video: ${video.title}`}
              className="text-left group"
            >
              <VideoPlaceholder
                src={`/images/video-${video.id}.jpg`}
                label={video.title}
                className="transition-opacity duration-300 ease-calm group-hover:opacity-90"
              />
              <p className="mt-3 text-body text-lvinit-black">{video.title}</p>
              <p className="text-caption text-lvinit-warmgray">{video.duration}</p>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
