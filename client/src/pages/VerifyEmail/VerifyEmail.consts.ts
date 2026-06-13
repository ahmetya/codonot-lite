export const VERIFICATION_STATE = {
  loading: "loading",
  success: "success",
  error: "error",
} as const;

export type VerificationState =
  (typeof VERIFICATION_STATE)[keyof typeof VERIFICATION_STATE];

export const VERIFY_EMAIL_ENDPOINTS = {
  verify: "/api/auth/verify-email",
  resend: "/api/auth/resend-verification",
} as const;

export const VERIFY_EMAIL_REQUEST_HEADERS = {
  "Content-Type": "application/json",
} as const;

export const VERIFY_EMAIL_COPY = {
  initialMessage: "Verifying your email...",
  missingToken: "This verification link is missing its token.",
  verifyFailed: "Unable to verify this email",
  verificationFailed: "Email verification failed",
  verifiedFallback: "Your email has been verified.",
  resendFailed: "Unable to resend email",
  resendFallback: "Check your inbox for a new link.",
  loadingStatus: "...",
  successStatus: "OK",
  errorStatus: "!",
  eyebrow: "Email verification",
  loadingHeading: "Checking your link",
  successHeading: "You are verified",
  errorHeading: "Link unavailable",
  resendLabel: "Send a new link",
  emailPlaceholder: "you@example.com",
  resending: "Sending...",
  resend: "Resend",
  continueToLogin: "Continue to login",
  returnHome: "Return home",
} as const;
