import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import * as Rx from "rxjs";
import * as RxOps from "rxjs/operators";
import { rxjsModules } from "./modulesData";
import VimTextarea from "./VimTextarea";
import "./index.css";

interface MarbleNode {
  id: string;
  time: number;
  label: string;
  type: "next" | "complete" | "error";
  position: number;
  tooltip: string;
}

export default function RxjsPlayground() {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const activeModule = rxjsModules[activeModuleIndex];

  // Editor states
  const [code, setCode] = useState(activeModule.defaultCode);
  const [logs, setLogs] = useState<string[]>([]);
  const [marbles, setMarbles] = useState<MarbleNode[]>([]);
  const [running, setRunning] = useState(false);
  const [timelineCursor, setTimelineCursor] = useState(0);

  // Exercise tracking
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Pokemon Search States (Module 7 Demo)
  const [pokemonQuery, setPokemonQuery] = useState("");
  const [pokemonResults, setPokemonResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const activeSubscriptions = useRef<Rx.Subscription[]>([]);
  const activeIntervals = useRef<ReturnType<typeof setInterval>[]>([]);

  // Update code when module changes
  useEffect(() => {
    stopExecution();
    setCode(activeModule.defaultCode);
    setLogs([]);
    setMarbles([]);
    setShowHint(false);
    setShowSolution(false);
  }, [activeModuleIndex]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopExecution();
    };
  }, []);

  const stopExecution = () => {
    // Unsubscribe all active RxJS subscriptions
    activeSubscriptions.current.forEach((sub) => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
    activeSubscriptions.current = [];

    // Clear all tickers/timers
    activeIntervals.current.forEach((intervalId) => clearInterval(intervalId));
    activeIntervals.current = [];

    setRunning(false);
  };

  const runCode = () => {
    stopExecution();
    setLogs([]);
    setMarbles([]);
    setRunning(true);
    setTimelineCursor(0);

    const startTime = Date.now();

    // Create a 5-second progress ticker for the visual cursor
    const cursorInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 5000) {
        clearInterval(cursorInterval);
        setRunning(false);
      } else {
        setTimelineCursor((elapsed / 5000) * 100);
      }
    }, 30);
    activeIntervals.current.push(cursorInterval);

    // Custom logger injected to the script
    const localLog = (val: any) => {
      const elapsed = Date.now() - startTime;
      const logString =
        typeof val === "object" ? JSON.stringify(val) : String(val);

      setLogs((prev) => [
        ...prev,
        `[${(elapsed / 1000).toFixed(2)}s] ${logString}`,
      ]);

      let type: "next" | "complete" | "error" = "next";
      let label = "";

      if (/complete|done/i.test(logString)) {
        type = "complete";
        label = "|";
      } else if (/error/i.test(logString)) {
        type = "error";
        label = "X";
      } else {
        // Parse the emitted value
        const match = logString.match(
          /(?:emit|emission|tick|of|array|merge|concat|combinelatest|result|sub\s\d):\s*([^\s]+)/i
        );
        if (match && match[1]) {
          label = match[1].substring(0, 4);
        } else {
          // Fallback to grabbing first few characters of the logged statement
          label = logString.substring(0, 3);
        }
      }

      const position = Math.min((elapsed / 5000) * 100, 100);

      setMarbles((prev) => [
        ...prev,
        {
          id: `${elapsed}-${Math.random()}`,
          time: elapsed,
          label,
          type,
          position,
          tooltip: logString,
        },
      ]);
    };

    // Intercept Observable.prototype.subscribe to capture subscriptions
    const originalSubscribe = Rx.Observable.prototype.subscribe;
    const subsList: Rx.Subscription[] = [];

    Rx.Observable.prototype.subscribe = function (...args: any[]) {
      const sub = originalSubscribe.apply(this, args as any);
      subsList.push(sub);
      activeSubscriptions.current.push(sub);
      return sub;
    };

    try {
      // Injected libraries
      const injectedRxjs = {
        ...Rx,
        operators: RxOps,
      };

      // Create runner function and execute
      const runner = new Function("rxjs", "log", code);
      runner(injectedRxjs, localLog);
    } catch (err: any) {
      localLog(`Compilation/Runtime Error: ${err.message}`);
      setRunning(false);
    } finally {
      // Restore subscribe method
      Rx.Observable.prototype.subscribe = originalSubscribe;
    }
  };

  // Module 7 Demo - RxJS Subject for search
  const searchSubject$ = useMemo(() => new Rx.Subject<string>(), []);

  useEffect(() => {
    if (activeModule.id !== 7) return;

    setSearchLoading(true);
    const sub = searchSubject$
      .pipe(
        RxOps.debounceTime(400),
        RxOps.distinctUntilChanged(),
        RxOps.tap(() => setSearchLoading(true)),
        RxOps.switchMap((query) => {
          if (!query.trim()) {
            return Rx.of([]);
          }
          return Rx.from(
            fetch(
              `https://pokeapi.co/api/v2/pokemon/${query.toLowerCase().trim()}`
            )
              .then((res) => {
                if (!res.ok) throw new Error();
                return res.json();
              })
              .then((data) => [
                {
                  name: data.name,
                  id: data.id,
                  sprite:
                    data.sprites.front_default ||
                    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
                  height: data.height,
                  weight: data.weight,
                },
              ])
              .catch(() => [])
          );
        }),
        RxOps.tap(() => setSearchLoading(false))
      )
      .subscribe((results) => {
        setPokemonResults(results);
      });

    // Seed initial results
    searchSubject$.next("pikachu");

    return () => sub.unsubscribe();
  }, [activeModule.id, searchSubject$]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setPokemonQuery(query);
    searchSubject$.next(query);
  };

  return (
    <div className="rxjs-page">
      <header className="rxjs-header">
        <h1>
          <span>⚛️</span> RxJS Visual Learning Lab
        </h1>
        <Link className="back-btn" to="/">
          ← Back to codonot-lite
        </Link>
      </header>

      <div className="rxjs-container">
        {/* Sidebar */}
        <aside className="rxjs-sidebar">
          <div className="sidebar-title">Step-by-Step Guide</div>
          <nav className="module-nav-list" aria-label="RxJS modules navigation">
            {rxjsModules.map((mod, idx) => (
              <button
                key={mod.id}
                onClick={() => setActiveModuleIndex(idx)}
                className={`module-nav-item ${activeModuleIndex === idx ? "active" : ""}`}
              >
                <h3>{mod.title}</h3>
                <p>{mod.shortDesc}</p>
              </button>
            ))}
          </nav>
        </aside>

        {/* Workspace */}
        <main className="rxjs-workspace">
          {/* Module Explainer */}
          <section className="module-intro">
            <div className="concept-tags">
              {activeModule.concepts.map((tag) => (
                <span key={tag} className="concept-tag">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="module-title">{activeModule.title}</h2>
            <div className="module-explanation">{activeModule.explanation}</div>
          </section>

          {/* Interactive Playground Section */}
          <section className="playground-grid">
            {/* Editor Panel */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Interactive Sandbox Code</span>
              </div>
              <VimTextarea
                key={activeModule.id}
                value={code}
                onChange={setCode}
                className="editor-textarea"
              />
              <div className="editor-actions">
                <button
                  onClick={runCode}
                  className="btn btn-primary"
                  disabled={running}
                >
                  {running ? "Running..." : "▶ Run Code"}
                </button>
                {running && (
                  <button onClick={stopExecution} className="btn btn-danger">
                    ■ Stop / Clean Up
                  </button>
                )}
                <button
                  onClick={() => setCode(activeModule.defaultCode)}
                  className="btn btn-secondary"
                  disabled={running}
                >
                  Reset Example
                </button>
              </div>
            </div>

            {/* Console / Output logs Panel */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Console Output Logs</span>
              </div>
              <div className="console-output">
                {logs.length === 0 ? (
                  <div className="log-placeholder">
                    Click Run to see stream outputs...
                  </div>
                ) : (
                  logs.map((logStr, idx) => (
                    <div
                      key={idx}
                      className={`log-entry ${logStr.includes("Error:") ? "runtime-error" : ""}`}
                    >
                      {logStr}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Marble Diagram Visualizer */}
          <section
            className="marble-timeline-container"
            aria-label="Marble timeline visualization"
          >
            <div className="timeline-title-row">
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                🔮 Interactive Marble Timeline (5s window)
              </h3>
              {running && (
                <span style={{ fontSize: "0.8rem", color: "#e10098" }}>
                  Stream Active...
                </span>
              )}
            </div>

            <div className="timeline-axis">
              <div className="timeline-line" />
              <div className="timeline-arrow" />

              {/* Running Ticker Head */}
              {running && (
                <div
                  style={{
                    position: "absolute",
                    left: `${timelineCursor}%`,
                    top: 0,
                    bottom: 0,
                    width: "2px",
                    backgroundColor: "#e10098",
                    boxShadow: "0 0 8px #e10098",
                    zIndex: 2,
                  }}
                />
              )}

              {/* Marbles */}
              {marbles.map((node) => (
                <div
                  key={node.id}
                  className={`timeline-node node-${node.type}`}
                  style={{ left: `${node.position}%` }}
                >
                  {node.type !== "complete" && node.label}
                  <div className="node-tooltip">
                    {node.tooltip.substring(0, 18)}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
              * Colored spheres indicate next emissions. Vertical lines indicate
              completion (|). Crosses indicate errors (X).
            </p>
          </section>

          {/* Exercises Panel */}
          <section className="exercise-panel">
            <div className="exercise-title">
              <span>✍️</span> Learning Exercise Challenge
            </div>
            <p style={{ margin: 0, color: "#d1d5db" }}>
              {activeModule.exercise.question}
            </p>

            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}
            >
              <button
                onClick={() => setShowHint(!showHint)}
                className="btn btn-secondary"
              >
                {showHint ? "Hide Hint" : "Get Hint"}
              </button>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="btn btn-secondary"
              >
                {showSolution ? "Hide Target Code" : "Show Target Code"}
              </button>
            </div>

            {showHint && (
              <div className="hint-box">💡 {activeModule.exercise.hint}</div>
            )}

            {showSolution && (
              <pre
                style={{
                  background: "#080a14",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "#34d399",
                  overflowX: "auto",
                  border: "1px solid rgba(52, 211, 153, 0.2)",
                  margin: 0,
                }}
              >
                <code>{activeModule.exercise.targetSolution}</code>
              </pre>
            )}
          </section>

          {/* Special Autocomplete UI Demo for Module 7 */}
          {activeModule.id === 7 && (
            <section className="autocomplete-demo">
              <h3
                style={{ marginTop: 0, color: "#ff59c3", fontSize: "1.1rem" }}
              >
                🔍 Live Autocomplete Search component (Driven by RxJS Subject &
                switchMap)
              </h3>
              <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                Type a Pokemon name (e.g. <code>pikachu</code>,{" "}
                <code>charizard</code>, <code>ditto</code>,{" "}
                <code>bulbasaur</code>) below. Watch how it cancels previous
                requests using <code>switchMap</code>!
              </p>
              <input
                type="text"
                placeholder="Search Pokémon..."
                value={pokemonQuery}
                onChange={handleSearchChange}
                className="demo-input"
              />

              {searchLoading && (
                <p style={{ color: "#e10098", fontSize: "0.85rem" }}>
                  API Requesting...
                </p>
              )}

              <div className="pokemon-results-grid">
                {pokemonResults.map((p) => (
                  <div key={p.id} className="pokemon-card">
                    <img src={p.sprite} alt={p.name} />
                    <h4>{p.name}</h4>
                    <span>
                      Height: {p.height} | Weight: {p.weight}
                    </span>
                  </div>
                ))}
                {!searchLoading &&
                  pokemonResults.length === 0 &&
                  pokemonQuery.trim() && (
                    <div
                      style={{
                        gridColumn: "1/-1",
                        color: "#ef4444",
                        fontSize: "0.85rem",
                      }}
                    >
                      No Pokémon found.
                    </div>
                  )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
