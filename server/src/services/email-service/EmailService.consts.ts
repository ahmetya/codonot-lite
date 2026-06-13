export const EMAIL_CONFIG = {
  apiUrl: "https://api.resend.com/emails",
  apiKey: process.env.RESEND_API_KEY,
  from:
    process.env.EMAIL_FROM ?? "Codonot Lite <noreply@lite.codonot.com>",
  appUrl: (process.env.APP_URL ?? "http://localhost:5173").replace(/\/$/, ""),
  verificationPath: "/verify-email",
} as const;

export const EMAIL_HEADERS = {
  contentType: "application/json",
} as const;

export const EMAIL_COPY = {
  subject: "Verify your Codonot Lite email",
  brand: "Codonot Lite",
  heading: "Verify your email",
  action: "Verify email",
  expiry: "This link expires in 24 hours.",
  notRequested: "If you did not create this account, you can ignore this email.",
} as const;

export const EMAIL_ERRORS = {
  notConfigured: "Email service is not configured",
  sendFailed: "Unable to send verification email",
} as const;
