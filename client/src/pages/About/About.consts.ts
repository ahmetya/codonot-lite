import amadeusLogo from "../../assets/company-logos/amadeus.svg";
import betssonLogo from "../../assets/company-logos/betsson-group.svg";
import etiyaLogo from "../../assets/company-logos/etiya.svg";
import garantiLogo from "../../assets/company-logos/garanti-teknoloji.svg";
import profilePortrait from "../../assets/about-profile.webp";

export const aboutProfilePortrait = profilePortrait;

export const aboutPageContent = {
  seoTitle: "Ahmet Yalcinkaya | Frontend Software Developer in Malta",
  author: "Ahmet Yalcinkaya",
  headerStatus: "Ahmet Yalcinkaya / Frontend Software Developer",
  footerNote: "Ahmet Yalcinkaya / Frontend Software Developer",
  nav: {
    expertise: "Expertise",
    experience: "Experience",
    home: "Home",
  },
  hero: {
    kicker: "Frontend Software Developer · Malta",
    name: "Ahmet Yalcinkaya",
    intro:
      "I'm Ahmet Yalcinkaya, a frontend software developer in Malta. I build reliable web products with Angular, Stencil.js, and TypeScript. My background in quality engineering shapes how I approach frontend architecture, automation, and delivery.",
    experienceLink: "View experience ↓",
    portraitAlt: "Professional profile portrait of Ahmet Yalcinkaya",
  },
  sections: {
    expertise: "Expertise",
    experience: "Experience",
  },
};

export const aboutExperience = [
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

export const aboutSpecialties = [
  "Angular and TypeScript",
  "Frontend architecture",
  "Test automation",
  "CI/CD and developer tooling",
  "Performance and reliability",
];

export const aboutDescription =
  "Ahmet Yalcinkaya is a frontend software developer in Malta specializing in Angular, Stencil.js, TypeScript, frontend architecture, test automation, and reliable delivery.";

export const aboutProfileStructuredData = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://lite.codonot.com/about#profile-page",
  url: "https://lite.codonot.com/about",
  name: "About Ahmet Yalcinkaya",
  description: aboutDescription,
  mainEntity: {
    "@type": "Person",
    "@id": "https://lite.codonot.com/about#ahmet-yalcinkaya",
    name: "Ahmet Yalcinkaya",
    givenName: "Ahmet",
    familyName: "Yalcinkaya",
    url: "https://lite.codonot.com/about",
    jobTitle: "Frontend Software Developer",
    description: aboutDescription,
    address: {
      "@type": "PostalAddress",
      addressCountry: "Malta",
    },
    knowsAbout: aboutSpecialties,
    worksFor: {
      "@type": "Organization",
      name: "Betsson Group",
    },
  },
};