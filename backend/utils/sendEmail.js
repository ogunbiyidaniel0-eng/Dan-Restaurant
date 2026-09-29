const { Resend } = require('resend');

// Initialize Resend using your secret key over secure HTTPS (Port 443)
// Render never blocks this traffic!
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Note: If you are using a free tier without a verified domain,
    // your "from" address MUST be 'onboarding@resend.dev'
    const response = await resend.emails.send({
      from: 'Dan Restaurant <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (response.error) {
      throw new Error(response.error.message || JSON.stringify(response.error));
    }

    console.log(`Email sent successfully via Resend. Message ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error(`Resend API email failed to ${to}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;
