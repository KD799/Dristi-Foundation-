import { useEffect, useRef } from "react";
import "./AtelierNorth.css";

const clients = [
  "Halden",
  "Mercer",
  "Ostra",
  "Northwind",
  "Lumen",
  "Kite",
  "Parallel",
  "Oxide",
];

const projects = [
  {
    name: "Halden Coffee",
    discipline: "Identity",
    year: "2026",
    className: "halden",
    art: (
      <>
        <span className="halden-disc" />
        <span className="halden-mark" />
        <span className="halden-wordmark">Halden</span>
      </>
    ),
  },
  {
    name: "Mercer Bank",
    discipline: "Digital product",
    year: "2025",
    className: "mercer",
    art: (
      <div className="wallet-cards">
        <span className="wallet-card wallet-card--back" />
        <span className="wallet-card wallet-card--middle" />
        <span className="wallet-card wallet-card--front">
          <span className="wallet-bar wallet-bar--primary" />
          <span className="wallet-bar wallet-bar--secondary" />
        </span>
      </div>
    ),
  },
  {
    name: "Ostra Ceramics",
    discipline: "Packaging",
    year: "2025",
    className: "ostra",
    art: (
      <div className="ostra-arches">
        <span className="ostra-arch ostra-arch--clay" />
        <span className="ostra-arch ostra-arch--bone" />
        <span className="ostra-arch ostra-arch--olive" />
      </div>
    ),
  },
  {
    name: "Field Studies",
    discipline: "Editorial",
    year: "2024",
    className: "field",
    art: (
      <>
        <span className="field-rule" />
        <span className="field-wordmark">F/S</span>
      </>
    ),
  },
];

function CopenhagenClock() {
  const clockRef = useRef(null);

  useEffect(() => {
    const clock = clockRef.current;
    if (!clock || typeof Intl === "undefined" || !Intl.DateTimeFormat) return undefined;

    let formatter;
    try {
      formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Copenhagen",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      formatter.format(new Date());
    } catch {
      clock.hidden = true;
      return undefined;
    }

    const updateTime = () => {
      clock.textContent = `CPH ${formatter.format(new Date())}`;
    };

    updateTime();
    const intervalId = window.setInterval(updateTime, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <span
      className="atelier-clock"
      ref={clockRef}
      aria-label="Current time in Copenhagen"
      aria-live="off"
    />
  );
}

function ClientList({ duplicate = false }) {
  return (
    <ul className="atelier-marquee-list" aria-hidden={duplicate ? "true" : undefined}>
      {clients.map((client) => (
        <li className="atelier-marquee-item" key={client}>
          <span>{client}</span>
          <span className="atelier-marquee-slash" aria-hidden="true">
            /
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function AtelierNorth() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Atelier North — Independent Brand & Digital Studio";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="atelier-page" id="top">
      <div className="atelier-frame">
        <header className="atelier-header">
          <a className="atelier-brand atelier-link" href="#top">
            Atelier North
          </a>
          <p className="atelier-location">Copenhagen / New York</p>
          <div className="atelier-header-right">
            <nav className="atelier-nav" aria-label="Main navigation">
              <a className="atelier-link" href="#work">
                Work
              </a>
              <a className="atelier-link" href="#studio">
                Studio
              </a>
              <a className="atelier-link" href="#contact">
                Contact
              </a>
            </nav>
            <CopenhagenClock />
          </div>
        </header>

        <main>
          <section className="atelier-hero" aria-labelledby="atelier-title">
            <h1 className="atelier-title" id="atelier-title">
              <span className="atelier-title-clip">
                <span>We design brands</span>
              </span>
              <span className="atelier-title-clip">
                <span>
                  that age well<span className="atelier-orange">.</span>
                </span>
              </span>
            </h1>
            <div className="atelier-intro" id="studio">
              <div className="atelier-intro-block">
                <p className="atelier-eyebrow">Studio</p>
                <p className="atelier-intro-copy">
                  Independent brand and digital studio. Fourteen people, two cities, one
                  standard.
                </p>
              </div>
              <div className="atelier-intro-block">
                <p className="atelier-eyebrow">Services</p>
                <p className="atelier-intro-copy">
                  Identity, Digital products, Packaging, Motion, Editorial
                </p>
              </div>
            </div>
          </section>

          <section className="atelier-work" id="work" aria-labelledby="work-heading">
            <div className="atelier-section-heading">
              <h2 id="work-heading">Selected work</h2>
              <p>2023 to 2026</p>
            </div>
            <div className="atelier-work-grid">
              {projects.map((project) => (
                <a
                  className={`atelier-project atelier-project--${project.className}`}
                  href="#contact"
                  key={project.name}
                  aria-label={`${project.name}, ${project.discipline}, ${project.year}. Get in touch about a project.`}
                >
                  <div
                    className={`atelier-art atelier-art--${project.className}`}
                    aria-hidden="true"
                  >
                  <div className="atelier-art-inner">{project.art}</div>
                  </div>
                  <div className="atelier-project-caption">
                    <h3>{project.name}</h3>
                    <span className="atelier-project-meta">
                      {project.discipline}, {project.year}
                      <span className="atelier-project-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="atelier-clients" aria-labelledby="clients-heading">
            <h2 className="atelier-eyebrow" id="clients-heading">
              Clients include
            </h2>
            <div className="atelier-marquee" aria-label="Selected clients">
              <div className="atelier-marquee-track">
                <ClientList />
                <ClientList duplicate />
              </div>
            </div>
          </section>

          <section className="atelier-numbers" aria-labelledby="numbers-heading">
            <h2 className="atelier-eyebrow" id="numbers-heading">
              The studio in numbers
            </h2>
            <div className="atelier-number-grid">
              <div className="atelier-number">
                <p className="atelier-number-value">14</p>
                <p className="atelier-number-label">years independent</p>
              </div>
              <div className="atelier-number">
                <p className="atelier-number-value">120+</p>
                <p className="atelier-number-label">brands launched</p>
              </div>
              <div className="atelier-number">
                <p className="atelier-number-value">9</p>
                <p className="atelier-number-label">design awards</p>
              </div>
            </div>
          </section>

          <section className="atelier-contact" id="contact" aria-labelledby="contact-heading">
            <h2 className="atelier-eyebrow" id="contact-heading">
              New business
            </h2>
            <a className="atelier-contact-link atelier-link" href="mailto:hello@ateliernorth.studio">
              <span>Start a project</span>
              <span className="atelier-contact-arrow" aria-hidden="true">
                →
              </span>
            </a>
            <div className="atelier-contact-grid">
              <a className="atelier-email atelier-link" href="mailto:hello@ateliernorth.studio">
                hello@ateliernorth.studio
              </a>
              <address className="atelier-address">
                <span>Copenhagen</span>
                <span>Bredgade 24, 1260 København K</span>
              </address>
              <address className="atelier-address">
                <span>New York</span>
                <span>61 Greene St, New York, NY 10012</span>
              </address>
            </div>
          </section>
        </main>

        <footer className="atelier-footer">
          <p>© 2026 Atelier North</p>
          <nav className="atelier-socials" aria-label="Social links">
            <a className="atelier-link" href="https://www.instagram.com/">
              Instagram
            </a>
            <a className="atelier-link" href="https://www.linkedin.com/">
              LinkedIn
            </a>
            <a className="atelier-link" href="https://www.are.na/">
              Are.na
            </a>
          </nav>
          <a className="atelier-link atelier-back-to-top" href="#top">
            Back to top ↑
          </a>
        </footer>
      </div>
    </div>
  );
}
