// ---------------------------------------------------------------------------
// SYNTHETIC SOURCE RESPONSES — NOT REAL WEB PAGES
//
// A stand-in for `fetch`, so the verification path can be exercised — including
// its failure modes — with no network access at all.
//
// Every response below is INVENTED. The domains are `example-fixture-*` on
// purpose: none of them resolve, and nothing here corresponds to a real
// government, developer, or news source.
//
// The set deliberately covers each outcome the verifier can produce:
//
//   confirms                every figure still present
//   contradicts             the figures have been revised away
//   partially-confirms      one figure moved, one did not
//   manual-check-required   403 bot protection, and a JavaScript-only shell
//   source-unreachable      a 500
//   contradicts (gone)      a 404
// ---------------------------------------------------------------------------

const page = (body, { status = 200, headers = {} } = {}) => ({ status, body, headers });

/** url -> response definition. */
export const FIXTURE_RESPONSES = {
  // The benefit amount changed and the deadline moved: contradicts.
  "https://example-fixture-housing.nv.gov/worker-advantage": page(
    `<html><head><title>Fixture Worker Advantage Program</title></head><body>
      <script type="application/ld+json">{"dateModified":"2026-07-01"}</script>
      <h1>Fixture Worker Advantage Program</h1>
      <p>The Fixture Worker Advantage Program provides $25,000 in down payment assistance to eligible
      Nevada workers, structured as a no-interest, no-payment second mortgage. Household income must be
      at or below $151,900 in Fixture County. The program is available through December 31, 2027.
      The minimum credit score is 640. Applications are accepted first-come, first-served until funds
      are reserved. This is synthetic fixture text and describes no real program.</p>
      <p>Eligible workers include healthcare, education, public safety and construction trades.
      Owner-occupancy is required and a homebuyer education course must be completed before closing.</p>
    </body></html>`,
    { headers: { "last-modified": "Wed, 01 Jul 2026 12:00:00 GMT" } }
  ),

  // The project has moved on from "planned": contradicts on status.
  "https://example-fixture-news.com/fixture-commons": page(
    `<html><head><title>Fixture Commons breaks ground</title></head><body>
      <h1>Fixture Commons breaks ground</h1>
      <p>Construction is underway on the 354-unit Fixture Commons apartment building at Fixture Parkway.
      Crews broke ground after commissioners approved the project. The building will include about
      6,556 square feet of commercial space. This is synthetic fixture text describing nothing real.</p>
      <p>Fixture Commons is expected to take roughly two years to build, with occupancy anticipated
      some time after that. Neighbouring streets will see periodic lane restrictions during the work.</p>
    </body></html>`
  ),

  // Still says what the page says: confirms.
  "https://example-fixture-news.com/fixture-grand-park": page(
    `<html><head><title>Fixture Grand Park phase one is now open</title></head><body>
      <h1>Fixture Grand Park phase one is now open</h1>
      <p>The first phase of the 90-acre Fixture Grand Park opened this spring with ballfields, a splash
      pad, a playground and shaded picnic areas. Phases two and three remain in planning with no
      published completion date. This is synthetic fixture text and describes no real park.</p>
      <p>The park sits on Fixture Sky Vista Drive and is open daily from dawn until dusk, with parking
      on the north side of the site.</p>
    </body></html>`
  ),

  // On topic, but the figure is simply not on the page any more and NO
  // different figure is stated either. This must come back as
  // `value-not-found`, never as `contradicts` — an absence is not a
  // disagreement.
  "https://example-fixture-housing.nv.gov/hoa-guidance": page(
    `<html><head><title>Fixture HOA guidance</title></head><body>
      <h1>Fixture HOA guidance</h1>
      <p>Homeowners association dues in the fixture community cover amenities, water and common-area
      upkeep. Dues are set annually by the association board and published in the annual budget packet,
      which is distributed to owners each autumn. This is synthetic fixture text describing nothing real.</p>
      <p>Owners should request the current dues schedule directly from the association before closing,
      because the figure changes with each budget cycle and is not maintained on this page.</p>
    </body></html>`
  ),

  // Bot protection: MANUAL_SOURCE_CHECK_REQUIRED.
  "https://example-fixture-county.gov/projects": page("Forbidden", { status: 403 }),

  // A JavaScript shell: nothing can be concluded.
  "https://example-fixture-spa.com/rates": page(
    `<html><head><title>Fixture Rates</title></head><body><div id="root"></div></body></html>`
  ),

  // Gone.
  "https://example-fixture-news.com/removed-article": page("Not Found", { status: 404 }),

  // Server error.
  "https://example-fixture-news.com/broken": page("Server Error", { status: 500 }),
};

/**
 * A `fetch` stand-in over FIXTURE_RESPONSES.
 * Any URL not in the table behaves like a 404, which is itself a fixture case.
 */
export function createFixtureFetch(responses = FIXTURE_RESPONSES) {
  const calls = [];
  const impl = async (url) => {
    calls.push(String(url));
    const found = responses[String(url)] ?? { status: 404, body: "Not Found", headers: {} };
    const ok = found.status >= 200 && found.status < 300;
    return {
      ok,
      status: found.status,
      headers: { get: (name) => found.headers?.[String(name).toLowerCase()] ?? null },
      text: async () => found.body,
    };
  };
  impl.calls = calls;
  return impl;
}
