import { useEffect, useId, useState } from "react";

interface MermaidDiagramProps {
  code: string;
  fallback: React.ReactNode;
}

export function MermaidDiagram({ code, fallback }: MermaidDiagramProps) {
  const reactId = useId();
  const [svg, setSvg] = useState("");
  const [hasError, setHasError] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    const removeRenderArtifact = () => {
      document.getElementById(id)?.remove();
      document.getElementById(`d${id}`)?.remove();
    };

    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "dark",
          fontFamily: "system-ui, sans-serif",
        });

        await mermaid.parse(code, { suppressErrors: true });
        const { svg: renderedSvg } = await mermaid.render(id, code);
        removeRenderArtifact();

        if (!cancelled) {
          setSvg(renderedSvg);
          setHasError(false);
        }
      } catch {
        removeRenderArtifact();
        if (!cancelled) {
          setSvg("");
          setHasError(true);
        }
      }
    };

    void renderDiagram();
    return () => {
      cancelled = true;
      removeRenderArtifact();
    };
  }, [code, reactId]);

  if (hasError) return fallback;

  return (
    <div className="mermaid-block">
      <div className="mermaid-block__header">
        <span>mermaid</span>
        <button
          type="button"
          className="mermaid-block__toggle"
          onClick={() => setShowCode((current) => !current)}
        >
          {showCode ? "Diagram" : "Code"}
        </button>
      </div>
      {showCode ? (
        fallback
      ) : svg ? (
        <div
          className="mermaid-block__diagram"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="mermaid-block__loading">Rendering diagram...</div>
      )}
    </div>
  );
}
