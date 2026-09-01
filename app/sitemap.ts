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
    {
      url: `${BASE_URL}/neighborhoods/summerlin/fourth-of-july-parade`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/neighborhoods/henderson`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/neighborhoods/north-las-vegas`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/neighborhoods/downtown-arts-district`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/neighborhoods/southwest-las-vegas`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/neighborhoods/henderson/four-seasons-private-residences`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${BASE_URL}/guides`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${BASE_URL}/guides/las-vegas-income-needed-to-buy-a-home-2026`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/summerlin-vs-henderson`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/henderson-vs-southwest-las-vegas`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/what-500k-buys-in-las-vegas`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/will-las-vegas-home-prices-drop`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/las-vegas-home-prices-july-2026`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/las-vegas-new-home-sales-july-2026`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/las-vegas-starter-home-prices-2026`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/las-vegas-down-payment-assistance-programs-2026`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/nevada-property-tax-abatement-resale-buyers`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/guides/first-summer-in-vegas`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    { url: `${BASE_URL}/search`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
