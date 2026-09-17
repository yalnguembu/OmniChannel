import { useEffect, useState } from "react";

/** Tailwind's `md` — the breakpoint the panel layouts split on. */
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Whether the viewport is at desktop width, as a value rather than a class.
 *
 * Panels that have two layouts — a bottom sheet on a phone, a docked drawer on
 * a screen — used to render both and hide one with `md:hidden` / `md:flex`.
 * That puts **two copies of the children in the DOM**, and a form inside such a
 * panel then registers every field twice: react-hook-form keeps the ref of the
 * last one registered, the hidden copy, so what the agent typed was never read.
 * Submitting reported the fields as empty and required, and writing the empty
 * value back cleared the visible input. Duplicated `id` attributes came free
 * with it.
 *
 * Choosing the layout here means only one of them is ever mounted.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(media.matches);
    media.addEventListener("change", onChange);
    onChange();
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}
