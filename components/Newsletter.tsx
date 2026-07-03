"use client";

import { useState } from "react";
import Container from "./ui/Container";
import { Button } from "./ui/Button";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // NOTE: no backend wired up yet — this only updates local UI state.
    // Wire this to a real email service (Mailchimp, ConvertKit, a Vercel
    // serverless function, etc.) before launch. Per the brief, no
    // database/CMS was introduced in this Phase 1 build.
    setSubmitted(true);
  };

  return (
    <section aria-labelledby="newsletter-heading" className="py-20 sm:py-32">
      <Container className="max-w-xl text-center">
        <h2
          id="newsletter-heading"
          className="font-display text-heading-sm font-bold text-lvinit-black"
        >
          Get to Know the City Before You Move Here
        </h2>
        <p className="mt-3 text-body text-lvinit-warmgray">
          New neighborhood guides and honest comparisons, occasionally, never
          spam.
        </p>

        {submitted ? (
          <p className="mt-8 text-body text-lvinit-blue">
            You&rsquo;re in — watch for your first guide.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 border border-lvinit-lightgray bg-lvinit-white px-4 py-3 text-body text-lvinit-black placeholder:text-lvinit-warmgray focus-visible:outline-lvinit-blue"
            />
            <Button type="submit" variant="primary">
              Subscribe
            </Button>
          </form>
        )}
      </Container>
    </section>
  );
}
