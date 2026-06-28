import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "../../components/SEO";
import favicon from "../../assets/favicon.svg";
import {
  VERIFICATION_STATE,
  VERIFY_EMAIL_COPY,
  VERIFY_EMAIL_ENDPOINTS,
  VERIFY_EMAIL_REQUEST_HEADERS,
  type VerificationState,
} from "./VerifyEmail.consts";
import "./index.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>(
    VERIFICATION_STATE.loading
  );
  const [message, setMessage] = useState<string>(VERIFY_EMAIL_COPY.initialMessage);
  const [email, setEmail] = useState<string>("");
  const [resendMessage, setResendMessage] = useState<string>("");
  const [isResending, setIsResending] = useState<boolean>(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState(VERIFICATION_STATE.error);
      setMessage(VERIFY_EMAIL_COPY.missingToken);
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(VERIFY_EMAIL_ENDPOINTS.verify, {
          method: "POST",
          headers: VERIFY_EMAIL_REQUEST_HEADERS,
          body: JSON.stringify({ token }),
        });
        const data = (await response.json()) as {
          message?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || VERIFY_EMAIL_COPY.verifyFailed);
        }

        setState(VERIFICATION_STATE.success);
        setMessage(data.message || VERIFY_EMAIL_COPY.verifiedFallback);
      } catch (error) {
        setState(VERIFICATION_STATE.error);
        setMessage(
          error instanceof Error
            ? error.message
            : VERIFY_EMAIL_COPY.verificationFailed
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
      const response = await fetch(VERIFY_EMAIL_ENDPOINTS.resend, {
        method: "POST",
        headers: VERIFY_EMAIL_REQUEST_HEADERS,
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || VERIFY_EMAIL_COPY.resendFailed);
      }
      setResendMessage(data.message || VERIFY_EMAIL_COPY.resendFallback);
    } catch (error) {
      setResendMessage(
        error instanceof Error
          ? error.message
          : VERIFY_EMAIL_COPY.resendFailed
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="verify-page">
      <SEO
        title="Verify Email | Codonot Lite"
        description="Verify your Codonot Lite account email address."
        path="/verify-email"
        robots="noindex, follow"
      />
      <section className={`verify-card verify-card--${state}`}>
        <Link className="verify-brand" to="/">
          <img src={favicon} alt="" />
          <span>
            codonot<strong>lite</strong>
          </span>
        </Link>

        <div className="verify-status" aria-hidden="true">
          {state === VERIFICATION_STATE.loading
            ? VERIFY_EMAIL_COPY.loadingStatus
            : state === VERIFICATION_STATE.success
              ? VERIFY_EMAIL_COPY.successStatus
              : VERIFY_EMAIL_COPY.errorStatus}
        </div>
        <p className="verify-eyebrow">{VERIFY_EMAIL_COPY.eyebrow}</p>
        <h1>
          {state === VERIFICATION_STATE.loading
            ? VERIFY_EMAIL_COPY.loadingHeading
            : state === VERIFICATION_STATE.success
              ? VERIFY_EMAIL_COPY.successHeading
              : VERIFY_EMAIL_COPY.errorHeading}
        </h1>
        <p className="verify-message">{message}</p>

        {state === VERIFICATION_STATE.error && (
          <form className="verify-resend" onSubmit={resendVerification}>
            <label htmlFor="verification-email">
              {VERIFY_EMAIL_COPY.resendLabel}
            </label>
            <div>
              <input
                id="verification-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={VERIFY_EMAIL_COPY.emailPlaceholder}
                required
              />
              <button type="submit" disabled={isResending}>
                {isResending
                  ? VERIFY_EMAIL_COPY.resending
                  : VERIFY_EMAIL_COPY.resend}
              </button>
            </div>
            {resendMessage && <p role="status">{resendMessage}</p>}
          </form>
        )}

        <Link className="verify-home" to="/">
          {state === VERIFICATION_STATE.success
            ? VERIFY_EMAIL_COPY.continueToLogin
            : VERIFY_EMAIL_COPY.returnHome}
        </Link>
      </section>
    </main>
  );
}
