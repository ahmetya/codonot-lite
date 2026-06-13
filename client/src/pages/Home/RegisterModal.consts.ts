export const REGISTER_CONFIG = {
  minimumPasswordLength: 6,
} as const;

export const REGISTER_COPY = {
  eyebrow: "Create account",
  title: "Join codonot-lite",
  closeLabel: "Close registration",
  intro: "Save your session and unlock the AI stream playground.",
  passwordTooShort: `Password must contain at least ${REGISTER_CONFIG.minimumPasswordLength} characters.`,
  registrationFailed: "Registration failed",
  successTitle: "Account created",
  successEmailPrefix: "We sent the link to",
  done: "Done",
  nameLabel: "Name",
  emailLabel: "Email",
  passwordLabel: "Password",
  cancel: "Cancel",
  submitting: "Creating...",
  submit: "Create account",
} as const;
