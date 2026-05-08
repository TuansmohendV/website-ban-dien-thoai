import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

const parseBoolean = (value) =>
  String(value || '')
    .trim()
    .toLowerCase() === 'true';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: parseBoolean(process.env.SMTP_SECURE) || port === 465,
      auth: { user, pass },
    });
  }

  // Dev fallback: mail payload is generated and logged only.
  return nodemailer.createTransport({ jsonTransport: true });
};

export const sendResetOtpEmail = async ({ to, otpCode, expiresAt }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@phonesin.vn';
  const expiresText = new Date(expiresAt).toLocaleString('vi-VN');

  const subject = 'PhoneSin - Ma xac thuc doi mat khau';
  const text = `Ma OTP cua ban la: ${otpCode}. Ma co hieu luc den ${expiresText}.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2>Khoi phuc mat khau PhoneSin</h2>
      <p>Ban vua yeu cau doi mat khau. Su dung ma OTP ben duoi:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">${otpCode}</div>
      <p>Ma co hieu luc den <strong>${expiresText}</strong>.</p>
      <p style="color: #666;">Neu ban khong yeu cau, vui long bo qua email nay.</p>
    </div>
  `;

  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from,
      subject,
      text,
      html,
    });

    return { provider: 'sendgrid' };
  }

  const transporter = createTransporter();
  const info = await transporter.sendMail({ from, to, subject, text, html });

  if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
    console.log(`[DEV_MAIL] OTP for ${to}: ${otpCode}`);
  }

  return info;
};
