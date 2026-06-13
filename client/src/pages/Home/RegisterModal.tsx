import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

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

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onRegister(name.trim(), email.trim(), password);
      setName("");
      setEmail("");
      setPassword("");
      setSuccess(`${result.message} We sent the link to ${result.email}.`);
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Registration failed"
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
            <p className="auth-modal__eyebrow">Create account</p>
            <h2 id="register-title">Join codonot-lite</h2>
          </div>
          <button
            className="auth-modal__close"
            type="button"
            onClick={closeModal}
            aria-label="Close registration"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <p className="auth-modal__intro">
          Save your session and unlock the AI stream playground.
        </p>

        {success ? (
          <div className="auth-form__success" role="status">
            <strong>Account created</strong>
            <p>{success}</p>
            <button type="button" onClick={closeModal}>
              Done
            </button>
          </div>
        ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
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
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          {error && (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          )}

          <div className="auth-form__actions">
            <button type="button" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
        )}
      </section>
    </div>
  );
}
