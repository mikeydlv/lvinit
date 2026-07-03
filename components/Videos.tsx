"use client";

import { useState } from "react";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import VideoPlaceholder from "./ui/VideoPlaceholder";
import { videos } from "@/lib/content";

export default function Videos() {
  const [featuredId, setFeaturedId] = useState(videos[0].id);
  const featured = videos.find((v) => v.id === featuredId) ?? videos[0];
  const secondary = videos.filter((v) => v.id !== featuredId);

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
          <VideoPlaceholder
            label={`Placeholder — ${featured.title}`}
            className="w-full"
          />
          <p className="mt-4 text-body-lg text-lvinit-black">{featured.title}</p>
          <p className="text-caption text-lvinit-warmgray">{featured.duration}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {secondary.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setFeaturedId(video.id)}
              className="text-left group"
            >
              <VideoPlaceholder
                label={`Placeholder — ${video.title}`}
                className="transition-opacity duration-300 ease-calm group-hover:opacity-90"
              />
              <p className="mt-3 text-body text-lvinit-black">{video.title}</p>
              <p className="text-caption text-lvinit-warmgray">{video.duration}</p>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <ButtonLink href="#" variant="tertiary">
            See all the videos
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
