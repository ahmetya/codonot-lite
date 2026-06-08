import { useCallback, useRef, useState } from "react";
import type { StreamEntry } from "./stream-types";

const DEFAULT_MODEL = "gemma-4-26b-a4b-it";

interface GoogleStreamEvent {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

function getEventText(event: GoogleStreamEvent): string {
  return (
    event.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? ""
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useBotStream() {
  const [entries, setEntries] = useState<StreamEntry[]>([]);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const lineBufferRef = useRef("");
  const isPausedRef = useRef(false);
  const resumeRef = useRef<(() => void) | null>(null);
  const resumePromiseRef = useRef<Promise<void> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamRunRef = useRef(0);

  const setPaused = useCallback((paused: boolean) => {
    isPausedRef.current = paused;
    setIsPaused(paused);

    if (!paused) {
      resumeRef.current?.();
      resumeRef.current = null;
      resumePromiseRef.current = null;
    }
  }, []);

  const waitWhilePaused = useCallback(async () => {
    if (!isPausedRef.current) return;

    if (!resumePromiseRef.current) {
      resumePromiseRef.current = new Promise<void>((resolve) => {
        resumeRef.current = resolve;
      });
    }

    await resumePromiseRef.current;
  }, []);

  const togglePause = useCallback(() => {
    if (!isLoading) return;
    setPaused(!isPausedRef.current);
  }, [isLoading, setPaused]);

  const appendText = useCallback((text: string) => {
    lineBufferRef.current += text;
    if (!lineBufferRef.current.includes("\n")) return;

    const lines = lineBufferRef.current.split("\n");
    lineBufferRef.current = lines.pop() ?? "";
    setEntries((current) => [
      ...current,
      ...lines.map((line) => ({ type: "line" as const, value: line })),
    ]);
  }, []);

  const finishResponse = useCallback(() => {
    const remaining = lineBufferRef.current;
    lineBufferRef.current = "";
    setEntries((current) => [
      ...current,
      ...(remaining ? [{ type: "line" as const, value: remaining }] : []),
      { type: "response-end" },
    ]);
  }, []);

  const stop = useCallback(() => {
    if (!abortControllerRef.current) return;

    streamRunRef.current += 1;
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
    setPaused(false);
    finishResponse();
    setIsLoading(false);
  }, [finishResponse, setPaused]);

  const consumeSdkStream = useCallback(
    async (value: string) => {
      const normalizedPrompt = value.trim();
      if (!normalizedPrompt || isLoading) return;

      const runId = ++streamRunRef.current;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      setIsLoading(true);
      setPaused(false);
      lineBufferRef.current = "";
      setEntries((current) => [
        ...current,
        { type: "prompt", value: normalizedPrompt },
      ]);

      try {
        const response = await fetch(
          `/api/helperbot/stream-sdk?model=${encodeURIComponent(model)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: normalizedPrompt }),
            signal: abortController.signal,
          }
        );

        if (!response.ok || !response.body) {
          throw new Error(`Failed to initialize stream: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          await waitWhilePaused();
          const { value: chunk, done } = await reader.read();
          if (done) break;
          await waitWhilePaused();

          const text = decoder.decode(chunk, { stream: true });
          if (text) appendText(text);
        }

        const finalText = decoder.decode();
        if (finalText) appendText(finalText);
      } catch (error) {
        if (!isAbortError(error)) {
          console.error("Error reading frontend stream:", error);
        }
      } finally {
        if (streamRunRef.current === runId) {
          abortControllerRef.current = null;
          setPaused(false);
          finishResponse();
          setIsLoading(false);
        }
      }
    },
    [
      appendText,
      finishResponse,
      isLoading,
      model,
      setPaused,
      waitWhilePaused,
    ]
  );

  const consumeRawStream = useCallback(async () => {
    if (isLoading) return;

    const runId = ++streamRunRef.current;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsLoading(true);
    setPaused(false);
    lineBufferRef.current = "";
    const rawPrompt = "Make a joke about robots";
    setEntries((current) => [
      ...current,
      { type: "prompt", value: rawPrompt },
    ]);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${baseUrl}/helperbot/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: rawPrompt }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to initialize stream: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let eventBuffer = "";

      while (true) {
        await waitWhilePaused();
        const { value: chunk, done } = await reader.read();
        await waitWhilePaused();
        eventBuffer += decoder.decode(chunk, { stream: !done });

        const events = eventBuffer.split(/\r?\n\r?\n/);
        eventBuffer = events.pop() ?? "";

        for (const event of events) {
          const data = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .join("");

          if (!data || data === "[DONE]") continue;

          try {
            const text = getEventText(JSON.parse(data) as GoogleStreamEvent);
            if (text) appendText(text);
          } catch {
            console.warn("Skipped malformed SSE event.");
          }
        }

        if (done) break;
      }
    } catch (error) {
      if (!isAbortError(error)) {
        console.error("Error reading raw stream:", error);
      }
    } finally {
      if (streamRunRef.current === runId) {
        abortControllerRef.current = null;
        setPaused(false);
        finishResponse();
        setIsLoading(false);
      }
    }
  }, [
    appendText,
    finishResponse,
    isLoading,
    setPaused,
    waitWhilePaused,
  ]);

  const clear = useCallback(() => {
    if (abortControllerRef.current) {
      streamRunRef.current += 1;
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPaused(false);
    setIsLoading(false);
    lineBufferRef.current = "";
    setEntries([]);
    setPrompt("");
  }, [setPaused]);

  return {
    entries,
    prompt,
    setPrompt,
    model,
    setModel,
    isLoading,
    isPaused,
    togglePause,
    stop,
    consumeSdkStream,
    consumeRawStream,
    clear,
  };
}
