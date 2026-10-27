const nodemailer = require('nodemailer');

let transporter = null;


const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
};

exports.kirimEmail = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`[MAIL-DEV] Kepada: ${to}\n[MAIL-DEV] Subjek: ${subject}\n[MAIL-DEV] ${text}`);
    return;
  }
  await t.sendMail({
    from: process.env.MAIL_FROM || 'Toko Elektronik Priangan Jaya <no-reply@priangan-jaya.local>',
    to, subject, text, html,
  });
};