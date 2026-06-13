export const AUTH_CONTROLLER_STATUS = {
  created: 201,
  badRequest: 400,
  unauthorized: 401,
} as const;

export const AUTH_CONTROLLER_MESSAGES = {
  requestFailed: "Authentication request failed",
  verificationTokenRequired: "Verification token is required",
  emailRequired: "Email is required",
} as const;
