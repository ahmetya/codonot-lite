export const AUTH_CONFIG = {
  saltRounds: 12,
  minimumPasswordLength: 6,
  verificationExpiryMs: 24 * 60 * 60 * 1000,
  resendCooldownMs: 60 * 1000,
  verificationTokenBytes: 32,
  verificationTokenEncoding: "hex",
  verificationHashAlgorithm: "sha256",
  jwtExpiry: "7d",
} as const;

export const AUTH_STATUS = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  conflict: 409,
} as const;

export const AUTH_MESSAGES = {
  invalidRegistration: "Name, email, and a valid password are required",
  emailInUse: "Email already in use",
  registrationComplete: "Check your email to verify your account.",
  invalidCredentials: "Invalid credentials",
  emailNotVerified: "Verify your email before logging in",
  invalidVerificationLink: "Verification link is invalid or expired",
  emailVerified: "Email verified. You can now log in.",
  verificationResent:
    "If an unverified account exists for that email, a new link has been sent.",
} as const;
