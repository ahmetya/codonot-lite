import {
  EMAIL_CONFIG,
  EMAIL_COPY,
  EMAIL_ERRORS,
  EMAIL_HEADERS,
} from "./EmailService.consts";

interface VerificationEmail {
  email: string;
  name: string;
  token: string;
}

class EmailService {
  async sendVerificationEmail({ email, name, token }: VerificationEmail) {
    if (!EMAIL_CONFIG.apiKey) {
      throw new Error(EMAIL_ERRORS.notConfigured);
    }

    const verificationUrl = `${EMAIL_CONFIG.appUrl}${
      EMAIL_CONFIG.verificationPath
    }?token=${encodeURIComponent(
      token
    )}`;
    const safeName = this.escapeHtml(name);

    const response = await fetch(EMAIL_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EMAIL_CONFIG.apiKey}`,
        "Content-Type": EMAIL_HEADERS.contentType,
      },
      body: JSON.stringify({
        from: EMAIL_CONFIG.from,
        to: [email],
        subject: EMAIL_COPY.subject,
        html: `
          <div style="background:#0d1117;color:#e6edf3;font-family:Arial,sans-serif;padding:32px">
            <div style="max-width:520px;margin:auto;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:28px">
              <p style="color:#56d67e;font-size:12px;letter-spacing:.12em;text-transform:uppercase">${EMAIL_COPY.brand}</p>
              <h1 style="font-size:24px;margin:12px 0">${EMAIL_COPY.heading}</h1>
              <p style="color:#8b949e;line-height:1.6">Hello ${safeName}, confirm this email address to activate your account.</p>
              <a href="${verificationUrl}" style="display:inline-block;margin-top:16px;padding:12px 18px;border:1px solid #56d67e;border-radius:7px;color:#e6edf3;text-decoration:none;background:rgba(86,214,126,.12)">${EMAIL_COPY.action}</a>
              <p style="color:#8b949e;font-size:12px;line-height:1.6;margin-top:24px">${EMAIL_COPY.expiry} ${EMAIL_COPY.notRequested}</p>
            </div>
          </div>
        `,
        text: `Hello ${name}, verify your ${EMAIL_COPY.brand} account: ${verificationUrl}\n\n${EMAIL_COPY.expiry}`,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Resend email failed:", response.status, details);
      throw new Error(EMAIL_ERRORS.sendFailed);
    }
  }

  private escapeHtml(value: string) {
    return value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[character]!
    );
  }
}

export const emailService = new EmailService();
