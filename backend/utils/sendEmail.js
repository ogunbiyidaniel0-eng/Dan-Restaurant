const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("Preparing to send email...");
    console.log("Email recipient:", to);
    console.log("Email subject:", subject);

    if (!process.env.EMAIL_USER) {
      throw new Error("EMAIL_USER is not configured");
    }

    if (!process.env.EMAIL_PASS) {
      throw new Error("EMAIL_PASS is not configured");
    }

    if (!to) {
      throw new Error("No recipient email address was provided");
    }

    const info = await transporter.sendMail({
      from: `"Dan Restaurant" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("EMAIL SENDING FAILED");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);

    throw error;
  }
};

module.exports = sendEmail;