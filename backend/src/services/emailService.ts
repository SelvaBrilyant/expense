import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOnboardingEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to ExpenseAI! 🚀',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ExpenseAI</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
          .welcome-text { font-size: 18px; margin-bottom: 24px; }
          .feature-list { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .feature-item { display: flex; align-items: center; margin-bottom: 16px; color: #4b5563; }
          .feature-item:last-child { margin-bottom: 0; }
          .feature-icon { color: #7c3aed; margin-right: 12px; font-size: 20px; }
          .cta-button { display: inline-block; background: #7c3aed; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px; transition: background 0.3s ease; }
          .cta-button:hover { background: #6d28d9; }
          .footer { background: #f9fafb; padding: 24px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ExpenseAI</h1>
          </div>
          <div class="content">
            <h2 style="color: #111827; margin-top: 0;">Hello ${name}! 👋</h2>
            <p class="welcome-text">
              We're absolutely thrilled to have you join us! You've just taken the first step towards smarter financial management.
            </p>
            
            <div class="feature-list">
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>Visualize your spending habits</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💰</span>
                <span>Create smart budgets</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🤖</span>
                <span>Get AI-powered financial insights</span>
              </div>
            </div>

            <p>Ready to get started? Complete your profile to unlock the full potential of ExpenseAI.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="cta-button">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ExpenseAI. All rights reserved.</p>
            <p>Made with 💜 for better finances</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Onboarding email sent to ${email}`);
  } catch (error) {
    console.error('Error sending onboarding email:', error);
  }
};
