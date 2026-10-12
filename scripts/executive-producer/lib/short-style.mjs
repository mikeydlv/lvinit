// ---------------------------------------------------------------------------
// SHORT STYLE — the permanent LVINIT short-video creative standard (2026-10-12)
//
// Editorial, not promotional: modern Las Vegas lifestyle documentary. Every
// short gets one of three TREATMENTS, so the week never repeats the same
// opening, text layout, transitions or pacing; the branding stays constant:
//
//   editorial    Playfair Display headlines, left-aligned lower third, slow
//                dissolves, text rises in gently. Longer, calmer shots.
//   documentary  Inter headlines top-left under a small gold rule, mostly
//                straight cuts with the odd dissolve. Field-guide feel.
//   kinetic      Inter, centered, quicker pacing, cuts and a few motion
//                transitions (slide/smooth). Text lands fast.
//
// Branding (Mikey, 2026-10-12): light warm-paper end card with, in order,
//   LVINIT · Living Las Vegas from the Inside · Mikey Del Rosario ·
//   The Scofield Group · 702-779-9780 · NV License S.0175577 (compliance line,
//   kept) · the full-color Scofield Group logo · the topic's own link.
// ---------------------------------------------------------------------------

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { GOLD } from "./render.mjs";

const { default: sharp } = await import("sharp");
const HERE = dirname(fileURLToPath(import.meta.url));

export const W = 1080;
export const H = 1920;
export const BRAND_RESERVE = 170; // bottom band kept clear for the LVINIT / THE SCOFIELD GROUP line
export const END_CARD = 3.0;
export const INK = "#141414";
export const SCOFIELD_BLUE = "#2B6CB0";
export const PAPER = "#F6F2EA";

export const TAGLINE = "Living Las Vegas from the Inside";
export const BRAND = {
  name: "Mikey Del Rosario",
  brokerage: "The Scofield Group",
  phone: "702-779-9780",
  // Compliance line from the approved closing card and site footer. Kept on every end card.
  license: "NV License S.0175577",
};
// Mikey's own logo file (C:\LVINIT\Logos), in its original colors.
export const SCOFIELD_LOGO = process.env.LVINIT_SCOFIELD_LOGO ?? "C:\\LVINIT\\Logos\\The_Scofield_Group_Full_Colored.png";
const LOGO_FALLBACK = join(HERE, "..", "..", "..", "public", "images", "logos", "the-scofield-group.webp");

export const TREATMENTS = {
  editorial: {
    headFont: "Playfair Display", headWeight: 700, headSize: [96, 82], headMin: 66,
    bodySize: 44, align: "left", position: "bottom", anim: { delay: 0.35, fade: 0.55, rise: 36 },
    transitions: ["fade", "cut", "fade", "fade", "cut"], transDur: 0.5, intoEnd: "fadewhite", rule: false,
  },
  documentary: {
    headFont: "Inter", headWeight: 700, headSize: [86, 70], headMin: 58,
    bodySize: 42, align: "left", position: "top", anim: { delay: 0.15, fade: 0.3, rise: 0 },
    transitions: ["cut", "cut", "fade", "cut", "fadeblack"], transDur: 0.35, intoEnd: "fade", rule: true,
  },
  kinetic: {
    headFont: "Inter", headWeight: 800, headSize: [104, 86], headMin: 66,
    bodySize: 44, align: "center", position: "center", anim: { delay: 0.05, fade: 0.2, rise: 28 },
    transitions: ["cut", "smoothup", "cut", "slideleft", "cut"], transDur: 0.3, intoEnd: "smoothup", rule: false,
  },
};
export const TREATMENT_NAMES = Object.keys(TREATMENTS);
const CUT = 0.067; // a two-frame dissolve reads as a straight cut (shorter breaks xfade's output)
const XFADE_OK = new Set(["fade", "fadeblack", "fadewhite", "smoothup", "smoothleft", "slideleft", "slideup", "cut"]);

export const treatmentOf = (p) => (TREATMENTS[p?.treatment] ? p.treatment : "editorial");

/** Transition into segment k (k >= 1), and into the end card (k === n). */
export function transitionFor(segments, k, treatment) {
  const t = TREATMENTS[treatment] ?? TREATMENTS.editorial;
  if (k === segments.length) return { type: t.intoEnd, dur: t.transDur };
  const type = XFADE_OK.has(segments[k].transition) ? segments[k].transition : t.transitions[(k - 1) % t.transitions.length];
  return { type, dur: type === "cut" ? CUT : t.transDur };
}

