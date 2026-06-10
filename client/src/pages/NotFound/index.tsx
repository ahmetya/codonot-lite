import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import favicon from "../../assets/favicon.svg";
import notFoundImage from "../../assets/not-found.png";
import "./index.css";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.content;

    document.title = "Page Not Found | Codonot Lite";
    if (robots) robots.content = "noindex, follow";

    return () => {
      document.title = previousTitle;
      if (robots && previousRobots) robots.content = previousRobots;
    };
  }, []);

  return (
    <main className="not-found-page">
      <header className="not-found-header">
        <Link className="not-found-brand" to="/" aria-label="Codonot Lite home">
          <img src={favicon} alt="" />
          <span>
            codonot<strong>lite</strong>
          </span>
        </Link>
        <span className="not-found-header__status">Connection lost</span>
      </header>

      <section className="not-found-content">
        <div className="not-found-copy">
          <p className="not-found-eyebrow">Error / 404</p>
          <h1>This route dropped from the stream.</h1>
          <p className="not-found-description">
            We could not find{" "}
            <code className="not-found-path">{location.pathname}</code>. The
            page may have moved, or the address may be incomplete.
          </p>
          <div className="not-found-actions">
            <Link className="not-found-primary" to="/">
              Return home
            </Link>
            <button type="button" onClick={() => window.history.back()}>
              Go back
            </button>
          </div>
        </div>

        <figure className="not-found-visual">
          <img
            src={notFoundImage}
            alt="Pixel art AI assistant investigating a disconnected data cable"
          />
          <figcaption>
            <span className="not-found-visual__dot" />
            Signal unavailable
          </figcaption>
        </figure>
      </section>

      <footer className="not-found-footer">
        <span>codonotlite</span>
        <span>AI stream playground</span>
      </footer>
    </main>
  );
}
