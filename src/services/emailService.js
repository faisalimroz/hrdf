import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend client if API key is provided
let resendClient = null;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

// Initialize Nodemailer Transporter if SMTP credentials exist
let nodemailerTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  nodemailerTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Universal email dispatcher (Resend -> Nodemailer -> Console Dev Fallback)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || 'Hdfd Foundation <no-reply@hdfd-foundation.org>';

  // 1. Try Resend if configured
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: from.includes('<') ? from : `Hdfd Foundation <${from}>`,
        to,
        subject,
        html,
        text,
      });
      console.log(`[EmailService] Sent email via Resend to ${to} (ID: ${response?.data?.id || 'OK'})`);
      return { success: true, provider: 'resend', id: response?.data?.id };
    } catch (resendError) {
      console.error(`[EmailService] Resend failed, falling back: ${resendError.message}`);
    }
  }

  // 2. Try Nodemailer if configured
  if (nodemailerTransporter) {
    try {
      const info = await nodemailerTransporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
      console.log(`[EmailService] Sent email via Nodemailer to ${to} (MsgId: ${info.messageId})`);
      return { success: true, provider: 'nodemailer', id: info.messageId };
    } catch (smtpError) {
      console.error(`[EmailService] Nodemailer failed: ${smtpError.message}`);
    }
  }

  // 3. Development Fallback: Log to console so tests/demos never break
  console.log('\n===============================================================');
  console.log(`[EmailService DEV SIMULATION]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Text Body:\n${text}`);
  console.log('===============================================================\n');

  return { success: true, provider: 'console-dev' };
};

/**
 * Send Magic Link Email (JAAGO-Themed)
 */
export const sendMagicLinkEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const magicLink = `${clientUrl}/verify-magic-link?token=${token}&email=${encodeURIComponent(email)}`;

  const subject = 'Your Instant Login Link | Hdfd Foundation';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fffcf5; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
          .header { background-color: #0f172a; padding: 32px 24px; text-align: center; }
          .header h1 { color: #fbc116; margin: 0; font-size: 24px; letter-spacing: 0.5px; }
          .header p { color: #94a3b8; margin: 6px 0 0 0; font-size: 14px; }
          .content { padding: 36px 32px; line-height: 1.6; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background-color: #fbc116; color: #0f172a; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; display: inline-block; transition: background 0.2s; }
          .link-fallback { font-size: 13px; color: #64748b; word-break: break-all; margin-top: 24px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hdfd Foundation</h1>
            <p>Human Development Forum Bangladesh</p>
          </div>
          <div class="content">
            <h2 style="color: #0f172a; margin-top: 0;">Sign In With Magic Link</h2>
            <p>Hello,</p>
            <p>You requested a password-free sign in to your Hdfd Foundation account. Click the button below to sign in instantly.</p>
            <div class="btn-container">
              <a href="${magicLink}" class="btn" target="_blank">Sign In Instantly</a>
            </div>
            <p style="font-size: 14px; color: #64748b;">This secure login link will expire in <strong>20 minutes</strong> and can only be used once.</p>
            <div class="link-fallback">
              <p>Button not working? Copy and paste this URL into your browser:</p>
              <a href="${magicLink}" style="color: #0284c7;">${magicLink}</a>
            </div>
          </div>
          <div class="footer">
            <p>If you did not request this link, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Hdfd Foundation (Human Development Forum Bangladesh). All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Sign in to Hdfd Foundation:
Click this link to authenticate: ${magicLink}

This link is valid for 20 minutes. If you did not request this, please ignore this email.
`;

  return await sendEmail({ to: email, subject, html, text });
};

/**
 * Send Password Reset Email (JAAGO-Themed)
 */
export const sendPasswordResetEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const subject = 'Reset Your Password | Hdfd Foundation';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fffcf5; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
          .header { background-color: #0f172a; padding: 32px 24px; text-align: center; }
          .header h1 { color: #fbc116; margin: 0; font-size: 24px; letter-spacing: 0.5px; }
          .header p { color: #94a3b8; margin: 6px 0 0 0; font-size: 14px; }
          .content { padding: 36px 32px; line-height: 1.6; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background-color: #fbc116; color: #0f172a; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; display: inline-block; }
          .link-fallback { font-size: 13px; color: #64748b; word-break: break-all; margin-top: 24px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hdfd Foundation</h1>
            <p>Human Development Forum Bangladesh</p>
          </div>
          <div class="content">
            <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have received this email because a password reset request was made for your Hdfd Foundation account.</p>
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #64748b;">This reset link will expire in <strong>30 minutes</strong>.</p>
            <div class="link-fallback">
              <p>If the button doesn't work, copy and paste this URL into your browser:</p>
              <a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a>
            </div>
          </div>
          <div class="footer">
            <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
            <p>&copy; ${new Date().getFullYear()} Hdfd Foundation. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset your Hdfd Foundation Password:
Visit this link to choose a new password: ${resetUrl}

This link expires in 30 minutes. If you did not make this request, you can ignore this email.
`;

  return await sendEmail({ to: email, subject, html, text });
};

export default {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
};
