import nodemailer from 'nodemailer';
import { getSettings } from './settings';

export interface SendMailProps {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: SendMailProps) {
  const settings = await getSettings();

  if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
    console.log('-------------------------------------------');
    console.log('WARNING: SMTP email credentials are not set.');
    console.log('SIMULATING EMAIL SENDING (printed to logs):');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log('-------------------------------------------');
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: parseInt(settings.smtp_port) || 465,
    secure: parseInt(settings.smtp_port) === 465, // true for 465, false for other ports
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_pass,
    },
  });

  const mailOptions = {
    from: `"${settings.smtp_from_name}" <${settings.smtp_from}>`,
    to,
    subject,
    text: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Nodemailer error sending email:', error);
    throw error;
  }
}
