import Script from "next/script";

// Google Analytics 4 — only loads when NEXT_PUBLIC_GA_ID is set (e.g. G-XXXXXXX
// in Vercel env). No ID = nothing loads and nothing is tracked, so no analytics
// ship until you opt in. Lead events are fired from the contact form via gtag.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
