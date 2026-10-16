/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // 2026-10-15: the Henderson Sport & Social grand-opening piece became an
      // evergreen visitor guide at a venue-named URL. Explicit 301 (not
      // Next's default 308) for the old URL.
      {
        source: "/guides/henderson-sport-social-grand-opening",
        destination: "/guides/henderson-sport-and-social",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
