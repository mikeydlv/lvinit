"use client";

import { useState } from "react";
import { Button } from "./ui/Button";

const timelines = [
  "Just exploring",
  "Next 3 months",
  "3–6 months",
  "6–12 months",
  "12+ months",
];

const areas = [
  "Summerlin",
  "Henderson",
  "Green Valley",
  "Downtown / Arts District",
  "Lake Las Vegas",
  "Four Seasons / high-rise",
  "Not sure yet",
];

const labelClass =
  "mb-2 block text-caption uppercase tracking-wide text-lvinit-warmgray";
const fieldClass =
  "w-full border border-lvinit-lightgray bg-lvinit-white px-4 py-3 text-body text-lvinit-black placeholder:text-lvinit-warmgray focus-visible:outline-lvinit-blue";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  function mailtoFallback(payload: Record<string, string>) {
    const subject = `LVINIT inquiry — ${payload.name || "Website"}`;
    const body = [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone}`,
      `Timeline: ${payload.timeline}`,
      `Area of interest: ${payload.area}`,
      "",
      "Message:",
      payload.message,
    ].join("\n");
    window.location.href = `mailto:hello@lvinit.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => (data.get(k) ?? "").toString().trim();
    const payload = {
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      timeline: get("timeline"),
      area: get("area"),
      message: get("message"),
    };

    // Count the intent as a lead (no-op unless analytics is configured).
    (window as GtagWindow).gtag?.("event", "generate_lead", {
      form: "contact",
      area: payload.area || undefined,
    });

    setStatus("sending");
    try {
      // Real handler: POST to /api/contact (Resend). Falls back to a mailto
      // draft whenever the API isn't configured yet or the send fails, so a
      // lead is never lost.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        form.reset();
        setStatus("sent");
        return;
      }
      mailtoFallback(payload);
      setStatus("mailto");
    } catch {
      mailtoFallback(payload);
      setStatus("mailto");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" type="text" required autoComplete="name" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone <span className="normal-case text-lvinit-warmgray/70">(optional)</span>
        </label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="timeline" className={labelClass}>
          Timeline
        </label>
        <select id="timeline" name="timeline" defaultValue="" className={fieldClass}>
          <option value="" disabled>
            When are you looking to move?
          </option>
          {timelines.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="area" className={labelClass}>
          Area of interest
        </label>
        <select id="area" name="area" defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Where are you thinking?
          </option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className={labelClass}>
          What are you weighing?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Where you're moving from, what matters to you, questions you have…"
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send to Mikey"}
        </Button>

        {status === "sent" && (
          <p className="mt-4 text-body text-lvinit-blue">
            Thanks — I got it, and I&rsquo;ll get back to you, usually the same
            day.
          </p>
        )}
        {status === "mailto" && (
          <p className="mt-4 text-body text-lvinit-blue">
            Your email draft is ready — hit send and I&rsquo;ll get back to you,
            usually the same day.
          </p>
        )}

        <p className="mt-4 text-caption text-lvinit-warmgray">
          Prefer to write directly?{" "}
          <a href="mailto:hello@lvinit.com" className="text-lvinit-blue underline underline-offset-4">
            hello@lvinit.com
          </a>
          .
        </p>
      </div>
    </form>
  );
}
