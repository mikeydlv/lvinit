# Vendored brand fonts (build-time only)

These two files exist so `scripts/generate-guide-cover.mjs` can rasterize
editorial covers in the **real** LVINIT typefaces.

| File | Family | Licence |
|---|---|---|
| `PlayfairDisplay.ttf` | Playfair Display (variable, `wght`) | SIL OFL 1.1 — `PlayfairDisplay-OFL.txt` |
| `Inter.ttf` | Inter (variable, `opsz` + `wght`) | SIL OFL 1.1 — `Inter-OFL.txt` |

Both are the upstream Google Fonts releases and both are SIL OFL 1.1, which
permits redistribution as long as the licence travels with the font — that is
what the two `*-OFL.txt` files are for. **Do not delete them.**

## Why they are committed

Neither face is installed as a system font on a typical machine. Without these
files the cover generator would still run, but the renderer would silently
substitute Georgia and Arial, and covers regenerated on a different machine
would not match the ones already committed. Vendoring the actual files makes
the output identical anywhere, with no network access needed.

The generator points the renderer's fontconfig at this directory itself — there
is nothing to install.

## What these are *not*

They are **not** how the website loads its fonts. The site uses
`next/font/google` in `app/layout.tsx`, which is unchanged and unaffected.
Nothing here is served to browsers, bundled, or deployed; these files are read
only when someone runs the generator locally.