/** Total length after transitions (segments + end card). */
export function styledDuration(segments, treatment, endCard = END_CARD) {
  let total = segments.reduce((a, s) => a + s.dur, 0) + endCard;
  for (let k = 1; k <= segments.length; k++) total -= transitionFor(segments, k, treatment).dur;
  return total;
}

/**
 * Gives each short of the week a different treatment: the planner's choice when it
 * is valid and unique, otherwise the least recently used one. `recent` = treatments
 * of the last weeks' shorts, newest first.
 */
export function assignTreatments(shorts, recent = []) {
  const used = new Set();
  // Least recently used first: never used (or oldest) before the newest.
  const age = (t) => (recent.indexOf(t) < 0 ? Infinity : recent.indexOf(t));
  const order = TREATMENT_NAMES.slice().sort((a, b) => age(b) - age(a));
  for (const p of shorts) if (TREATMENTS[p.treatment] && !used.has(p.treatment)) used.add(p.treatment);
  for (const p of shorts) {
    if (TREATMENTS[p.treatment] && shorts.filter((x) => x.treatment === p.treatment)[0] === p) continue;
    p.treatment = order.find((t) => !used.has(t)) ?? order[0];
    used.add(p.treatment);
  }
  return shorts;
}

// ---- typography --------------------------------------------------------------------

const INTER = JSON.parse(readFileSync(join(HERE, "glyph-widths.json"), "utf8"));
const PLAYFAIR = JSON.parse(readFileSync(join(HERE, "glyph-widths-playfair.json"), "utf8"));
function measure(text, size, font, weight) {
  const table = font === "Playfair Display" ? PLAYFAIR["700"] : INTER[weight >= 650 ? 700 : 600];
  let em = 0;
  for (const ch of String(text)) em += table[ch] ?? 0.6;
  return em * size * 1.03;
}
function wrapText(text, size, maxW, font, weight) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (!line || measure(next, size, font, weight) <= maxW) line = next;
    else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  // Balance: avoid a one-word last line when two lines would do.
  if (lines.length === 2 && lines[1].split(" ").length === 1 && lines[0].split(" ").length > 2) {
    const a = lines[0].split(" ");
    lines[1] = `${a.pop()} ${lines[1]}`;
    lines[0] = a.join(" ");
  }
  return lines;
}

/** Does this text fit the treatment (headline ≤ 3 lines at ≥ min size, body ≤ 3 lines)? */
export function fitsTreatment(headline, body, treatment, hook = false) {
  const t = TREATMENTS[treatment] ?? TREATMENTS.editorial;
  const maxW = W - 84 * 2;
  let size = t.headSize[hook ? 0 : 1];
  let lines = wrapText(headline, size, maxW, t.headFont, t.headWeight);
  while (lines.length > 3 && size > t.headMin) {
    size -= 4;
    lines = wrapText(headline, size, maxW, t.headFont, t.headWeight);
  }
  const bodyLines = body ? wrapText(body, t.bodySize, maxW, "Inter", 600) : [];
  return { fits: lines.length <= 3 && bodyLines.length <= 3, size, lines, bodyLines };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const SHADOW = `<filter id="s" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur in="SourceAlpha" stdDeviation="18" result="wide"/><feFlood flood-color="#000" flood-opacity="0.55"/><feComposite in2="wide" operator="in" result="wideS"/><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="tight"/><feOffset in="tight" dy="2" result="tightO"/><feFlood flood-color="#000" flood-opacity="0.7"/><feComposite in2="tightO" operator="in" result="tightS"/><feMerge><feMergeNode in="wideS"/><feMergeNode in="tightS"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

/**
 * The text layer for one segment: a transparent W x (H - BRAND_RESERVE) PNG, so text
 * can never reach the brand line. Letter-shaped shadows only, never a panel.
 */
export async function textLayer(seg, treatment, hook, outPath) {
  const t = TREATMENTS[treatment] ?? TREATMENTS.editorial;
  const CH = H - BRAND_RESERVE;
  const margin = 84;
  const fit = fitsTreatment(seg.headline ?? "", seg.body ?? "", treatment, hook);
  const size = fit.size;
  const lead = Math.round(size * (t.headFont === "Playfair Display" ? 1.12 : 1.08));
  const bLead = Math.round(t.bodySize * 1.34);
  const ruleH = t.rule ? 34 : 0;
  const gap = fit.bodyLines.length ? Math.round(size * 0.34) : 0;
  const blockH = ruleH + fit.lines.length * lead + gap + fit.bodyLines.length * bLead;
  const position = seg.position ?? t.position;
  const y0 = position === "top" ? margin + 60 : position === "center" ? Math.round((CH - blockH) / 2) : CH - margin - blockH;
  const x = t.align === "center" ? W / 2 : margin;
  const anchor = t.align === "center" ? "middle" : "start";
  const parts = [];
  if (t.rule) parts.push(`<rect x="${t.align === "center" ? W / 2 - 40 : margin}" y="${y0}" width="80" height="6" fill="${GOLD}" filter="url(#s)"/>`);
  let y = y0 + ruleH + size;
  for (const l of fit.lines) {
    parts.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${t.headFont}" font-weight="${t.headWeight}" font-size="${size}" fill="#FFFFFF" filter="url(#s)">${esc(l)}</text>`);
    y += lead;
  }
  y += gap - lead + bLead;
  for (const l of fit.bodyLines) {
    parts.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Inter" font-weight="600" font-size="${t.bodySize}" fill="#FFFFFF" filter="url(#s)">${esc(l)}</text>`);
    y += bLead;
  }
  const svg = `<svg width="${W}" height="${CH}" xmlns="http://www.w3.org/2000/svg"><defs>${SHADOW}</defs>${parts.join("")}</svg>`;
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(outPath);
  return { position, band: position === "top" ? [y0 / H, (y0 + blockH) / H] : position === "center" ? [y0 / H, (y0 + blockH) / H] : [y0 / H, (y0 + blockH) / H] };
}

