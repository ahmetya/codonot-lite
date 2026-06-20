import { useNavigate } from "react-router-dom";
import { SiteHeader } from "../../components/shared-layout/SiteHeader";

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
  const navigate = useNavigate();

  return (
    <SiteHeader
      status={isAuthenticated ? `Hello ${userName ?? "there"}!` : message}
    >
      <button className="highlight-low" onClick={() => navigate("/about")}>
        About me
      </button>
      <button className="highlight-low" onClick={() => navigate("/rxjs")}>
        Learn RxJS ⚛️
      </button>
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
    </SiteHeader>
  );
}
