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

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => (data.get(k) ?? "").toString().trim();
    const name = get("name");

    // ---------------------------------------------------------------------
    // FORM HANDLER — currently a mailto fallback (no backend / no CRM wired).
    // Replace this block with a real handler when ready: POST these fields to
    // a Next.js route handler that sends via Resend / forwards to a CRM.
    // Keep the field names (name/email/phone/timeline/area/message) stable so
    // the swap is drop-in. Do NOT wire a fake/placeholder CRM.
    // ---------------------------------------------------------------------
    const subject = `LVINIT inquiry — ${name || "Website"}`;
    const body = [
      `Name: ${name}`,
      `Email: ${get("email")}`,
      `Phone: ${get("phone")}`,
      `Timeline: ${get("timeline")}`,
      `Area of interest: ${get("area")}`,
      "",
      "Message:",
      get("message"),
    ].join("\n");

    window.location.href = `mailto:hello@lvinit.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
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
        <Button type="submit" variant="primary">
          Send to Mikey
        </Button>

        {submitted && (
          <p className="mt-4 text-body text-lvinit-blue">
            Your email draft is ready — hit send and I&rsquo;ll get back to you,
            usually the same day.
          </p>
        )}

        <p className="mt-4 text-caption text-lvinit-warmgray">
          This opens your email app so you can send it. Prefer to write directly?{" "}
          <a href="mailto:hello@lvinit.com" className="text-lvinit-blue underline underline-offset-4">
            hello@lvinit.com
          </a>
          .
        </p>
      </div>
    </form>
  );
}
