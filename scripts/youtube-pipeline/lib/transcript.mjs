// ---------------------------------------------------------------------------
// TRANSCRIPTS — source material, never the article
//
// Accepted formats, all read from a file the manifest points at:
//
//   srt / vtt     subtitle files (YouTube Studio download, Resolve export)
//   json          { segments: [{ start, end, text }] } — start/end as seconds,
//                 "m:ss", "h:mm:ss" or Resolve timecode "HH:MM:SS:FF". This is
//                 exactly what Resolve's MediaPoolItem.GetTranscription() returns
//   txt           plain text; a line may start with a "[m:ss]" or "m:ss" stamp
//
// A transcript that is missing, unreadable or too short is TRANSCRIPT_REQUIRED,
// and nothing downstream writes a line of article copy for that video — the
// title alone never becomes an article.
//
// Cleaning is conservative: filler words, stutters and silence markers are
// removed; nothing is reworded. The cleaned text is still Mikey's words.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { extname, isAbsolute, join } from "node:path";

import { splitSentences } from "../../fact-decay/lib/claims.mjs";

export const TRANSCRIPT_STATUS = {
  OK: "OK",
  REQUIRED: "TRANSCRIPT_REQUIRED",
};

/**
 * Any timestamp form → seconds. Resolve timecode "HH:MM:SS:FF" assumes `fps`.
 * null when unreadable.
 */
export function toSeconds(value, { fps = 30 } = {}) {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  const v = String(value ?? "").trim().replace(",", ".");
  if (!v) return null;
  if (/^\d+(\.\d+)?$/.test(v)) return Number(v);
  const tc = /^(\d{2}):(\d{2}):(\d{2}):(\d{2})$/.exec(v);
  if (tc) return Number(tc[1]) * 3600 + Number(tc[2]) * 60 + Number(tc[3]) + Number(tc[4]) / fps;
  const clock = /^(?:(\d+):)?(\d{1,2}):(\d{2}(?:\.\d+)?)$/.exec(v);
  if (clock) return Number(clock[1] ?? 0) * 3600 + Number(clock[2]) * 60 + Number(clock[3]);
  return null;
}

/** Seconds → "m:ss" for reports. */
export function stamp(seconds) {
  if (!Number.isFinite(seconds)) return null;
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

/** SRT or WebVTT → segments. */
export function parseSubtitles(text) {
  const segments = [];
  const blocks = String(text).replace(/\r/g, "").replace(/^WEBVTT[^\n]*\n/, "").split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim() && !/^(NOTE|STYLE|REGION)\b/.test(l));
    const timeIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeIdx < 0) continue;
    const [a, b] = lines[timeIdx].split("-->").map((s) => s.trim().split(/\s+/)[0]);
    const body = lines
      .slice(timeIdx + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (body) segments.push({ start: toSeconds(a), end: toSeconds(b), text: body });
  }
  return segments;
}

/** Plain text, optionally with "[m:ss]" line stamps. */
export function parsePlainText(text) {
  const segments = [];
  for (const line of String(text).replace(/\r/g, "").split("\n")) {
    const m = /^\s*\[?((?:\d+:)?\d{1,2}:\d{2})\]?\s*[-–—]?\s*(.*)$/.exec(line);
    const body = (m ? m[2] : line).trim();
    if (!body) continue;
    segments.push({ start: m ? toSeconds(m[1]) : null, end: null, text: body });
  }
  return segments;
}

/** { segments:[…] } (Resolve GetTranscription shape, or our own). */
export function parseJsonTranscript(doc, { fps = 30 } = {}) {
  const list = Array.isArray(doc) ? doc : Array.isArray(doc?.segments) ? doc.segments : [];
  return list
    .map((s) => ({ start: toSeconds(s.start, { fps }), end: toSeconds(s.end, { fps }), text: String(s.text ?? "").trim() }))
    .filter((s) => s.text && !/^\(\s*\.\.\.\s*\)$/.test(s.text));
}

/**
 * Proper nouns machine transcription reliably mishears in LVINIT videos. Only
 * names — never a figure, never a claim — and every replacement is counted and
 * reported. The transcript file itself is never edited.
 */
export const KNOWN_MISHEARINGS = [
  { pattern: /\bSummer\s?land\b/gi, replacement: "Summerlin" },
  { pattern: /\bScoff?ield Group\b/gi, replacement: "Scofield Group" },
  { pattern: /\b(?:this is )?live in it\b(?=[.!,]?\s+Living Las Vegas)/gi, replacement: "this is LVINIT" },
  { pattern: /\bL\.?\s?V\.?\s?In It\b/g, replacement: "LVINIT" },
];