/** ffmpeg overlay expression: text fades in after a beat and rises into place. */
export function textMotion(treatment, hook, transitionIn = 0) {
  const a = (TREATMENTS[treatment] ?? TREATMENTS.editorial).anim;
  // The hook is on screen almost at once; later text waits for the incoming transition.
  const delay = Math.round(((hook ? Math.min(a.delay, 0.15) : a.delay) + transitionIn * 0.6) * 100) / 100;
  // Used inside single quotes in the filtergraph, so the commas need no escaping.
  const y = a.rise ? `if(lt(t,${delay}),${a.rise},max(0,${a.rise}*(1-(t-${delay})/${(a.fade + 0.15).toFixed(2)})))` : "0";
  return { delay, fade: a.fade, y };
}

/** The steady brand line over the footage: LVINIT bottom-left, THE SCOFIELD GROUP bottom-right. */
export async function brandLayer(outPath) {
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="b" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="t"/><feOffset in="t" dy="2" result="o"/><feFlood flood-color="#000" flood-opacity="0.75"/><feComposite in2="o" operator="in" result="sh"/><feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<text x="72" y="${H - 96}" font-family="Inter" font-weight="800" font-size="40" letter-spacing="3" filter="url(#b)"><tspan fill="#FFFFFF">LVI</tspan><tspan fill="${GOLD}">NIT</tspan></text>
<text x="${W - 72}" y="${H - 98}" text-anchor="end" font-family="Inter" font-weight="600" font-size="26" letter-spacing="1.5" fill="#FFFFFF" opacity="0.92" filter="url(#b)">THE SCOFIELD GROUP</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

/** The end card's link: shrinks to fit the card (down to 28px), then breaks after the path's last "/". */
export function ctaLines(cta, maxW = W - 120) {
  const text = String(cta ?? "");
  for (let size = 38; size >= 28; size -= 2) if (measure(text, size, "Inter", 600) <= maxW) return [{ text, size }];
  const cut = text.lastIndexOf("/");
  if (cut > 0) {
    const parts = [text.slice(0, cut + 1), text.slice(cut + 1)];
    let size = 34;
    while (size > 24 && parts.some((p) => measure(p, size, "Inter", 600) > maxW)) size -= 2;
    return parts.map((p) => ({ text: p, size }));
  }
  return [{ text, size: 28 }];
}

/**
 * The end card: warm paper, the LVINIT wordmark (LVI near-black, NIT gold), the
 * tagline, Mikey, the brokerage, the phone, the compliance line, the full-color
 * Scofield Group logo, and the post's own link. Returns { warnings }.
 */
export async function endCard(outPath, { cta = "lvinit.com" } = {}) {
  const warnings = [];
  let logoPath = SCOFIELD_LOGO;
  if (!existsSync(logoPath)) {
    warnings.push(`Scofield Group logo not found at ${SCOFIELD_LOGO}; used the site logo instead.`);
    logoPath = LOGO_FALLBACK;
  }
  const logoW = 640;
  const logo = existsSync(logoPath) ? await sharp(logoPath).resize({ width: logoW }).png().toBuffer() : null;
  const logoH = logo ? (await sharp(logo).metadata()).height : 0;
  const c = (y, family, weight, size, fill, text, extra = "") => `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${family}" font-weight="${weight}" font-size="${size}" fill="${fill}" ${extra}>${esc(text)}</text>`;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="${PAPER}"/>
<text x="${W / 2}" y="640" text-anchor="middle" font-family="Playfair Display" font-weight="700" font-size="176" letter-spacing="6"><tspan fill="${INK}">LVI</tspan><tspan fill="${GOLD}">NIT</tspan></text>
<rect x="${W / 2 - 230}" y="694" width="200" height="3" fill="${GOLD}"/><rect x="${W / 2 + 30}" y="694" width="200" height="3" fill="${GOLD}"/>
<path d="M ${W / 2} 682 L ${W / 2 + 9} 695.5 L ${W / 2} 709 L ${W / 2 - 9} 695.5 Z" fill="${GOLD}"/>
${c(782, "Inter", 500, 44, "#3D3A35", TAGLINE)}
${c(1000, "Playfair Display", 700, 70, INK, BRAND.name)}
${c(1072, "Inter", 600, 42, "#2E2B27", BRAND.brokerage)}
${c(1146, "Inter", 700, 50, SCOFIELD_BLUE, BRAND.phone, 'letter-spacing="1"')}
${c(1200, "Inter", 500, 28, "#6E6A63", BRAND.license)}
${ctaLines(cta).map((l, i, all) => c(1660 + i * Math.round(l.size * 1.3) - (all.length - 1) * 20, "Inter", 600, l.size, "#3D3A35", l.text)).join("\n")}
</svg>`;
  const layers = [{ input: Buffer.from(svg), top: 0, left: 0 }];
  if (logo) layers.push({ input: logo, left: Math.round((W - logoW) / 2), top: 1290 });
  if (logo && 1290 + logoH > 1600) warnings.push("Scofield logo is taller than expected and may crowd the link line.");
  await sharp({ create: { width: W, height: H, channels: 3, background: PAPER } }).composite(layers).png().toFile(outPath);
  return { warnings };
}

// ---- creative-variety checks (local, free) ------------------------------------------------

const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const SALES = /\b(call (me )?(now|today)|act (fast|now)|don'?t miss( out)?|limited time|hurry|book (a|your) (showing|tour) (now|today)|dm me now|before it'?s gone|won'?t last|best deal|dream home)\b/i;

/**
 * Issues for one short against the rest of the week and recent weeks' shorts:
 * repeated opening, repeated CTA, identical pacing, crowded text, sales language.
 */
export function varietyIssues(p, weekShorts = [], recentShorts = []) {
  const out = [];
  const segs = p.segments ?? [];
  if (!segs.length) return out;
  const open = norm(segs[0].headline);
  const others = weekShorts.filter((x) => x !== p && x.segments?.length);
  if (open && [...others, ...recentShorts].some((x) => norm(x.segments?.[0]?.headline) === open)) out.push({ check: "variety", message: `The opening "${segs[0].headline}" repeats another short's opening; write a different hook.` });
  const cta = norm(p.cta);
  if (cta && [...others, ...recentShorts].some((x) => norm(x.cta) === cta)) out.push({ check: "variety", message: "The CTA repeats another short's CTA word for word; vary it." });
  const pace = segs.map((s) => Math.round((s.dur ?? 0) * 2) / 2).join(",");
  if (others.some((x) => (x.segments ?? []).map((s) => Math.round((s.dur ?? 0) * 2) / 2).join(",") === pace)) out.push({ check: "variety", message: "Same number of shots and the same shot lengths as another short this week; vary the pacing." });
  segs.forEach((s, k) => {
    const words = `${s.headline ?? ""} ${s.body ?? ""}`.trim().split(/\s+/).filter(Boolean).length;
    if (words > 16) out.push({ check: "minimal-text", message: `Segment ${k + 1} has ${words} words on screen; keep it to 16 or fewer.` });
  });
  const said = [p.cta, p.caption, ...segs.flatMap((s) => [s.headline, s.body])].filter(Boolean).join(" ");
  const m = said.match(SALES);
  if (m) out.push({ check: "tone", message: `Sales language ("${m[0]}"); LVINIT endings invite, they don't push.` });
  return out;
}
