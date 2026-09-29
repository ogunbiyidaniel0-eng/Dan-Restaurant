const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Dan Restaurant <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error(`Email sending failed to ${to}:`, error);
      throw new Error(error.message || "Failed to send email");
    }

    console.log(`Email sent successfully to: ${to}`);
    console.log("Resend email ID:", data?.id);

    return data;
  } catch (error) {
    console.error(`Email sending failed to ${to}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;