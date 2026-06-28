import { useEffect, useState } from "react";
import analyticsImageAvif from "../../assets/ai-feature-analytics.avif";
import analyticsImageWebp from "../../assets/ai-feature-analytics.webp";
import assistantImageAvif from "../../assets/ai-feature-assistant.avif";
import assistantImageWebp from "../../assets/ai-feature-assistant.webp";
import codeImageAvif from "../../assets/ai-feature-code.avif";
import codeImageWebp from "../../assets/ai-feature-code.webp";
import streamImageAvif from "../../assets/ai-feature-stream.avif";
import streamImageWebp from "../../assets/ai-feature-stream.webp";
import { useAuth } from "../../context/AuthContext";
import { SEO } from "../../components/SEO";
import { SiteFooter } from "../../components/shared-layout/SiteFooter";
import { DemoControls } from "./DemoControls";
import { HomeHeader } from "./HomeHeader";
import { LoginModal } from "./LoginModal";
import { RegisterModal } from "./RegisterModal";
import { StreamPanel } from "./StreamPanel";
import { useBotStream } from "./useBotStream";
import "./index.css";

interface HelloResponse {
  message: string;
}

const guestVisuals = [
  {
    label: "Code workspace",
    avif: codeImageAvif,
    webp: codeImageWebp,
  },
  {
    label: "AI data stream",
    avif: streamImageAvif,
    webp: streamImageWebp,
  },
  {
    label: "AI assistant",
    avif: assistantImageAvif,
    webp: assistantImageWebp,
  },
  {
    label: "Analytics workspace",
    avif: analyticsImageAvif,
    webp: analyticsImageWebp,
  },
];

export default function Home() {
  const { isAuthenticated, user, register, login, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [pokeData, setPokeData] = useState("");
  const [botAnswer, setBotAnswer] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const stream = useBotStream();

  useEffect(() => {
    fetch("/api/hello")
      .then((response) => response.json() as Promise<HelloResponse>)
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Server unavailable"));
  }, []);

  const clearAnswers = () => {
    stream.clear();
    setBotAnswer("");
    setPokeData("");
  };

  return (
    <div className="page-container">
      <SEO
        title="Codonot Lite | AI Streaming Playground"
        description="Experiment with live AI responses, code generation, Mermaid diagrams, and token-by-token streaming in Codonot Lite."
        path="/"
      />
      <HomeHeader
        isAuthenticated={isAuthenticated}
        message={message}
        userName={user?.name}
        onLogin={() => setIsLoginOpen(true)}
        onRegister={() => setIsRegisterOpen(true)}
        onLogout={logout}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={login}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={register}
      />
      <DemoControls
        isAuthenticated={isAuthenticated}
        onBotAnswerChange={setBotAnswer}
        onPokeDataChange={setPokeData}
        onRawStream={stream.consumeRawStream}
      />

      <section className="hero-banner">
        <div className="hero-banner__glow" />
        <p className="hero-banner__eyebrow">AI / Stream / Playground</p>
        <h1 className="hero-banner__title">
          codonot<span className="hero-banner__accent">lite</span>
        </h1>
        <p className="hero-banner__sub">
          Experiment with live AI streams, token-by-token.
        </p>
      </section>

      {isAuthenticated ? (
        <StreamPanel
          entries={stream.entries}
          prompt={stream.prompt}
          model={stream.model}
          isLoading={stream.isLoading}
          isPaused={stream.isPaused}
          botAnswer={botAnswer}
          pokeData={pokeData}
          onPromptChange={stream.setPrompt}
          onModelChange={stream.setModel}
          onSubmit={stream.consumeSdkStream}
          onTogglePause={stream.togglePause}
          onStop={stream.stop}
          onClear={clearAnswers}
        />
      ) : (
        <section className="guest-visual" aria-label="AI stream preview">
          <div className="guest-visual__copy">
            <span>Live workspace</span>
            <strong>Ideas become working code, one token at a time.</strong>
          </div>
          <div className="guest-visual__grid">
            {guestVisuals.map(({ label, avif, webp }) => (
              <figure className="guest-visual__panel" key={label}>
                <picture>
                  <source srcSet={avif} type="image/avif" />
                  <img
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="640"
                    src={webp}
                    alt={`Pixel art ${label.toLowerCase()}`}
                    className="guest-visual__image"
                  />
                </picture>
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
