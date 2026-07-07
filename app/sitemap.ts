import type { MetadataRoute } from "next";

const BASE_URL = "https://www.lvinit.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE_URL}/neighborhoods/summerlin`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${BASE_URL}/search`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
