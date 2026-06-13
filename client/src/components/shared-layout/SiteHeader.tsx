import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import favicon from "../../assets/favicon.svg";
import "./shared-layout.css";

interface SiteHeaderProps {
  status?: ReactNode;
  children: ReactNode;
}

export function SiteHeader({ status, children }: SiteHeaderProps) {
  return (
    <div className="site-header-layer">
      <header className="site-header">
        <Link className="site-header__logo" to="/" aria-label="Codonot Lite home">
          <span className="site-header__logo-icon">
            <img className="site-header__logo-image" src={favicon} alt="" />
          </span>
          <span className="site-header__brand">
            codonot<span className="site-header__accent">lite</span>
          </span>
        </Link>

        <nav className="site-header__nav">
          <div className="site-header__actions">
            {status ? (
              <span className="site-header__nav-item">{status}</span>
            ) : null}
            <div className="header-buttons">{children}</div>
          </div>
        </nav>
      </header>
    </div>
  );
}
