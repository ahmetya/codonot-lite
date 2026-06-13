import "./shared-layout.css";

interface SiteFooterProps {
  note?: string;
}

export function SiteFooter({
  note = "AI stream playground",
}: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <span className="site-footer__brand">
        codonot<span className="site-footer__accent">lite</span>
      </span>
      <span className="site-footer__sep">/</span>
      <span className="site-footer__note">{note}</span>
    </footer>
  );
}