export function applyKnownCorrections(text) {
  let out = String(text ?? "");
  const applied = [];
  for (const { pattern, replacement } of KNOWN_MISHEARINGS) {
    out = out.replace(pattern, (m) => {
      applied.push({ heard: m, corrected: replacement });
      return replacement;
    });
  }
  return { text: out, applied };
}

/** Fillers and stutters that carry no meaning. Words are never replaced. */
const FILLERS = /\b(u+m+|u+h+|e+r+m*|a+h+|hmm+|mm-?hmm)\b[,.]?\s*/gi;

export function cleanSpokenText(text) {
  let t = String(text ?? "")
    .replace(/\(\s*\.\.\.\s*\)/g, " ")
    .replace(/\[(music|applause|laughter|inaudible)\]/gi, " ")
    .replace(FILLERS, "")
    .replace(/\byou know,\s*/gi, "")
    .replace(/\bI mean,\s*/g, "")
    .replace(/\b(\w+)(\s+\1\b)+/gi, "$1") // "the the" → "the"
    .replace(/\s+([,.?!])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
  if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

/**
 * Segments → sentences, each carrying the timestamp of the segment it starts in.
 */
export function sentencesFromSegments(segments) {
  const pieces = [];
  let text = "";
  for (const seg of segments) {
    const cleaned = cleanSpokenText(seg.text);
    if (!cleaned) continue;
    pieces.push({ offset: text.length + (text ? 1 : 0), start: seg.start });
    text = text ? `${text} ${cleaned}` : cleaned;
  }
  const out = [];
  let cursor = 0;
  for (const sentence of splitSentences(text)) {
    const at = text.indexOf(sentence, cursor);
    const pos = at < 0 ? cursor : at;
    cursor = pos + sentence.length;
    let start = null;
    for (const p of pieces) {
      if (p.offset <= pos) start = p.start ?? start;
      else break;
    }
    out.push({ index: out.length, text: sentence, start, timecode: stamp(start) });
  }
  return out;
}

const countWords = (s) => String(s).split(/\s+/).filter(Boolean).length;

/**
 * Load the transcript a manifest entry points at.
 *
 * @returns {{status, reason, verified, source, path, format, segments, sentences, words, hash}}
 */
export function loadTranscript(repoRoot, transcriptRef, config, { fps = 30 } = {}) {
  const base = { verified: false, source: transcriptRef?.source ?? null, path: transcriptRef?.path ?? null, format: null, segments: [], sentences: [], words: 0, hash: null };
  if (!transcriptRef?.path) return { ...base, status: TRANSCRIPT_STATUS.REQUIRED, reason: "no transcript is listed for this video" };
  const full = isAbsolute(transcriptRef.path) ? transcriptRef.path : join(repoRoot, transcriptRef.path);
  if (!existsSync(full)) return { ...base, status: TRANSCRIPT_STATUS.REQUIRED, reason: `transcript file not found: ${transcriptRef.path}` };

  const format = (transcriptRef.format ?? extname(full).slice(1)).toLowerCase();
  let segments;
  try {
    const raw = readFileSync(full, "utf8");
    if (format === "srt" || format === "vtt") segments = parseSubtitles(raw);
    else if (format === "json") segments = parseJsonTranscript(JSON.parse(raw), { fps });
    else segments = parsePlainText(raw);
  } catch (err) {
    return { ...base, format, status: TRANSCRIPT_STATUS.REQUIRED, reason: `transcript could not be read: ${err.message}` };
  }
  const corrections = [];
  for (const seg of segments) {
    const c = applyKnownCorrections(seg.text);
    seg.text = c.text;
    corrections.push(...c.applied);
  }
  const sentences = sentencesFromSegments(segments);
  const fullText = sentences.map((s) => s.text).join(" ");
  const words = countWords(fullText);
  const hash = createHash("sha1").update(fullText.toLowerCase().replace(/[^a-z0-9$%]+/g, " ")).digest("hex").slice(0, 12);
  const result = {
    ...base,
    format,
    segments,
    sentences,
    words,
    hash,
    verified: transcriptRef.verified === true,
    timestamps: sentences.some((s) => s.start !== null),
    corrections: Object.values(
      corrections.reduce((acc, c) => {
        const k = `${c.heard.toLowerCase()}→${c.corrected}`;
        acc[k] = acc[k] ?? { heard: c.heard, corrected: c.corrected, count: 0 };
        acc[k].count += 1;
        return acc;
      }, {})
    ),
  };
  if (words < config.transcript.minWords) {
    return { ...result, status: TRANSCRIPT_STATUS.REQUIRED, reason: `transcript has ${words} words (minimum ${config.transcript.minWords})` };
  }
  return {
    ...result,
    status: TRANSCRIPT_STATUS.OK,
    reason: transcriptRef.verified ? "verified transcript" : "unverified transcript (machine transcription or not yet reviewed by Mikey)",
  };
}
