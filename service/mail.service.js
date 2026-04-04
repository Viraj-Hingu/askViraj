import nodemailer from "nodemailer";

let transporter;

const requiredEnv = [
  "GOOGLE_USER",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
];

const checkEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing env variables: ${missing.join(", ")}`);
  }
};

const createTransporter = () => {
  if (transporter) return transporter;

  checkEnv();

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });

  return transporter;
};

export const verifyMailTransport = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Mail transporter ready");
  } catch (err) {
    console.error("❌ Mail transporter error:", err);
  }
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log("📧 sendEmail called");

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"askViraj" <${process.env.GOOGLE_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email error FULL:", err);
    throw err;
  }
};