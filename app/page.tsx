"use client";

import { useMemo, useState } from "react";

import { BrandIdentitiesCarousel } from "./components/BrandIdentitiesCarousel";
import { PortfolioTriGrid } from "./components/PortfolioTriGrid";
import { EducationHalftoneCard } from "./components/EducationHalftoneCard";
import { HeroNameLetters } from "./components/HeroNameLetters";
import { PortraitReveal } from "./components/PortraitReveal";

type Experience = {
  role: string;
  company: string;
  location: string;
  dates: string;
  category: "Operations" | "Creative" | "Ministry" | "Hospitality";
  details: string[];
};

type ExperienceCategory = Experience["category"];

const experiences: Experience[] = [
  {
    role: "General Manager",
    company: "Armadillo Safety Products",
    location: "Decatur, AL",
    dates: "Jan 2026 - Present",
    category: "Operations",
    details: [
      "Oversee <b>daily operations and managerial problem solving</b> for a safety products company.",
      "Manage <b>stocking, shipping, inventory software development</b>, and <b>workflow optimization</b>.",
    ],
  },
  {
    role: "Marketing",
    company: "AMP Quality Energy Services",
    location: "Decatur, AL",
    dates: "Oct 2024 - Present",
    category: "Creative",
    details: [
      "Lead marketing initiatives including <b>advertisements, signage, banners, and logo creation</b>.",
      "Manage the <b>executive calendar and time management</b> for the company CEO.",
      "Produce graphic materials that reinforce <b>brand identity across platforms</b>.",
    ],
  },
  {
    role: "Missionary",
    company: "Mission to the World",
    location: "Tokyo, Japan",
    dates: "Aug 2023 - Sep 2024",
    category: "Ministry",
    details: [
      "Organized and performed <b>art and worship events</b> throughout Tokyo.",
      "Assisted in the management of <b>church worship services</b>.",
      "Hosted <b>multicultural networking events</b> designed to bridge national communities.",
      "Studied Japanese through immersive language coursework.",
    ],
  },
  {
    role: "Worship Director & Youth Pastor",
    company: "First Presbyterian Church",
    location: "Troy, AL",
    dates: "Aug 2023 - Jun 2024",
    category: "Ministry",
    details: [
      "Planned and led <b>weekly worship practices and Sunday services</b>.",
      "Managed all <b>audio/visual hardware and software</b> for the sanctuary.",
      "Provided spiritual and theological mentorship to youth groups.",
      "<b>Designed and maintained</b> the church website.",
    ],
  },
  {
    role: "Barista & Cafe Manager",
    company: "Fuse Coffee",
    location: "Troy, AL",
    dates: "Oct 2022 - Jun 2024",
    category: "Hospitality",
    details: [
      "Managed <b>cafe operations</b> including equipment, staffing, and customer experience.",
      "Designed <b>branded stickers and decals</b> to promote cafe identity.",
      "Handled cash transactions, customer relations, and team training.",
    ],
  },
  {
    role: "Worship Intern",
    company: "EZRA Worship Initiative",
    location: "Decatur, AL",
    dates: "Summer 2022",
    category: "Ministry",
    details: [
      "Developed leadership, musicianship, theological, and technical skills for worship ministry.",
      "Wrote original songs, studied worship literature, and led a live worship band.",
      "Left with a <b>Certificate of Worship Leadership</b> from <b>Birmingham Theological Seminary</b>.",
    ],
  },
];

const categories = ["All", "Operations", "Creative", "Ministry", "Hospitality"] as const;

const skills: { label: string; category: ExperienceCategory }[] = [
  { label: "Graphic design", category: "Creative" },
  { label: "Vector illustration", category: "Creative" },
  { label: "Video production", category: "Creative" },
  { label: "UI/UX web design", category: "Creative" },
  { label: "Brand identity", category: "Creative" },
  { label: "Team leadership", category: "Operations" },
  { label: "Operations management", category: "Operations" },
  { label: "Executive scheduling", category: "Operations" },
  { label: "Worship planning", category: "Ministry" },
  { label: "Audio/visual management", category: "Ministry" },
  { label: "Cross-cultural engagement", category: "Ministry" },
  { label: "Youth mentorship", category: "Ministry" },
  { label: "Japanese study", category: "Ministry" },
  { label: "Specialty coffee", category: "Hospitality" },
];

