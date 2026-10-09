// Email Service
// Supports: SMTP (Nodemailer), SendGrid, Resend
// Configure via environment variables

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@zimmarket.co.zw';
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST || SENDGRID_KEY || RESEND_KEY);
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.log('[EMAIL] Not configured. Would send:', options.subject, 'to', options.to);
    return false;
  }

  try {
    if (RESEND_KEY) return await sendViaResend(options);
    if (SENDGRID_KEY) return await sendViaSendGrid(options);
    if (SMTP_HOST) return await sendViaSMTP(options);
    return false;
  } catch (error) {
    console.error('[EMAIL] Send failed:', error);
    return false;
  }
}

async function sendViaResend(options: EmailOptions): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });
  return res.ok;
}

async function sendViaSendGrid(options: EmailOptions): Promise<boolean> {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: FROM_EMAIL },
      subject: options.subject,
      content: [{ type: 'text/html', value: options.html }],
    }),
  });
  return res.ok;
}

async function sendViaSMTP(options: EmailOptions): Promise<boolean> {
  try {
    // nodemailer is optional — install with: npm install nodemailer
    // Using eval to prevent webpack from bundling it
    const nodemailer = eval('require')('nodemailer');
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_PORT === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch {
    return false;
  }
}

// Email templates
export function verificationEmail(name: string, link: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:linear-gradient(135deg,#0284C7,#0F172A);padding:30px;border-radius:16px 16px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">ZimMarket</h1>
      </div>
      <div style="background:white;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 16px 16px">
        <h2 style="color:#0F172A">Hi ${name},</h2>
        <p style="color:#64748B">Welcome to ZimMarket! Please verify your email address to get started.</p>
        <a href="${link}" style="display:inline-block;background:#0284C7;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin:20px 0">Verify Email</a>
        <p style="color:#94a3b8;font-size:12px">If you didn't create this account, you can ignore this email.</p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">© 2026 ZimMarket by Nova Tech. All rights reserved.</p>
    </div>`;
}

export function passwordResetEmail(name: string, link: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:linear-gradient(135deg,#0284C7,#0F172A);padding:30px;border-radius:16px 16px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">ZimMarket</h1>
      </div>
      <div style="background:white;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 16px 16px">
        <h2 style="color:#0F172A">Password Reset</h2>
        <p style="color:#64748B">Hi ${name}, we received a request to reset your password.</p>
        <a href="${link}" style="display:inline-block;background:#0284C7;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin:20px 0">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">© 2026 ZimMarket by Nova Tech.</p>
    </div>`;
}

export function newListingsEmail(name: string, listings: { title: string; price: number }[]): string {
  const items = listings.map(l => `<li style="padding:8px 0;border-bottom:1px solid #f1f5f9">${l.title} — <strong>$${l.price}</strong></li>`).join('');
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:linear-gradient(135deg,#0284C7,#0F172A);padding:30px;border-radius:16px 16px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:24px">ZimMarket</h1>
      </div>
      <div style="background:white;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 16px 16px">
        <h2 style="color:#0F172A">New listings match your search!</h2>
        <p style="color:#64748B">Hi ${name}, here are new listings you might be interested in:</p>
        <ul style="list-style:none;padding:0;color:#334155">${items}</ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://zimmarket.co.zw'}/explore" style="display:inline-block;background:#0284C7;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin:20px 0">Browse Listings</a>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">© 2026 ZimMarket by Nova Tech.</p>
    </div>`;
}

export function getEmailStatus(): { provider: string; configured: boolean } {
  if (RESEND_KEY) return { provider: 'Resend', configured: true };
  if (SENDGRID_KEY) return { provider: 'SendGrid', configured: true };
  if (SMTP_HOST) return { provider: 'SMTP', configured: true };
  return { provider: 'Not configured', configured: false };
}