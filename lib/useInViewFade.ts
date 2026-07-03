"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A single, one-time fade-in when a section enters the viewport — per
 * Doc 03's "restrained, not scroll-linked, not parallax" motion rule.
 * Returns a ref to attach and a boolean to drive opacity/transform classes.
 */
export function useInViewFade<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
