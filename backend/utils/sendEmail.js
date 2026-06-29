import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Nodemailer "transporter" — ye actual email sending mechanism hai.
// Gmail SMTP use kar rahe hain. Production mein SendGrid ya Resend
// zyada reliable hota hai, lekin Gmail learning ke liye perfect hai.
//
// IMPORTANT: Regular Gmail password yahan kaam nahi karega.
// Gmail ko "App Password" chahiye — neeche .env.example mein
// exact steps bataye hain kaise generate karein.
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

// @param {Object} options
// @param {string} options.to      - recipient email
// @param {string} options.subject - email subject
// @param {string} options.html    - email body (HTML string)
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Smart Job Tracker" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent: ${info.messageId} → ${to}`);
  return info;
};

export default sendEmail;