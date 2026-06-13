import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  REGISTER_CONFIG,
  REGISTER_COPY,
} from "./RegisterModal.consts";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ message: string; email: string }>;
}

export function RegisterModal({
  isOpen,
  onClose,
  onRegister,
}: RegisterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const closeModal = useCallback(() => {
    setError("");
    setSuccess("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    nameInputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, closeModal]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < REGISTER_CONFIG.minimumPasswordLength) {
      setError(REGISTER_COPY.passwordTooShort);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onRegister(name.trim(), email.trim(), password);
      setName("");
      setEmail("");
      setPassword("");
      setSuccess(
        `${result.message} ${REGISTER_COPY.successEmailPrefix} ${result.email}.`
      );
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : REGISTER_COPY.registrationFailed
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) closeModal();
      }}
    >
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
      >
        <div className="auth-modal__header">
          <div>
            <p className="auth-modal__eyebrow">{REGISTER_COPY.eyebrow}</p>
            <h2 id="register-title">{REGISTER_COPY.title}</h2>
          </div>
          <button
            className="auth-modal__close"
            type="button"
            onClick={closeModal}
            aria-label={REGISTER_COPY.closeLabel}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <p className="auth-modal__intro">
          {REGISTER_COPY.intro}
        </p>

        {success ? (
          <div className="auth-form__success" role="status">
            <strong>{REGISTER_COPY.successTitle}</strong>
            <p>{success}</p>
            <button type="button" onClick={closeModal}>
              {REGISTER_COPY.done}
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              {REGISTER_COPY.nameLabel}
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </label>
            <label>
              {REGISTER_COPY.emailLabel}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              {REGISTER_COPY.passwordLabel}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={REGISTER_CONFIG.minimumPasswordLength}
                required
              />
            </label>

            {error && (
              <p className="auth-form__error" role="alert">
                {error}
              </p>
            )}

            <div className="auth-form__actions">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                {REGISTER_COPY.cancel}
              </button>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? REGISTER_COPY.submitting
                  : REGISTER_COPY.submit}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
