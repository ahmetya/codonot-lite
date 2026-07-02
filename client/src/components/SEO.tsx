import { useEffect } from "react";

const SITE_URL = "https://lite.codonot.com";
const SITE_NAME = "Codonot Lite";
const DEFAULT_IMAGE = `${SITE_URL}/social-preview.png`;

type RobotsDirective = "index, follow" | "noindex, follow";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  robots?: RobotsDirective;
  googlebot?: RobotsDirective;
  type?: "website" | "profile";
}

function setMetaContent(selector: string, content: string) {
  const meta = document.querySelector<HTMLMetaElement>(selector);
  if (meta) {
    meta.content = content;
    return;
  }

  const nextMeta = document.createElement("meta");
  const nameMatch = selector.match(/meta\[name="([^"]+)"\]/);
  const propertyMatch = selector.match(/meta\[property="([^"]+)"\]/);

  if (nameMatch) nextMeta.name = nameMatch[1];
  if (propertyMatch) nextMeta.setAttribute("property", propertyMatch[1]);
  nextMeta.content = content;
  document.head.append(nextMeta);
}

function setCanonical(url: string) {
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = url;
}

export function SEO({
  title,
  description,
  path = "/",
  robots = "index, follow",
  googlebot = robots,
  type = "website",
}: SEOProps) {
  useEffect(() => {
    const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
    const url = `${SITE_URL}${normalizedPath}`;

    document.title = title;
    setCanonical(url);
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[name="robots"]', robots);
    setMetaContent('meta[name="googlebot"]', googlebot);
    setMetaContent('meta[property="og:type"]', type);
    setMetaContent('meta[property="og:site_name"]', SITE_NAME);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', url);
    setMetaContent('meta[property="og:image"]', DEFAULT_IMAGE);
    setMetaContent(
      'meta[property="og:image:alt"]',
      "Codonot Lite AI streaming playground",
    );
    setMetaContent('meta[name="twitter:card"]', "summary_large_image");
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);
    setMetaContent('meta[name="twitter:image"]', DEFAULT_IMAGE);
  }, [description, googlebot, path, robots, title, type]);

  return null;
}
