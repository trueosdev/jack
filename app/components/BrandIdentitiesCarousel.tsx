"use client";

import {
  type CSSProperties,
  type KeyboardEventHandler,
  type ReactNode,
  useCallback,
  useId,
  useState,
} from "react";

const ACCENTS = ["#FFC000", "#5aa0e6", "#74AB86", "#ff765f"] as const;

/** Default logos: rendered with `background-color: var(--paper)` + SVG alpha mask. */
const BRAND_LOGO_ENTRIES: readonly {
  readonly alt: string;
  readonly href?: string;
  readonly src: string;
}[] = [
  { alt: "Broken Bean Coffee Roasters", src: "/brokenBean.svg" },
  { alt: "Grace Life Church Decatur", href: "https://www.gracelifedecatur.org/", src: "/gracelife.svg" },
  { alt: "So You Sew Embroidery", src: "/SoYouSew.svg" },
  { alt: "True Chats", src: "/trueChatsLogo.svg" },
  { alt: "Mock", src: "/mock.svg" },
  { alt: "Native", src: "/native.svg" },
];

function BrandLogoPaperMark({
  alt,
  href,
  src,
}: {
  alt: string;
  href?: string;
  src: string;
}) {
  const maskStyle = {
    "--logo-mask": `url("${src}")`,
  } as CSSProperties;

  const mark = (
    <div
      aria-hidden={Boolean(href)}
      aria-label={href ? undefined : alt}
      className="brand-identities__logo-masked"
      role={href ? undefined : "img"}
      style={maskStyle}
    />
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
        {mark}
      </a>
    );
  }

  return mark;
}

type Props = {
  /** One carousel slide per child; default brand SVGs used when empty or omitted. */
  slides?: readonly ReactNode[];
};

export function BrandIdentitiesCarousel({ slides }: Props) {
  const headingId = useId();
  const viewportId = useId();

  const items: ReactNode[] =
    slides && slides.length > 0
      ? [...slides]
      : BRAND_LOGO_ENTRIES.map(({ alt, href, src }) => (
          <BrandLogoPaperMark alt={alt} href={href} key={src} src={src} />
        ));

  const count = Math.max(items.length, 1);
  const [index, setIndex] = useState(0);
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
  );
}
