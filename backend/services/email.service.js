import nodemailer from 'nodemailer';

// Configure nodemailer transporter
// Using Gmail SMTP for simplicity - replace with your email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

/**
 * Send welcome email with community invite links
 * @param {Object} params
 * @param {string} params.name - Recipient's name
 * @param {string} params.email - Recipient's email
 * @param {string} params.whatsappLink - WhatsApp invite link
 * @param {string} params.telegramLink - Telegram invite link
 */
export const sendWelcomeEmail = async ({ name, email, whatsappLink, telegramLink }) => {
  // If email service is not configured, log and skip (don't fail the submission)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email service not configured. Skipping email send.');
    console.log(`Would send email to: ${email}`);
    return { success: true, skipped: true };
  }

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to EcoSphere Community</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #012E1C;
          color: #BFFF00;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px 20px;
          color: #333;
        }
        .welcome-text {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          margin: 10px 5px;
          background-color: #BFFF00;
          color: #012E1C;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #a8e600;
        }
        .links-section {
          background-color: #f9f9f9;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .links-section h3 {
          color: #012E1C;
          margin-top: 0;
        }
        .link-item {
          margin: 15px 0;
        }
        .link-item a {
          color: #012E1C;
          text-decoration: none;
          font-weight: bold;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 Welcome to EcoSphere Community!</h1>
        </div>
        <div class="content">
          <p class="welcome-text">Hi ${name},</p>
          <p class="welcome-text">
            Thank you for your interest in joining the EcoSphere community! We're excited to have you on board.
            Together, we can make a positive impact on our environment.
          </p>
          <p class="welcome-text">
            Your request is currently <strong>pending approval</strong>. We'll review it and get back to you soon.
          </p>

          <div class="links-section">
            <h3>Join Our Communities</h3>
            <p>While you wait for approval, feel free to connect with us on:</p>

            <div class="link-item">
              <strong>📱 WhatsApp Community:</strong><br>
              <a href="${whatsappLink}" target="_blank">${whatsappLink}</a>
            </div>

            <div class="link-item">
              <strong>✈️ Telegram Community:</strong><br>
              <a href="${telegramLink}" target="_blank">${telegramLink}</a>
            </div>
          </div>

          <p class="welcome-text">
            If you have any questions, feel free to reach out to us.
          </p>
          <p class="welcome-text">
            Best regards,<br>
            <strong>The EcoSphere Team</strong>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} EcoSphere. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"EcoSphere Community" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to EcoSphere Community! 🌱',
      html: htmlTemplate,
    });

    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error - we don't want to fail the submission if email fails
    return { success: false, error: error.message };
  }
};

export default { sendWelcomeEmail };