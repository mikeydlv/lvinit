"use client";

import { useState } from "react";

export type StoryVideoFacadeProps = {
  /** YouTube video id only. Loaded via youtube-nocookie ONLY after a click. */
  youtubeId: string;
  /** Accessible iframe title / play-button label source. */
  title: string;
  /** Local poster asset (e.g. "/images/video-….jpg"), shown until the click. */
  poster: string;
};

/**
 * Click-to-play facade for StoryVideo: shows a crisp local poster + play button
 * and makes NO YouTube request until the visitor clicks. On click it swaps in
 * the privacy-enhanced youtube-nocookie embed (autoplay only after that user
 * gesture). Fills its positioned parent (StoryVideo's aspect-video frame).
 */
export default function StoryVideoFacade({
  youtubeId,
  title,
  poster,
}: StoryVideoFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group absolute inset-0 h-full w-full"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local poster; the embed replaces it on click */}
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-lvinit-black/20 transition-colors duration-200 ease-calm group-hover:bg-lvinit-black/30"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-lvinit-white/90 bg-lvinit-black/30 transition-transform duration-200 ease-calm group-hover:scale-105">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 translate-x-[1px] fill-lvinit-white"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
