import { useRef, useEffect } from "react";

/**
 * Attaches an IntersectionObserver that adds "is-visible" to the element
 * when it enters the viewport, then unobserves. Used for scroll-reveal
 * animations (combined with .animate-reveal CSS class from landing.css).
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
