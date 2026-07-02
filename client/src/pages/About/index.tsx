import { Link } from "react-router-dom";
import { SEO } from "../../components/SEO";
import { SiteFooter } from "../../components/shared-layout/SiteFooter";
import { SiteHeader } from "../../components/shared-layout/SiteHeader";
import amadeusLogo from "../../assets/company-logos/amadeus.svg";
import betssonLogo from "../../assets/company-logos/betsson-group.svg";
import etiyaLogo from "../../assets/company-logos/etiya.svg";
import garantiLogo from "../../assets/company-logos/garanti-teknoloji.svg";
import "./index.css";

const experience = [
  {
    company: "Betsson Group",
    logo: betssonLogo,
    location: "Ta' Xbiex, Malta",
    total: "4 yrs",
    roles: [
      {
        title: "Frontend Software Development Engineer",
        period: "Dec 2023 - Present",
        detail:
          "Building modern frontend experiences with Angular, Stencil.js, TypeScript, and JavaScript in a hybrid product environment.",
        skills: [
          "Angular",
          "Stencil.js",
          "TypeScript",
          "JavaScript",
          "Frontend",
        ],
        current: true,
      },
      {
        title: "Senior Software Development Engineer in Test",
        period: "Jul 2022 - Dec 2023",
        detail:
          "Designed reliable browser automation and quality tooling for fast-moving web products.",
        skills: ["Playwright", "Puppeteer", "Test automation"],
      },
    ],
  },
  {
    company: "Amadeus",
    logo: amadeusLogo,
    location: "Istanbul, Türkiye",
    total: "4 yrs 6 mos",
    roles: [
      {
        title: "Senior Quality Assurance Engineer",
        period: "Feb 2018 - Jul 2022",
        detail:
          "Led automation frameworks for Angular applications and REST APIs, CI/CD quality tooling, service virtualization, and performance testing.",
        skills: ["Selenium", "Docker", "Jenkins", "SonarQube", "Gatling"],
      },
    ],
  },
  {
    company: "Garanti Teknoloji",
    logo: garantiLogo,
    location: "Istanbul, Türkiye",
    total: "2 yrs 10 mos",
    roles: [
      {
        title: "Senior Software QA Engineer",
        period: "May 2015 - Feb 2018",
        detail:
          "Implemented web and mobile test automation, service virtualization, performance testing, and unit-test tooling.",
        skills: ["Selenium", "Appium", "Cucumber", "LoadRunner"],
      },
    ],
  },
  {
    company: "Etiya",
    logo: etiyaLogo,
    location: "Istanbul, Türkiye",
    total: "2 yrs 6 mos",
    roles: [
      {
        title: "Test Specialist",
        period: "Feb 2015 - May 2015",
        detail:
          "Worked across functional and middleware integration testing, service virtualization, and Selenium automation.",
        skills: ["Selenium", "SOA", "Integration testing"],
      },
      {
        title: "Test Assistant Specialist",
        period: "Dec 2012 - Feb 2015",
        detail:
          "Created test scenarios and automation infrastructure for enterprise systems.",
        skills: ["Test design", "Automation", "Service virtualization"],
      },
    ],
  },
];

const specialties = [
  "Angular and TypeScript",
  "Frontend architecture",
  "Test automation",
  "CI/CD and developer tooling",
  "Performance and reliability",
];

export default function About() {
  return (
    <div className="about-page">
      <SEO
        title="Ahmet Yalcinkaya | Frontend Software Developer"
        description="Frontend software developer in Malta focused on Angular, Stencil.js, TypeScript, frontend architecture, automation, and reliable delivery."
        path="/about"
        type="profile"
      />
      <SiteHeader status="Ahmet Yalcinkaya / Frontend Software Developer">
        <a href="#expertise">Expertise</a>
        <a href="#experience">Experience</a>
        <Link className="highlight" to="/">
          Home
        </Link>
      </SiteHeader>

      <main className="about-main">
        <section className="about-hero">
          <p className="about-kicker">Frontend Software Developer · Malta</p>
          <h1>Ahmet Yalcinkaya</h1>
          <p className="about-hero__intro">
            I build reliable web products with Angular, Stencil.js, and
            TypeScript. My background in quality engineering shapes how I
            approach frontend architecture, automation, and delivery.
          </p>
          <a className="about-text-link" href="#experience">
            View experience ↓
          </a>
        </section>

        <section className="about-section" id="expertise">
          <h2>Expertise</h2>
          <div className="about-skills">
            {specialties.map((specialty) => (
              <span key={specialty}>{specialty}</span>
            ))}
          </div>
        </section>

        <section className="about-section" id="experience">
          <h2>Experience</h2>
          <div className="about-timeline">
            {experience.map((job) => (
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

      <SiteFooter note="Ahmet Yalcinkaya / Frontend Software Developer" />
    </div>
  );
}
