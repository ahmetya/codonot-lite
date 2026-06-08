import favicon from "../../assets/favicon.svg";

interface HomeHeaderProps {
  isAuthenticated: boolean;
  message: string;
  userName?: string;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

export function HomeHeader({
  isAuthenticated,
  message,
  userName,
  onLogin,
  onRegister,
  onLogout,
}: HomeHeaderProps) {
  return (
    <div className="site-header-layer">
      <header className="site-header">
        <div className="site-header__logo">
          <span className="site-header__logo-icon">
            <img className="logo" src={favicon} alt="Codonot Lite Logo" />
          </span>
          <span className="site-header__brand">
            codonot<span className="site-header__accent">lite</span>
          </span>
        </div>

        <nav className="site-header__nav">
          <div className="auth">
            <span className="site-header__nav-item">
              {isAuthenticated ? `Hello ${userName ?? "there"}!` : message}
            </span>
            <div className="header-buttons">
              <button
                className="highlight-low"
                onClick={isAuthenticated ? onLogout : onLogin}
              >
                {isAuthenticated ? "Logout" : "Login"}
              </button>
              <button
                className="highlight"
                onClick={isAuthenticated ? undefined : onRegister}
              >
                {isAuthenticated ? "Create Post" : "Register"}
              </button>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
