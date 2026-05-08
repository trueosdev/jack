"use client";

import {
  type CSSProperties,
  type KeyboardEventHandler,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import { createPortal } from "react-dom";

const ACCENTS = ["#FFC000", "#5aa0e6", "#74AB86", "#ff765f"] as const;

/** Default logos: rendered with `background-color: var(--paper)` + SVG alpha mask. */
const BRAND_LOGO_ENTRIES: readonly {
  readonly alt: string;
  readonly href?: string;
  readonly src: string;
  readonly renderAsImage?: boolean;
  readonly tooltipText?: string;
}[] = [
  { alt: "Broken Bean Coffee Roasters", src: "/brokenBean.svg" },
  {
    alt: "Grace Life Church Decatur",
    href: "https://www.gracelifedecatur.org/",
    src: "/gracelife.svg",
    renderAsImage: true,
    tooltipText: "i made this site, too :)",
  },
  { alt: "So You Sew Embroidery", src: "/SoYouSew.svg" },
  {
    alt: "True Chats",
    href: "https://chats.trueos.dev",
    src: "/trueChatsLogo.svg",
    tooltipText: "i made this site, too :)",
  },
  {
    alt: "Mock",
    href: "https://mockitsolutions.com",
    src: "/mock.svg",
    tooltipText: "i made this site, too :)",
  },
  { alt: "Native", src: "/native.svg" },
];

function BrandLogoPaperMark({
  alt,
  href,
  src,
  renderAsImage,
  tooltipText,
  onTooltipMove,
  onTooltipLeave,
}: {
  alt: string;
  href?: string;
  src: string;
  renderAsImage?: boolean;
  tooltipText?: string;
  onTooltipMove?: (e: MouseEvent<HTMLElement>, text: string) => void;
  onTooltipLeave?: () => void;
}) {
  const maskStyle = {
    "--logo-mask": `url("${src}")`,
  } as CSSProperties;

  const mark = renderAsImage ? (
    <img
      alt={href ? "" : alt}
      aria-hidden={href ? true : undefined}
      className="brand-identities__logo-image"
      src={src}
    />
  ) : (
    <div
      aria-hidden={Boolean(href)}
      aria-label={href ? undefined : alt}
      className="brand-identities__logo-masked"
      role={href ? undefined : "img"}
      style={maskStyle}
    />
  );

  const tooltipHandlers = tooltipText
    ? {
        onMouseEnter: (e: MouseEvent<HTMLElement>) => onTooltipMove?.(e, tooltipText),
        onMouseMove: (e: MouseEvent<HTMLElement>) => onTooltipMove?.(e, tooltipText),
        onMouseLeave: () => onTooltipLeave?.(),
      }
    : undefined;

  const wrappedMark = (
    <div className="brand-identities__logo-tip-target" {...tooltipHandlers}>
      {mark}
    </div>
  );

  if (href) {
    return (
      <a
        aria-label={`${alt} — opens in a new tab`}
        className="brand-identities__logo-link"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {wrappedMark}
      </a>
    );
  }

  return wrappedMark;
}

type Props = {
  /** One carousel slide per child; default brand SVGs used when empty or omitted. */
  slides?: readonly ReactNode[];
};

export function BrandIdentitiesCarousel({ slides }: Props) {
  const headingId = useId();
  const viewportId = useId();
  const [index, setIndex] = useState(0);
  const [followTip, setFollowTip] = useState<{
    readonly x: number;
    readonly y: number;
    readonly text: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFollowTip(null);
  }, [index]);

  const moveFollowTip = useCallback((e: MouseEvent<HTMLElement>, text: string) => {
    setFollowTip({ x: e.clientX, y: e.clientY, text });
  }, []);

  const clearFollowTip = useCallback(() => {
    setFollowTip(null);
  }, []);

  const items: ReactNode[] =
    slides && slides.length > 0
      ? [...slides]
      : BRAND_LOGO_ENTRIES.map(({ alt, href, renderAsImage, src, tooltipText }) => (
          <BrandLogoPaperMark
            alt={alt}
            href={href}
            key={src}
            onTooltipLeave={clearFollowTip}
            onTooltipMove={moveFollowTip}
            renderAsImage={renderAsImage}
            src={src}
            tooltipText={tooltipText}
          />
        ));

  const count = Math.max(items.length, 1);
  const active = ((index % count) + count) % count;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = i + delta;
        return ((next % count) + count) % count;
      });
    },
    [count],
  );

  const onCarouselKeyDown: KeyboardEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    },
    [go],
  );

  const fill = ACCENTS[active % ACCENTS.length];
  const sectionStyle = {
    "--brand-identities-accent": fill,
  } as CSSProperties;

  return (
    <>
      <section
        aria-labelledby={headingId}
        className="section-shell brand-identities"
        id="brand-identities"
        style={sectionStyle}
      >
        <header className="brand-identities__header">
          <p className="kicker">Brand identities I've Designed</p>
        </header>

        <div
          aria-label="Brand logo slides"
          aria-roledescription="carousel"
          className="brand-identities__carousel"
          role="region"
          onKeyDown={onCarouselKeyDown}
          tabIndex={0}
        >
          <button
            aria-controls={viewportId}
            aria-label="Previous slide"
            className="brand-identities__nav brand-identities__nav--prev"
            type="button"
            onClick={() => go(-1)}
          >
            ‹
          </button>

          <div
            aria-live="polite"
            className="brand-identities__viewport"
            id={viewportId}
          >
            <div
              className="brand-identities__rail"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {items.map((node, slideIndex) => (
                <div
                  aria-hidden={slideIndex !== active}
                  className={`brand-identities__slide${slideIndex === active ? " is-active" : ""}`}
                  key={slideIndex}
                >
                  {node}
                </div>
              ))}
            </div>
          </div>

          <button
            aria-controls={viewportId}
            aria-label="Next slide"
            className="brand-identities__nav brand-identities__nav--next"
            type="button"
            onClick={() => go(1)}
          >
            ›
          </button>
        </div>

        <nav aria-label="Slide indicators" className="brand-identities__dots">
          {items.map((_, dotIndex) => (
            <button
              aria-current={dotIndex === active ? "true" : undefined}
              aria-label={`Go to slide ${dotIndex + 1}`}
              className={`brand-identities__dot${dotIndex === active ? " is-active" : ""}`}
              key={dotIndex}
              type="button"
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </nav>
      </section>

      {mounted &&
        followTip !== null &&
        createPortal(
          <span
            aria-hidden
            className="portfolio-tri-follow-tooltip"
            style={{ left: followTip.x, top: followTip.y }}
          >
            {followTip.text}
          </span>,
          document.body,
        )}
    </>
  );
}
