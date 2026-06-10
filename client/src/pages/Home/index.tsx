import { useEffect, useState } from "react";
import analyticsImage from "../../assets/ai-feature-analytics.png";
import assistantImage from "../../assets/ai-feature-assistant.png";
import codeImage from "../../assets/ai-feature-code.png";
import streamImage from "../../assets/ai-feature-stream.png";
import { useAuth } from "../../context/AuthContext";
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
  { label: "Code workspace", image: codeImage },
  { label: "AI data stream", image: streamImage },
  { label: "AI assistant", image: assistantImage },
  { label: "Analytics workspace", image: analyticsImage },
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
            {guestVisuals.map(({ label, image }) => (
              <figure className="guest-visual__panel" key={label}>
                <img
                  loading="lazy"
                  src={image}
                  alt={`Pixel art ${label.toLowerCase()}`}
                  className="guest-visual__image"
                />
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer className="site-footer">
        <span className="site-footer__brand">
          codonot<span className="site-footer__accent">lite</span>
        </span>
        <span className="site-footer__sep">/</span>
        <span className="site-footer__note">AI stream playground</span>
      </footer>
    </div>
  );
}
