"use client";

import {
  type PointerEventHandler,
  type ReactNode,
  useCallback,
  useRef,
} from "react";

type Props = {
  children: ReactNode;
};

/** Percentages for `mask-image radial-gradient(...) at …` center. */
function hotspotFromPointer(
  el: HTMLElement,
  clientX: number,
  clientY: number,
): readonly [string, string] {
  const r = el.getBoundingClientRect();
  const w = r.width || 1;
  const h = r.height || 1;
  const x = Math.min(110, Math.max(-10, ((clientX - r.left) / w) * 100));
  const y = Math.min(110, Math.max(-10, ((clientY - r.top) / h) * 100));
  return [`${x.toFixed(2)}%`, `${y.toFixed(2)}%`];
}

export function EducationHalftoneCard({ children }: Props) {
  const articleRef = useRef<HTMLElement | null>(null);

  const syncHotspot = useCallback((clientX: number, clientY: number) => {
    const el = articleRef.current;
    if (!el) {
      return;
    }
    const [xPct, yPct] = hotspotFromPointer(el, clientX, clientY);
    el.style.setProperty("--education-hotspot-x", xPct);
    el.style.setProperty("--education-hotspot-y", yPct);
    el.dataset.educationInteractive = "true";
  }, []);

  const hideHotspot = useCallback(() => {
    const el = articleRef.current;
    if (!el) {
      return;
    }
    delete el.dataset.educationInteractive;
  }, []);

  const onPointerMove: PointerEventHandler<HTMLElement> = useCallback(
    (e) => {
      syncHotspot(e.clientX, e.clientY);
    },
    [syncHotspot],
  );

  const onPointerEnter: PointerEventHandler<HTMLElement> = useCallback(
    (e) => {
      syncHotspot(e.clientX, e.clientY);
    },
    [syncHotspot],
  );

  const onPointerLeave = useCallback(() => {
    hideHotspot();
  }, [hideHotspot]);

  const setArticleRef = useCallback((node: HTMLElement | null) => {
    articleRef.current = node;
  }, []);

  return (
    <article
      className="education-halftone-card"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      ref={setArticleRef}
    >
      <div aria-hidden className="education-dotfield education-dotfield--fine" />
      <div aria-hidden className="education-dotfield education-dotfield--coarse" />
      {children}
    </article>
  );
}
