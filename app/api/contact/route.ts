import { NextResponse } from "next/server";
import { Resend } from "resend";

// Lead handler for the /contact form.
// Requires these env vars to actually send (add them in Vercel):
//   RESEND_API_KEY      — your Resend API key
//   CONTACT_FROM_EMAIL  — a verified sender, e.g. "LVINIT <hello@lvinit.com>"
//   CONTACT_TO_EMAIL    — where leads land (defaults to hello@lvinit.com)
// Until RESEND_API_KEY is set, this returns 503 and the form falls back to
// a mailto draft — so nothing is lost and no fake service is wired.

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let data: Record<string, string>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const name = (data.name ?? "").trim();
  const email = (data.email ?? "").trim();
  const message = (data.message ?? "").trim();
  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_EMAIL || "hello@lvinit.com";
  const from = process.env.CONTACT_FROM_EMAIL || "LVINIT <hello@lvinit.com>";

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${(data.phone ?? "").trim()}`,
    `Timeline: ${(data.timeline ?? "").trim()}`,
    `Area of interest: ${(data.area ?? "").trim()}`,
    "",
    "Message:",
    message,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `LVINIT inquiry — ${name}`,
      text,
    });
    if (error) {
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
