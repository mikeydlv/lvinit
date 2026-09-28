// ---------------------------------------------------------------------------
// NOTIFY — Mikey hears about every Monday run, success or failure
//
//   email   through LVINIT's existing Resend account (RESEND_API_KEY, a
//           verified sender in LVINIT_NOTIFY_FROM, recipient LVINIT_NOTIFY_EMAIL)
//   toast   a Windows notification on the PC, always, as a local backup
//
// The email is short: what happened, how many posts, exceptions with the
// recommended resolution, real cost, and where the preview is. Never the
// research detail.
// ---------------------------------------------------------------------------

import { execFile } from "node:child_process";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function composeMessage({ ok, weekOf, posts = 0, exceptions = [], costs = {}, failedStep, error, previewPath, manual = [], gaps = [] }) {
  const subject = ok
    ? `LVINIT: ${posts} posts ready for the week of ${weekOf}${exceptions.length ? ` (${exceptions.length} to decide)` : ""}`
    : `LVINIT: this week's batch FAILED (${failedStep ?? "startup"})`;
  const lines = [];
  if (ok) {
    lines.push(`${posts} finished draft posts for the week of ${weekOf} are ready. Nothing was published.`);
    if (exceptions.length) {
      lines.push("", "Needs your decision:");
      for (const x of exceptions) lines.push(`- ${x.day}: ${x.title ?? ""}: ${x.issues.map((i) => i.message).join(" ")} Recommended: ${x.resolution}`);
    }
  } else {
    lines.push(`The batch for the week of ${weekOf} stopped at "${failedStep ?? "startup"}".`, "", `Reason: ${error}`, "", "Nothing was published. Fix the reason and run the Monday task again; it picks up the same week.");
  }
  if (costs.totalUsd !== undefined) lines.push("", `Service cost: $${costs.totalUsd.toFixed(2)} (Apify $${(costs.apifyUsd ?? 0).toFixed(2)}, Anthropic $${(costs.anthropicUsd ?? 0).toFixed(2)})`);
  if (manual.length) lines.push("", "Not fully automatic this run:", ...manual.map((m) => `- ${m}`));
  if (gaps.length) lines.push("", ...gaps.map((g) => `Note: ${g}`));
  if (previewPath) lines.push("", `Preview: ${previewPath}`);
  const text = lines.join("\n");
  const html = `<div style="font:15px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#111">${text
    .split("\n")
    .map((l) => (l ? `<p style="margin:0 0 6px">${esc(l)}</p>` : ""))
    .join("")}</div>`;
  return { subject, text, html };
}

export async function sendEmail(msg, { fetchImpl = fetch, env = process.env } = {}) {
  if (!env.RESEND_API_KEY || !env.LVINIT_NOTIFY_EMAIL) return { sent: false, reason: "email not configured (RESEND_API_KEY / LVINIT_NOTIFY_EMAIL)" };
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.LVINIT_NOTIFY_FROM ?? "LVINIT <hello@lvinit.com>", to: [env.LVINIT_NOTIFY_EMAIL], subject: msg.subject, text: msg.text, html: msg.html }),
  });
  if (!res.ok) return { sent: false, reason: `Resend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
  return { sent: true, id: (await res.json()).id };
}

/** Windows toast via PowerShell (no modules needed). Never throws. */
export function toast(title, body) {
  if (process.platform !== "win32") return Promise.resolve({ shown: false });
  const q = (s) => String(s).replace(/'/g, "''").slice(0, 200);
  const ps = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
$t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
$x = $t.GetElementsByTagName('text'); $x.Item(0).AppendChild($t.CreateTextNode('${q(title)}')) > $null; $x.Item(1).AppendChild($t.CreateTextNode('${q(body)}')) > $null
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('LVINIT Executive Producer').Show([Windows.UI.Notifications.ToastNotification]::new($t))`;
  return new Promise((resolve) => execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], { windowsHide: true, timeout: 20_000 }, (err) => resolve({ shown: !err, error: err ? String(err.message).slice(0, 120) : null })));
}

export async function notify(summary, opts = {}) {
  const msg = composeMessage(summary);
  const email = await sendEmail(msg, opts).catch((e) => ({ sent: false, reason: String(e?.message ?? e) }));
  const desk = await toast(msg.subject, summary.ok ? "Open the preview in OneDrive > LVINIT > Weekly Posts." : String(summary.error ?? "").slice(0, 150));
  return { email, toast: desk, subject: msg.subject };
}
