const nodemailer = require("nodemailer");

// Switch to Port 465 (SSL) to bypass Render's port 587 block
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Set to true since we are explicitly using port 465
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Set explicit, lower timeout values so the system fails fast if the network drops
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Dan Restaurant" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to: ${to}`);
    console.log(`Email message ID: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error(`Email sending failed to ${to}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;
