import { lazy, Suspense } from "react";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github-dark.css";
import type { StreamEntry, StreamSegment } from "./stream-types";

const MermaidDiagram = lazy(() =>
  import("./MermaidDiagram").then((module) => ({
    default: module.MermaidDiagram,
  }))
);

interface StreamOutputProps {
  entries: StreamEntry[];
}

function buildSegments(entries: StreamEntry[]): StreamSegment[] {
  const segments: StreamSegment[] = [];
  let inCode = false;
  let codeLang = "";
  let key = 0;

  for (const entry of entries) {
    if (entry.type === "response-end") {
      inCode = false;
      codeLang = "";
      continue;
    }

    if (entry.type === "prompt") {
      inCode = false;
      codeLang = "";
      segments.push({
        type: "prompt",
        line: `Prompt: ${entry.value}`,
        key: key++,
      });
      continue;
    }

    const cleaned = entry.value.replace(/\*/g, "").trim();

    if (cleaned.startsWith("```")) {
      if (inCode) {
        const previous = segments[segments.length - 1];
        if (previous?.type === "code") previous.complete = true;
      }
      codeLang = inCode ? "" : cleaned.slice(3).trim().toLowerCase();
      inCode = !inCode;
      continue;
    }

    if (inCode) {
      const line = entry.value.replace(/\s+$/, "");
      const previous = segments[segments.length - 1];

      if (previous?.type === "code") {
        previous.lines.push(line);
      } else {
        segments.push({
          type: "code",
          lines: [line],
          lang: codeLang,
          key: key++,
          complete: false,
        });
      }
      continue;
    }

    if (cleaned) {
      segments.push({ type: "text", line: cleaned, key: key++ });
    }
  }

  return segments;
}

function renderCodeSegment(segment: Extract<StreamSegment, { type: "code" }>) {
  const nonEmptyLines = segment.lines.filter((line) => line.trim());
  const commonIndent = nonEmptyLines.reduce((minimum, line) => {
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    return Math.min(minimum, indent);
  }, Infinity);
  const padding = Number.isFinite(commonIndent) ? commonIndent : 0;
  const code = segment.lines.map((line) => line.slice(padding)).join("\n");
  const highlighted =
    segment.lang && hljs.getLanguage(segment.lang)
      ? hljs.highlight(code, { language: segment.lang })
      : hljs.highlightAuto(code);

  const codeBlock = (
    <div className="code-block-wrap">
      <div className="code-block__lang">
        {segment.lang || highlighted.language || "text"}
      </div>
      <pre className="code-block">
        <code dangerouslySetInnerHTML={{ __html: highlighted.value }} />
      </pre>
    </div>
  );

  if (segment.lang === "mermaid" && segment.complete) {
    return (
      <Suspense
        key={segment.key}
        fallback={
          <div className="mermaid-block__loading">Loading diagram tools...</div>
        }
      >
        <MermaidDiagram code={code} fallback={codeBlock} />
      </Suspense>
    );
  }

  return <div key={segment.key}>{codeBlock}</div>;
}

export function StreamOutput({ entries }: StreamOutputProps) {
  return buildSegments(entries).map((segment) => {
    if (segment.type === "prompt") {
      return (
        <pre className="prompt-block" key={segment.key}>
          {segment.line}
        </pre>
      );
    }

    if (segment.type === "code") {
      return renderCodeSegment(segment);
    }

    const label = segment.line.match(/^([A-Za-z][A-Za-z0-9 /]*):(.*)$/);
    if (label) {
      return (
        <pre key={segment.key}>
          <strong className="answer-label">{label[1]}:</strong>
          {label[2]}
        </pre>
      );
    }

    return <pre key={segment.key}>{segment.line}</pre>;
  });
}
