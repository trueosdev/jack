"use client";

/**
 * Expanded cards play short looped clips. Drop files in `public/` (paths in LANES below).
 *
 * Codec / encode recommendations:
 * ─────────────────────────────────────────────────────────────────────────────
 * **Primary — H.264 (AVC) in `.mp4`**
 *   Universal decode (incl. iOS Safari). Use **High** or **Main** profile,
 *   **Level 4.0** (or 4.1) for ~1080p, **`yuv420p`** for broad compatibility.
 *   Strip audio or keep **silent** AAC; looping UI clips rarely need audible audio.
 *
 * **Optional smaller file — VP9 in `.webm`**
 *   Often smaller than H.264 at similar quality; add optional `videoWebm` paths and
 *   list `<source type="video/webm" />` **before** MP4 (browser picks first supported format).
 *
 * **Progressive enhancement — AV1 in `.webm`**
 *   Newer/smaller still; weaker Safari adoption — OK as an extra `<source>` if you
 *   always keep H.264 MP4 last as fallback.
 *
 * ffmpeg CLI example (muted loop, yuv420p):
 *   `ffmpeg -i input.mov -an -vf "scale='min(1280,iw)':'-2'" -c:v libx264 -pix_fmt yuv420p`
 *   `-profile:v high -preset slow -movflags +faststart portfolio-worship-leader.mp4`
 */

import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type PortfolioLane = {
  readonly id: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly blurb: string;
  /** Hover wash: moss / sun / sky */
  readonly accent: "moss" | "sun" | "sky";
  /** H.264 — required baseline for Safari + older engines */
  readonly videoMp4: string;
  /** VP9 — optional smaller files (Chrome/Firefox); omit until encoded */
  readonly videoWebm?: string;
};

const LANES: readonly PortfolioLane[] = [
  {
    id: "worship-leader",
    title: "Worship Leader",
    eyebrow: "MINISTRY · MUSIC · A/V",
    blurb: "Planning services, directing bands, and building moments people remember.",
    accent: "moss",
    videoMp4: "/portfolio-worship-leader.mp4",
  },
  {
    id: "workflow-toolsmith",
    title: "Workflow Toolsmith",
    eyebrow: "OPERATIONS · SYSTEMS · WEB",
    blurb: "Tightening inventory, shipping, schedules, and the tools teams live in daily.",
    accent: "sun",
    videoMp4: "/portfolio-workflow.mp4",
  },
  {
    id: "story-brander",
    title: "Story Brander",
    eyebrow: "IDENTITY · VISUALS · BRANDING",
    blurb: "Logos, campaigns, and surfaces that tell a clear story at a glance.",
    accent: "sky",
    videoMp4: "/portfolio-story-brander.mp4",
  },
];

export function PortfolioTriGrid() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [followTip, setFollowTip] = useState<{ readonly x: number; readonly y: number } | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);
  const videosRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFollowTip(null);
  }, [expandedId]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    videosRef.current.forEach((el, id) => {
      if (prefersReducedMotion) {
        el.pause();
        return;
      }
      if (id === expandedId) {
        void el.play().catch(() => {});
      } else {
        el.pause();
        el.currentTime = 0;
      }
    });
  }, [expandedId, prefersReducedMotion]);

  const activate = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const moveFollowTip = useCallback(
    (e: MouseEvent<HTMLButtonElement>, laneExpanded: boolean) => {
      if (prefersReducedMotion || laneExpanded) {
        setFollowTip(null);
        return;
      }
      setFollowTip({ x: e.clientX, y: e.clientY });
    },
    [prefersReducedMotion],
  );

  return (
    <>
      <div className="portfolio-grid portfolio-grid--tri">
        {LANES.map((lane) => {
        const expanded = expandedId === lane.id;
        return (
          <button
            aria-expanded={expanded}
            data-accent={lane.accent}
            className={[
              "portfolio-card",
              "portfolio-card--tri",
              expanded ? "is-expanded" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={lane.id}
            type="button"
            onMouseEnter={(e) => moveFollowTip(e, expanded)}
            onMouseLeave={() => setFollowTip(null)}
            onMouseMove={(e) => moveFollowTip(e, expanded)}
            onClick={() => activate(lane.id)}
          >
            {/* Decorative loop — no audible speech track */}
            <video
              aria-hidden
              className="portfolio-card__tri-video"
              disablePictureInPicture
              loop
              muted
              playsInline
              preload="none"
              ref={(el) => {
                if (el) {
                  videosRef.current.set(lane.id, el);
                } else {
                  videosRef.current.delete(lane.id);
                }
              }}
            >
              {lane.videoWebm ? (
                <source src={lane.videoWebm} type="video/webm" />
              ) : null}
              <source src={lane.videoMp4} type="video/mp4" />
            </video>
            <span className="portfolio-card__tri-scrim" aria-hidden />
            <span className="portfolio-card__tri-body">
              <span className="portfolio-card__tri-eyebrow">{lane.eyebrow}</span>
              <h3 className="portfolio-card__tri-title">{lane.title}</h3>
              <span className="portfolio-card__tri-blurb">{lane.blurb}</span>
            </span>
          </button>
        );
      })}
      </div>

      {mounted &&
        followTip !== null &&
        !prefersReducedMotion &&
        createPortal(
          <span
            aria-hidden
            className="portfolio-tri-follow-tooltip"
            style={{ left: followTip.x, top: followTip.y }}
          >
            Click me!
          </span>,
          document.body,
        )}
    </>
  );
}