export default function Home() {
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("All");

  const visibleExperience = useMemo(() => {
    if (activeCategory === "All") {
      return experiences;
    }

    return experiences.filter((experience) => experience.category === activeCategory);
  }, [activeCategory]);

  return (
    <main>
      <section className="hero section-shell">
        <div className="hero__copy">
          <h1 className="hero-title">
            <span className="hero-h1-name">
              <HeroNameLetters />
            </span>
            <span className="hero-h1-rest">
              builds <span style={{ color: "var(--coral)" }}>bridges</span> between
              <br /><span style={{ color: "var(--moss)" }}>people</span>,
              <br /><span style={{ color: "var(--sun)" }}>process</span>, &amp;
              <br /><span style={{ color: "var(--sky)" }}>purpose</span>.
            </span>
       
          </h1>
          <p className="hero__summary">
            Creative Director, Worship Leader, and Organizational Manager with a
            background spanning operations, ministry, brand design, and
            international missions.
          </p>
          <div className="hero__actions">
            <a href="#portfolio" className="button button--primary">
              Explore the Work
            </a>
            <a href="/Jack_Lyons_Resume.pdf" className="button" target="_blank">
              Open PDF Resume
            </a>
          </div>
        </div>

        <aside className="profile-card" aria-label="Profile highlights">
          <PortraitReveal />
          <div className="profile-card__stats">
            <div>
              <strong>Tokyo 東京</strong>
              <span>Mission Field</span>
            </div>
            <div>
              <strong>B.S.</strong>
              <span>Industrial & Organizational Psychology</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="section-shell identity-grid" aria-label="Professional identity">
        <article className="identity-card identity-card--sun">
          <span>Operations</span>
          <strong>Building bridges between <b>people</b>, <b>process</b>, & <b>purpose</b>.</strong>
        </article>
        <article className="identity-card identity-card--sky">
          <span>Creative</span>
          <strong>Shaping brands, visual <b>identities</b>, websites, & <b>stories</b>.</strong>
        </article>
        <article className="identity-card identity-card--moss">
          <span>Ministry</span>
          <strong>Leading <b>worship</b>, <b>youth</b>, & <b>cross-cultural</b> gatherings.</strong>
        </article>
      </section>

      <section className="section-shell split-section">
        <div>
          <h2>"Tell me about yourself."</h2>
        </div>
        <h3>
          Versatile leader with a B.S. in Industrial and Organizational
          Psychology from Troy University. Known for bringing structure and
          creativity together, whether managing a safety products company,
          directing a Sunday service, designing brand materials, or building
          community across cultures.
        </h3>
      </section>

      <section className="section-shell" id="experience">
        <div className="section-heading">
          <div>
            <h2>My job history.</h2>
          </div>
          <div className="filter-bar" aria-label="Filter experience">
            {categories.map((category) => {
              const laneSlug =
                category === "All" ? "all" : category.toLowerCase();
              return (
              <button
                className={[
                  "chip",
                  "chip--lane",
                  `chip--lane-${laneSlug}`,
                  activeCategory === category ? "chip--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
              );
            })}
          </div>
        </div>

        <div className="timeline">
          {visibleExperience.map((experience) => (
            <article className="timeline-card" key={`${experience.role}-${experience.company}`}>
              <div className="timeline-card__top" data-category={experience.category}>
                <span>{experience.dates}</span>
                <strong>{experience.category}</strong>
              </div>
              <h3>{experience.role}</h3>
              <p>
                {experience.company} / {experience.location}
              </p>
              <ul>
                {experience.details.map((detail, detailIndex) => (
                  <li
                    key={`${experience.role}-${experience.company}-${detailIndex}`}
                    dangerouslySetInnerHTML={{ __html: detail }}
                  />
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div id="portfolio">
        <section className="section-shell">
          <div className="section-heading">
            <div>
              <h2>See what I&apos;ve been up to...</h2>
            </div>
          </div>
        </section>

        <BrandIdentitiesCarousel />

        <section className="section-shell" aria-label="Portfolio highlights">
          <PortfolioTriGrid />
        </section>
      </div>

      <section className="section-shell skills-section">
        <div>
          <p className="kicker">Skills & Interests</p>
          <h2>My toolbag.</h2>
        </div>
        <div className="skill-cloud">
          {skills.map(({ label, category }) => (
            <span data-category={category} key={label}>
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="section-shell education-contact">
        <EducationHalftoneCard>
          <p className="kicker" style={{ color: "var(--paper)" }}>Education</p>
          <h2 style={{ color: "var(--paper)" }}>Troy University</h2>
          <p style={{ color: "var(--paper)" }}>
            <b>B.S. Industrial & Organizational Psychology</b>, Minor in <b>Business</b>.
            Chancellor&apos;s List, Provost&apos;s List, Collegiate Singers,
            Concert Chorale, and <i>Frequency Jazz Ensemble</i>.
          </p>
        </EducationHalftoneCard>
        <article>
          <p className="kicker">Connect.</p>
          <h2>Let&apos;s build something <b>memorable</b>.</h2>
          <div className="contact-links">
            <a href="mailto:jlyons564@gmail.com">jlyons564@gmail.com</a>
            <a href="tel:+12562143141">(256) 214-3141</a>
            <a href="https://linkedin.com/in/jackmlyons">LinkedIn</a>
          </div>
        </article>
      </section>
    </main>
  );
}
