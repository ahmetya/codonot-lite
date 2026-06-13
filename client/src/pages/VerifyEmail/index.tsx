import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import favicon from "../../assets/favicon.svg";
import "./index.css";

type VerificationState = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await response.json()) as {
          message?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Unable to verify this email");
        }

        setState("success");
        setMessage(data.message || "Your email has been verified.");
      } catch (error) {
        setState("error");
        setMessage(
          error instanceof Error ? error.message : "Email verification failed"
        );
      }
    };

    void verify();
  }, [searchParams]);

  const resendVerification = async (event: FormEvent) => {
    event.preventDefault();
    setIsResending(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Unable to resend email");
      setResendMessage(data.message || "Check your inbox for a new link.");
    } catch (error) {
      setResendMessage(
        error instanceof Error ? error.message : "Unable to resend email"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="verify-page">
      <section className={`verify-card verify-card--${state}`}>
        <Link className="verify-brand" to="/">
          <img src={favicon} alt="" />
          <span>
            codonot<strong>lite</strong>
          </span>
        </Link>

        <div className="verify-status" aria-hidden="true">
          {state === "loading" ? "..." : state === "success" ? "OK" : "!"}
        </div>
        <p className="verify-eyebrow">Email verification</p>
        <h1>
          {state === "loading"
            ? "Checking your link"
            : state === "success"
              ? "You are verified"
              : "Link unavailable"}
        </h1>
        <p className="verify-message">{message}</p>

        {state === "error" && (
          <form className="verify-resend" onSubmit={resendVerification}>
            <label htmlFor="verification-email">Send a new link</label>
            <div>
              <input
                id="verification-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
              <button type="submit" disabled={isResending}>
                {isResending ? "Sending..." : "Resend"}
              </button>
            </div>
            {resendMessage && <p role="status">{resendMessage}</p>}
          </form>
        )}

        <Link className="verify-home" to="/">
          {state === "success" ? "Continue to login" : "Return home"}
        </Link>
      </section>
    </main>
  );
}
