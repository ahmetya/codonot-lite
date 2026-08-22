import { useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { SiteFooter } from "../../components/shared-layout/SiteFooter";
import { SiteHeader } from "../../components/shared-layout/SiteHeader";
import {
  aboutDescription,
  aboutExperience,
  aboutNinetiesProfilePortrait,
  aboutPageContent,
  aboutProfilePortrait,
  aboutProfileStructuredData,
  aboutSpecialties,
} from "./About.consts";
import "./index.css";

export default function About() {
  const [isNinetiesMode, setIsNinetiesMode] = useState(false);

  return (
    <div className={`about-page${isNinetiesMode ? " is-90s" : ""}`}>
      <SEO
        title={aboutPageContent.seoTitle}
        description={aboutDescription}
        path="/about"
        type="profile"
        author={aboutPageContent.author}
        structuredData={aboutProfileStructuredData}
      />
      <SiteHeader status={aboutPageContent.headerStatus}>
        <button
          className="about-90s-toggle"
          type="button"
          role="switch"
          aria-checked={isNinetiesMode}
          onClick={() => setIsNinetiesMode((isActive) => !isActive)}
        >
          <span aria-hidden="true">{isNinetiesMode ? "💾" : "🕹️"}</span>
          {isNinetiesMode ? "Escape 1996" : "90s mode"}
        </button>
        <a href="#expertise">{aboutPageContent.nav.expertise}</a>
        <a href="#experience">{aboutPageContent.nav.experience}</a>
        <Link className="highlight" to="/">
          {aboutPageContent.nav.home}
        </Link>
      </SiteHeader>

      {isNinetiesMode ? (
        <div className="about-90s-floaters" aria-hidden="true">
          <span className="floater-skull floater-skull--one">☠</span>
          <span className="floater-skull floater-skull--two">💀</span>
          <span className="floater-at floater-at--one">@</span>
          <span className="floater-at floater-at--two">@</span>
        </div>
      ) : null}

      <main className="about-main">
        <section className="about-hero">
          <div className="about-hero__layout">
            <div>
              <p className="about-kicker">{aboutPageContent.hero.kicker}</p>

              <div className="hero-section">
                <img
                  className="about-hero__portrait"
                  src={
                    isNinetiesMode
                      ? aboutNinetiesProfilePortrait
                      : aboutProfilePortrait
                  }
                  alt={aboutPageContent.hero.portraitAlt}
                />
                <h1 className="hero-name">{aboutPageContent.hero.name}</h1>
              </div>

              <h1 className="hero-name desktop">
                {aboutPageContent.hero.name}
              </h1>

              <p className="about-hero__intro">{aboutPageContent.hero.intro}</p>
              <a className="about-text-link" href="#experience">
                {aboutPageContent.hero.experienceLink}
              </a>
            </div>

            <img
              className="about-hero__portrait desktop"
              src={
                isNinetiesMode
                  ? aboutNinetiesProfilePortrait
                  : aboutProfilePortrait
              }
              alt={aboutPageContent.hero.portraitAlt}
            />
          </div>
        </section>

        {isNinetiesMode ? (
          <aside
            className="about-90s-welcome"
            aria-label="Nineties mode decorations"
          >
            <div className="about-90s-marquee">
              <span>
                ★ WELCOME TO MY HOME PAGE ★ BEST VIEWED IN NETSCAPE NAVIGATOR
                3.0 ★ TURN UP YOUR MODEM ★
              </span>
            </div>
            <div className="about-90s-badges" aria-hidden="true">
              <span className="retro-badge retro-badge--new">NEW!</span>
              <span className="retro-badge retro-badge--browser">
                NETSCAPE NOW!
              </span>
              <span className="retro-badge retro-badge--webmaster">
                WEBMASTER
              </span>
              <span className="retro-badge retro-badge--construction">
                🚧 UNDER CONSTRUCTION 🚧
              </span>
            </div>
          </aside>
        ) : null}

        {isNinetiesMode ? (
          <div className="about-90s-divider" aria-hidden="true">
            <span>🔥</span>
            <span>🔥</span>
            <span>🔥</span>
            <span>🔥</span>
            <strong>HOT LINKS</strong>
            <span>🔥</span>
            <span>🔥</span>
            <span>🔥</span>
            <span>🔥</span>
          </div>
        ) : null}

        <section className="about-section" id="expertise">
          <h2>{aboutPageContent.sections.expertise}</h2>
          <div className="about-skills">
            {aboutSpecialties.map((specialty) => (
              <span key={specialty}>{specialty}</span>
            ))}
          </div>
        </section>

        <section className="about-section" id="experience">
          <h2>{aboutPageContent.sections.experience}</h2>
          <div className="about-timeline">
            {aboutExperience.map((job) => (
              <article className="about-job" key={job.company}>
                <div className="about-job__company">
                  <img src={job.logo} alt={`${job.company} logo`} />
                  <div className="about-job__company-info">
                    <h3>{job.company}</h3>
                    <p>{job.location}</p>
                    <span>{job.total}</span>
                  </div>
                </div>
                <div className="about-job__roles">
                  {job.roles.map((role) => (
                    <div className="about-role" key={role.title}>
                      <div className="about-role__top">
                        <h4>{role.title}</h4>
                        <span className={role.current ? "is-current" : ""}>
                          {role.period}
                        </span>
                      </div>
                      <p>{role.detail}</p>
                      <div className="about-role__skills">
                        {role.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {isNinetiesMode ? (
          <aside className="about-90s-signoff">
            <p className="about-90s-email">📧 E-MAIL THE WEBMASTER 📧</p>
            <p>
              You are visitor
              <span className="about-90s-counter" aria-label="number 001337">
                001337
              </span>
              since 1996
            </p>
            <p className="about-90s-guestbook">📖 SIGN MY GUESTBOOK! 📖</p>
            <small>This site is Y2K compliant · No cookies, only crumbs</small>
          </aside>
        ) : null}
      </main>

      <SiteFooter note={aboutPageContent.footerNote} />
    </div>
  );
}
