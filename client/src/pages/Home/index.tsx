import { useState, useEffect, useRef } from "react";
import "./index.css";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { Utils } from "../../services/utils";
import { Library } from "../../services/library";
import { Book } from "../../services/book";
import { SlotMachine } from "../../services/slotMachine";
import { apiService } from "../../services/ApiService";
import { useAuth } from "../../context/AuthContext";
import mainBanner2 from "../../assets/main-banner-2.jpg";

interface HelloResponse {
  message: string;
}

const utils = new Utils("Ahmet");
const slotMachine = new SlotMachine(100);

export default function Home() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [pokeData, setPokeData] = useState<string>("");
  const [botAmswerGroup, setBotAnswerGroup] = useState<string[]>([]);
  const [botAmswer, setBotAnswer] = useState<string>("");
  const [streamPrompt, setStreamPrompt] = useState<string>("");
  const bufferRef = useRef("");
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data: HelloResponse) => setMessage(data.message));
  }, []);

  useEffect(() => {
    const el = answerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [botAmswerGroup]);

  const handlePoke = () => {
    fetch("/api/poke")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setPokeData(data.name); // Store the height of the Pokemon as a string
        console.log("Poke API data:", data); // Log the height of the Pokemon
      });
    console.log("Fetching Pokemon data...");
  };

  const testCallbackWithPromise = () => {
    utils
      .callbackWithPromise(10, (result) => {
        console.log("Callback with Promise result:", result);
      })
      .then((finalResult) => {
        console.log("Final result from Promise:", finalResult);
      });
  };

  const testFetchWithPromise = async () => {
    await utils
      .fetchWithPromise("/api/hello", (result) => {
        console.log("Callback from fetchWithPromise:", result);
        return result; // Return the result to be used in the next .then() block
      })
      .then((finalResult) => {
        console.log("Final result from fetchWithPromise:", finalResult);
      })
      .catch((error) => {
        console.error("Error in fetchWithPromise:", error);
      });
  };

  const someCallback = async (addWord: string): Promise<void> => {
    console.log("Callback with some word:", addWord);

    const res = await utils
      .fetchWithPromise("/api/hello", (result) => result)
      .then((result) => {
        console.log("Result from fetchWithPromise in someCallback:", result);
        return result;
      });

    const res2 = await utils.fetchWithPromise("/api/hello", (result) => result);

    console.log(
      "res2  Result from fetchWithPromise in someCallback (second call):",
      res2
    );

    console.log(
      "Result from fetchWithPromise in someCallback (immediately after call):",
      res
    );

    utils.doubleCallback(5, (result, result2) => {
      console.log("First callback result:", result);
      console.log("Second callback result:", result2);
    });

    utils
      .fetchWithPromise("/api/hello", (result) => {
        console.log(
          "re4 Callback from fetchWithPromise in doubleCallback:",
          result
        );

        return `${JSON.stringify(result)}AAAA`;
      })
      .then((result) => {
        console.log(
          `#################### ret Final result from fetchWithPromise in doubleCallback:`,
          result
        );
      });
  };

  const testFetchWithPromiseError = async () => {
    const res = await utils.fetchWithPromise("/api/hello", (result) => {
      console.log("Callback from fetchWithPromise (error case):", result);
      return result;
    });

    console.log("Result from fetchWithPromise (error case):", res);
  };

  // Gets pokemon data and writes to db
  const testPokemonService = async () => {
    await fetch("/api/pokemon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pokeId: 1, name: "Bulbasaur" }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Created Pokemon:", data);
      })
      .catch((err) => {
        console.error("Error creating Pokemon:", err);
      });
  };

  const generateRandomId = () => {
    return Math.floor(Math.random() * 100) + 1; // Generate a random ID between 1 and 100
  };

  const testPokemonServiceExternal = async () => {
    const randomId = generateRandomId();
    await fetch(`/api/pokemon/${randomId}?poke=${randomId}&gender=male`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Pokemon:", data);
        setPokeData(data.name);
      })
      .catch((err) => {
        console.error("Error fetching Pokemon:", err);
      });
  };

  const saySimple = () => {
    console.log("Simple say function");
  };

  const arrayManipulation = () => {
    const numbers = [1, 2, 3, 4, 5];

    const squaredNumbers = numbers.map((num, index, array) => {
      console.log(`Number: ${num}, Index: ${index}, Array: ${array}`);

      return num * num;
    });

    numbers.reduce;

    console.log("Squared Numbers:", squaredNumbers);
  };

  const someSample = () => {
    const res = fetch("/api/hello")
      .then((res) => {
        return res.json().then((data) => {
          console.log("111 Data from /api/hello in someSample:", data);
          return { data, ...{ extra: "Extra data from someSample" } }; // Return the data along with extra information
        });
      })
      .then((data) => {
        console.log("222 Data from /api/hello in someSample:", data);
        return data;
      });

    console.log(utils.name); // Accessing the name property of the Utils instance
    // this allways being called immediately after the fetch call, not waiting for the fetch to complete
    console.log("Fetch result in someSample:", res);
  };

  const helperBot = async () => {
    const res = await fetch("/api/helperbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: "make me a joke about robots" }),
    });

    let data = await res.json();
    data = { data, ...{ extra: "Extra data from someSample" } };

    setBotAnswer(data.data);

    console.log(data);

    console.log(utils.name); // Accessing the name property of the Utils instance
    // this allways being called immediately after the fetch call, not waiting for the fetch to complete
    console.log("Fetch result in someSample:", res);
  };

  const testLibrary = () => {
    const lib = new Library("Kutupanne");
    const hayat = new Book("Hayat Bilgisi", "Ahmet", "978-0135957059");
    const mezat = new Book("Mezat Bilgisi", "Ahmet", "978-0135957060");
    lib.catalog.add(hayat);
    lib.catalog.add(mezat);

    lib.loan.borrow("978-0135957059");
    lib.loan.borrow("978-0135957060");
    lib.loan.borrow("978-0135957060");
    lib.loan.listBorrowed();

    lib.return("978-0135957060");
    lib.loan.listBorrowed();

    console.log(lib.totalLibCount);
  };

  const getSlotMachine = () => {
    slotMachine.spin();
  };

  const botStream = async () => {
    // Frontend consumption sample:
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/helperbot/stream`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Make a joke about robots",
        }),
      }
    );

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          flushBuffer();
          break;
        }

        const rawLine = decoder.decode(value);
        // Parse lines starting with "data: " to read incoming JSON patches safely!

        const parsed = parseSSELine(rawLine);
        if (parsed) {
          const text = parsed.candidates[0]?.content?.parts[0].text;

          // parsed.candidates[0]?.content?.parts
          //   ?.map((p: Record<string, string>) => p.text)
          //   .join("") ?? "";

          handleChunk(text);
        }
      }
    }
  };

  function handleChunk(text: string) {
    bufferRef.current += text;

    // Only update state when we have a complete line
    if (bufferRef.current.includes("\n")) {
      const lines = bufferRef.current.split("\n");

      // Last element may be incomplete — keep it raw in buffer (preserve indentation)
      bufferRef.current = lines.pop() ?? "";

      setBotAnswerGroup((prev) => [...prev, ...lines]);
    }
  }

  function flushBuffer() {
    if (bufferRef.current !== "") {
      const remaining = bufferRef.current;
      bufferRef.current = "";
      setBotAnswerGroup((prev) => [...prev, remaining]);
    }
  }

  function parseSSELine(line: string) {
    if (!line.startsWith("data: ")) return null;

    const jsonStr = line.slice("data: ".length).trim();

    // SSE streams often end with a [DONE] marker
    if (jsonStr === "[DONE]") return null;

    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      // console.error("Failed to parse SSE line:", e);
      return null;
    }
  }

  function cleanAnswers() {
    setBotAnswerGroup([]);
    setBotAnswer("");
    setPokeData("");
  }

  async function consumeGemmaStream(
    prompt: string,
    onTokenReceived?: (token: string) => void
  ): Promise<void> {
    cleanAnswers();
    bufferRef.current = "";

    try {
      // 1. Fire a standard POST request to your Express server endpoint
      const response = await fetch(
        `https://lite.codonot.com/api/helperbot/stream-sdk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        }
      );

      // 2. Error handling if the server breaks down immediately
      if (!response.ok || !response.body) {
        throw new Error(`Failed to initialize stream: ${response.statusText}`);
      }

      // 3. Attach a reader to lock and read the raw incoming body stream
      const reader = response.body.getReader();
      // TextDecoder transforms binary Uint8Array chunks back into readable UTF-8 text strings
      const decoder = new TextDecoder();

      // 4. Enter a continuous loop to stream the chunks as they pull through the network
      while (true) {
        const { value, done } = await reader.read();

        // If done is true, the server has closed the response via res.end()
        if (done) {
          flushBuffer();
          break;
        }

        // 5. Decode the current buffer chunk
        const textToken = decoder.decode(value, { stream: true });

        // 6. Push the token out to your UI state (e.g., React setState, Vue ref, or innerHTML)
        if (textToken) {
          handleChunk(textToken);

          if (onTokenReceived) {
            onTokenReceived(textToken);
          }
        }
      }

      console.log("Stream successfully finished.");
    } catch (error) {
      console.error("Error reading frontend stream:", error);
    }
  }

  const codingBlock = () => {
    // First pass: group tokens into segments (code blocks merged, rest individual)
    type Segment =
      | { type: "code"; lines: string[]; lang: string; key: number }
      | { type: "text"; line: string; key: number };
    const segments: Segment[] = [];
    let inCode = false;
    let codeLang = "";
    let keyCounter = 0;

    for (const token of botAmswerGroup) {
      const cleaned = token.replace(/\*/g, "").trim();
      if (cleaned.startsWith("```")) {
        if (!inCode) {
          // Opening fence: capture language (e.g. ```typescript)
          codeLang = cleaned.slice(3).trim().toLowerCase();
        } else {
          // Closing fence: reset so the next block doesn't inherit it
          codeLang = "";
        }
        inCode = !inCode;
        continue;
      }
      if (inCode) {
        // Preserve raw line: keep indentation, don't strip asterisks
        const raw = token.replace(/\s+$/, "");
        const last = segments[segments.length - 1];
        if (last?.type === "code") {
          last.lines.push(raw);
        } else {
          segments.push({
            type: "code",
            lines: [raw],
            lang: codeLang,
            key: keyCounter++,
          });
        }
      } else {
        segments.push({
          type: "text",
          line: cleaned,
          key: keyCounter++,
        });
      }
    }

    // Second pass: render segments
    return segments.map((seg) => {
      if (seg.type === "code") {
        // Dedent: remove the common leading whitespace shared by all
        // non-empty lines so relative indentation is preserved.
        const nonEmpty = seg.lines.filter((l) => l.trim() !== "");
        const minIndent = nonEmpty.reduce((min, l) => {
          const indent = l.match(/^\s*/)?.[0].length ?? 0;
          return Math.min(min, indent);
        }, Infinity);
        const pad = Number.isFinite(minIndent) ? minIndent : 0;
        const code = seg.lines.map((l) => l.slice(pad)).join("\n");
        const highlighted =
          seg.lang && hljs.getLanguage(seg.lang)
            ? hljs.highlight(code, { language: seg.lang })
            : hljs.highlightAuto(code);
        const langLabel = seg.lang || highlighted.language || "text";
        return (
          <div key={seg.key} className="code-block-wrap">
            <div className="code-block__lang">{langLabel}</div>
            <pre className="code-block">
              <code dangerouslySetInnerHTML={{ __html: highlighted.value }} />
            </pre>
          </div>
        );
      }
      const match = seg.line.match(/^([A-Za-z][A-Za-z0-9 /]*):(.*)$/);
      if (match) {
        return (
          <pre key={seg.key}>
            <strong className="answer-label">{match[1]}:</strong>
            {match[2]}
          </pre>
        );
      }
      return <pre key={seg.key}>{seg.line}</pre>;
    });
  };

  const apiRegisterTest = async () => {
    const email = "admin@example.com";
    const password = "admin123";
    const name = "admin";

    try {
      const response = await apiService.register(email, password, name);
      console.log("Registration successful:", response);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const apiLoginTest = async () => {
    const email = "admin@example.com";
    const password = "admin123";

    try {
      const response = await apiService.login(email, password);
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <div className="page-container">
        <header className="site-header">
          <div className="site-header__logo">
            <span className="site-header__logo-icon">&#9644;</span>
            <span className="site-header__brand">
              codonot<span className="site-header__accent">lite</span>
            </span>
          </div>
          <nav className="site-header__nav">
            <div className="auth">
              {!isAuthenticated && (
                <>
                  <span className="site-header__nav-item">{message}</span>
                  <div className="header-buttons">
                    <button
                      onClick={() => login("admin@example.com", "admin123")}
                    >
                      Login
                    </button>
                    <button>Register</button>
                  </div>
                </>
              )}

              {isAuthenticated && (
                <>
                  <span className="site-header__nav-item">
                    Hello {user?.name}!
                  </span>
                  <div className="header-buttons">
                    <button onClick={logout}>Logout</button>
                    <button>Create Post</button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </header>

        <div className="hero-banner">
          <div className="hero-banner__glow" />
          <p className="hero-banner__eyebrow">AI · Stream · Playground</p>
          <h1 className="hero-banner__title">
            codonot<span className="hero-banner__accent">lite</span>
          </h1>
          <p className="hero-banner__sub">
            Experiment with live AI streams, token-by-token.
          </p>
        </div>

        <div className="generic">
          <button onClick={apiRegisterTest}>API Register Test</button>
          <button onClick={() => apiLoginTest()}>API Login Test</button>

          {isAuthenticated && (
            <>
              <button className="button-auth" onClick={getSlotMachine}>
                HAPPY SLOT{" "}
              </button>
              <button className="button-auth" onClick={testLibrary}>
                Library Test
              </button>
              <button className="button-auth" onClick={arrayManipulation}>
                Array Manipulation
              </button>
              <button className="button-auth" onClick={someSample}>
                Some Sample
              </button>
              <button
                className="button-auth"
                onClick={() => someCallback("Hello")}
              >
                Some Callback
              </button>
              <button className="button-auth" onClick={handlePoke}>
                Poke Button
              </button>
              <button className="button-auth" onClick={testPokemonService}>
                Test Pokemon Service
              </button>
              <button className="button-auth" onClick={() => utils.sayHello()}>
                Say Hello
              </button>
              <button
                className="button-auth"
                onClick={() => utils.sayGoodbye()}
              >
                Say Goodbye
              </button>
              <button className="button-auth" onClick={() => saySimple()}>
                Say Simple
              </button>
            </>
          )}

          <button onClick={testCallbackWithPromise}>
            Callback with Promise Test
          </button>
          <button onClick={testFetchWithPromise}>
            Fetch with Promise Test
          </button>
          <button onClick={testFetchWithPromiseError}>
            Fetch with Promise Error Test
          </button>
          <button onClick={testPokemonServiceExternal}>
            Test Pokemon Service External
          </button>
          <button onClick={cleanAnswers}>Clean Answers</button>

          <button
            onClick={() =>
              utils.callbackTest(5, (result) => {
                console.log("Callback result:", result);
              })
            }
          >
            Callback Test
          </button>
          <button onClick={helperBot}>Helper Bot</button>
          <button onClick={() => botStream()}>Stream Answer</button>
        </div>

        {isAuthenticated && (
          <>
            <div className="bot-wrapper">
              <div className="search-bar">
                <input
                  type="text"
                  id="ai-prompt"
                  value={streamPrompt}
                  onChange={(e) => setStreamPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && streamPrompt.trim() !== "") {
                      consumeGemmaStream(streamPrompt);
                    } else if (e.key === "Escape") {
                      setStreamPrompt("");
                    }
                  }}
                  placeholder="Enter prompt..."
                />

                <button onClick={() => consumeGemmaStream(streamPrompt)}>
                  Stream Bot
                </button>
              </div>{" "}
              <div className="answer-wrapper" ref={answerRef}>
                <p>{botAmswer}</p>
                <p>{pokeData}</p>
                {codingBlock()}
              </div>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <>
            <div>
              <img
                src={mainBanner2}
                alt="Robot"
                className="robot-image"
              />
            </div>
          </>
        )}

        <footer className="site-footer">
          <span className="site-footer__brand">
            codonot<span className="site-footer__accent">lite</span>
          </span>
          <span className="site-footer__sep">·</span>
          <span className="site-footer__note">AI stream playground</span>
        </footer>
      </div>
    </>
  );
}
