import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { SiteFooter } from "../../components/shared-layout/SiteFooter";
import { SiteHeader } from "../../components/shared-layout/SiteHeader";
import {
  aboutDescription,
  aboutExperience,
  aboutPageContent,
  aboutProfilePortrait,
  aboutProfileStructuredData,
  aboutSpecialties,
} from "./About.consts";
import "./index.css";

export default function About() {
  return (
    <div className="about-page">
      <SEO
        title={aboutPageContent.seoTitle}
        description={aboutDescription}
        path="/about"
        type="profile"
        author={aboutPageContent.author}
        structuredData={aboutProfileStructuredData}
      />
      <SiteHeader status={aboutPageContent.headerStatus}>
        <a href="#expertise">{aboutPageContent.nav.expertise}</a>
        <a href="#experience">{aboutPageContent.nav.experience}</a>
        <Link className="highlight" to="/">
          {aboutPageContent.nav.home}
        </Link>
      </SiteHeader>

      <main className="about-main">
        <section className="about-hero">
          <div className="about-hero__layout">
            <div>
              <p className="about-kicker">{aboutPageContent.hero.kicker}</p>

              <div className="hero-section">
                <img
                  className="about-hero__portrait"
                  src={aboutProfilePortrait}
                  alt={aboutPageContent.hero.portraitAlt}
                />
                <h1 className="hero-name">{aboutPageContent.hero.name}</h1>
              </div>

              <h1 className="hero-name desktop">
                {aboutPageContent.hero.name}
              </h1>

              <p className="about-hero__intro">
                {aboutPageContent.hero.intro}
              </p>
              <a className="about-text-link" href="#experience">
                {aboutPageContent.hero.experienceLink}
              </a>
            </div>

            <img
              className="about-hero__portrait desktop"
              src={aboutProfilePortrait}
              alt={aboutPageContent.hero.portraitAlt}
            />
          </div>
        </section>

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
      </main>

      <SiteFooter note={aboutPageContent.footerNote} />
    </div>
  );
}
