import { useEffect, useRef } from "react";
import pause from "../../assets/pause.svg";
import play from "../../assets/play.svg";
import stop from "../../assets/stop.svg";
import trash from "../../assets/trash.svg";
import { ToggleGroup } from "../../components/toggle-group/toggle-group";
import { StreamOutput } from "./StreamOutput";
import type { StreamEntry } from "./stream-types";

interface StreamPanelProps {
  entries: StreamEntry[];
  prompt: string;
  model: string;
  isLoading: boolean;
  isPaused: boolean;
  botAnswer: string;
  pokeData: string;
  onPromptChange: (prompt: string) => void;
  onModelChange: (model: string) => void;
  onSubmit: (prompt: string) => void;
  onTogglePause: () => void;
  onStop: () => void;
  onClear: () => void;
}

export function StreamPanel({
  entries,
  prompt,
  model,
  isLoading,
  isPaused,
  botAnswer,
  pokeData,
  onPromptChange,
  onModelChange,
  onSubmit,
  onTogglePause,
  onStop,
  onClear,
}: StreamPanelProps) {
  const answerRef = useRef<HTMLDivElement>(null);
  const isEmpty = !entries.length && !botAnswer && !pokeData;

  useEffect(() => {
    const element = answerRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [entries]);

  return (
    <div className="bot-wrapper">
      <div className="answer-wrapper" ref={answerRef}>
        <div className={`answer-content ${isEmpty ? "is-empty" : ""}`}>
          {isEmpty ? (
            <div className="answer-empty-state">
              <div className="answer-empty-state__mark" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <p className="answer-empty-state__title">Ready when you are</p>
              <p className="answer-empty-state__hint">
                Ask for code, an explanation, or a quick implementation.
              </p>
            </div>
          ) : (
            <>
              <p>{botAnswer}</p>
              <p>{pokeData}</p>
              <StreamOutput entries={entries} />
            </>
          )}
        </div>
      </div>

      <div className="search-bar">
        <div className="toggle-group">
          <ToggleGroup value={model} onChange={onModelChange} />
        </div>
        <input
          type="text"
          id="ai-prompt"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && prompt.trim() && !isLoading) {
              onSubmit(prompt);
            } else if (event.key === "Escape") {
              onPromptChange("");
            }
          }}
          placeholder="Enter prompt..."
          disabled={isLoading}
        />

        <div className="bot-controls">
          <div className="stream-icon-controls">
            <button
              className="icon-button pause-button"
              onClick={onTogglePause}
              title={isPaused ? "Resume stream" : "Pause stream"}
              aria-label={isPaused ? "Resume stream" : "Pause stream"}
              disabled={!isLoading}
            >
              <img src={isPaused ? play : pause} alt="" aria-hidden="true" />
            </button>
            <button
              className="icon-button stop-button"
              onClick={onStop}
              title="Stop stream"
              aria-label="Stop stream"
              disabled={!isLoading}
            >
              <img src={stop} alt="" aria-hidden="true" />
            </button>
            <button
              className="icon-button clean-button"
              onClick={onClear}
              title="Clean Answers"
              aria-label="Clean answers"
            >
              <img src={trash} alt="Trash" />
            </button>
          </div>
          <button
            className="stream-submit-button"
            onClick={() => onSubmit(prompt)}
            disabled={isLoading || !prompt.trim()}
          >
            {isPaused ? "Paused" : isLoading ? "Streaming..." : "Stream Bot"}
          </button>
        </div>
      </div>
    </div>
  );
}
