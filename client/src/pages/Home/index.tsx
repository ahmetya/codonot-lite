import { useEffect, useState } from "react";
import mainBanner from "../../assets/main-banner-5.png";
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

      <DemoControls
        isAuthenticated={isAuthenticated}
        onBotAnswerChange={setBotAnswer}
        onPokeDataChange={setPokeData}
        onRawStream={stream.consumeRawStream}
      />

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
        <div>
          <img src={mainBanner} alt="Robot" className="robot-image" />
        </div>
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
