interface VerificationEmail {
  email: string;
  name: string;
  token: string;
}

class EmailService {
  private apiKey = process.env.RESEND_API_KEY;
  private from = process.env.EMAIL_FROM ?? "Codonot Lite <noreply@codonot.com>";
  private appUrl = (process.env.APP_URL ?? "http://localhost:5173").replace(
    /\/$/,
    ""
  );

  async sendVerificationEmail({ email, name, token }: VerificationEmail) {
    if (!this.apiKey) {
      throw new Error("Email service is not configured");
    }

    const verificationUrl = `${this.appUrl}/verify-email?token=${encodeURIComponent(
      token
    )}`;
    const safeName = this.escapeHtml(name);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [email],
        subject: "Verify your Codonot Lite email",
        html: `
          <div style="background:#0d1117;color:#e6edf3;font-family:Arial,sans-serif;padding:32px">
            <div style="max-width:520px;margin:auto;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:28px">
              <p style="color:#56d67e;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Codonot Lite</p>
              <h1 style="font-size:24px;margin:12px 0">Verify your email</h1>
              <p style="color:#8b949e;line-height:1.6">Hello ${safeName}, confirm this email address to activate your account.</p>
              <a href="${verificationUrl}" style="display:inline-block;margin-top:16px;padding:12px 18px;border:1px solid #56d67e;border-radius:7px;color:#e6edf3;text-decoration:none;background:rgba(86,214,126,.12)">Verify email</a>
              <p style="color:#8b949e;font-size:12px;line-height:1.6;margin-top:24px">This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>
            </div>
          </div>
        `,
        text: `Hello ${name}, verify your Codonot Lite account: ${verificationUrl}\n\nThis link expires in 24 hours.`,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Resend email failed:", response.status, details);
      throw new Error("Unable to send verification email");
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
