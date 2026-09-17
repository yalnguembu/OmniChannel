import { useEffect } from "react";

/**
 * Keeps the inbox inside the visible viewport while the on-screen keyboard is
 * open.
 *
 * Two separate problems, one hook:
 *
 * **The document scrolls.** Nothing pinned `html`/`body`, so when a field takes
 * focus the browser scrolls the whole page to reveal it — carrying the
 * conversation header off the top and leaving the composer half cut off at the
 * bottom. Locking both elements means only the message list can scroll, which
 * is the one thing that should.
 *
 * **`100dvh` is not the visible height.** On Android Chrome the keyboard
 * resizes the *visual* viewport, not the layout viewport, so `dvh` stays at its
 * full value and the app keeps claiming a height that no longer fits on screen.
 * `visualViewport.height` is the real figure, published here as `--app-height`
 * for `.app-viewport` to use.
 *
 * With the container actually shrinking, the rest falls into place on its own:
 * `MessagesList` already re-pins to the bottom through a `ResizeObserver`, so
 * the last message stays in view instead of hiding behind the keyboard.
 *
 * Scoped to the screens that call it — the portal pages scroll normally and
 * must keep doing so, which is why this is a hook and not a global stylesheet
 * rule.
 */
export function useViewportLock(): void {
  useEffect(() => {
    const root = document.documentElement;
    const { body } = document;

    const previous = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    // Stops the pull-to-refresh and rubber-banding that otherwise fight the
    // message list at its extremities.
    body.style.overscrollBehavior = "none";

    const viewport = window.visualViewport;

    const apply = () => {
      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty("--app-height", `${Math.round(height)}px`);

      // How much of the layout viewport the keyboard covers.
      //
      // `position: fixed; bottom: 0` anchors to the *layout* viewport, which
      // the keyboard does not shrink — so a bottom sheet lands behind it, and
      // with the document locked nothing can scroll it back into view. Any
      // such surface offsets itself by this value instead.
      const inset = viewport
        ? Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop))
        : 0;
      root.style.setProperty("--keyboard-inset", `${Math.round(inset)}px`);

      // iOS Safari scrolls the window on focus even with overflow hidden;
      // putting it back costs nothing when it has not moved.
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    apply();

    viewport?.addEventListener("resize", apply);
    viewport?.addEventListener("scroll", apply);
    window.addEventListener("orientationchange", apply);

    return () => {
      viewport?.removeEventListener("resize", apply);
      viewport?.removeEventListener("scroll", apply);
      window.removeEventListener("orientationchange", apply);

      root.style.removeProperty("--app-height");
      root.style.removeProperty("--keyboard-inset");
      root.style.overflow = previous.rootOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscroll;
    };
  }, []);
}
