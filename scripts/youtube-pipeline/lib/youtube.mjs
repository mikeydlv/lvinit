// ---------------------------------------------------------------------------
// YOUTUBE IDS, URLS AND DURATIONS
//
// Pure helpers. Nothing here touches the network: an id is read out of what
// the manifest or the site source already says, and a duration is converted,
// never looked up or estimated.
// ---------------------------------------------------------------------------

export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * The 11-character video id in an id, a watch / youtu.be / embed / shorts /
 * live / nocookie URL. null when there isn't a valid one.
 */
export function extractVideoId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (YOUTUBE_ID.test(raw)) return raw;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^www\.|^m\./, "");
  let id = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
  else if (/^(youtube|youtube-nocookie)\.com$/.test(host) || host === "music.youtube.com") {
    const path = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname);
    id = path ? path[1] : url.searchParams.get("v");
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

/** The canonical URLs LVINIT uses for one video. */
export function videoUrls(id) {
  if (!YOUTUBE_ID.test(String(id ?? ""))) return null;
  return {
    watch: `https://www.youtube.com/watch?v=${id}`,
    embed: `https://www.youtube.com/embed/${id}`,
    // What StoryVideo actually loads: privacy-enhanced, no cookies until a play.
    nocookieEmbed: `https://www.youtube-nocookie.com/embed/${id}`,
    // YouTube's own thumbnail. The site already uses it as a VideoObject
    // thumbnailUrl when there is no local poster (see the buyer's-market guide).
    youtubeThumbnail: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  };
}

/** A canonical watch URL from any YouTube URL or id, or null. */
export function normalizeYouTubeUrl(value) {
  const id = extractVideoId(value);
  return id ? videoUrls(id).watch : null;
}

/** "8:08" / "1:02:03" → seconds. null when it isn't a clock duration. */
export function clockToSeconds(value) {
  const m = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!m) return null;
  const [, h, mm, ss] = m;
  if (Number(ss) > 59 || (h !== undefined && Number(mm) > 59)) return null;
  return Number(h ?? 0) * 3600 + Number(mm) * 60 + Number(ss);
}

/** Seconds → ISO 8601 duration ("PT8M8S"). null for anything that isn't a positive number. */
export function secondsToIsoDuration(seconds) {
  const s = Math.round(Number(seconds));
  if (!Number.isFinite(s) || s <= 0) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${r ? `${r}S` : ""}`;
}

/** "PT8M8S" → seconds. null when it isn't a valid ISO 8601 time duration. */
export function isoDurationToSeconds(value) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(String(value ?? ""));
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

/** Seconds → "8:08". */
export function secondsToClock(seconds) {
  const s = Math.round(Number(seconds));
  if (!Number.isFinite(s) || s < 0) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

/** A YYYY-MM-DD date, or a full ISO timestamp with a time zone. */
export function isValidUploadDate(value) {
  const v = String(value ?? "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return Number.isFinite(Date.parse(`${v}T00:00:00Z`));
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(v)) return Number.isFinite(Date.parse(v));
  return false;
}
