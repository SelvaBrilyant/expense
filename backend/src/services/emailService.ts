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
            
            <div style="text-align: center;color: #111827;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="cta-button">Go to Login</a>
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

export const sendPasswordResetOTP = async (email: string, name: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP - ExpenseAI 🔐',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
          .otp-container { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; border: 2px dashed #7c3aed; }
          .otp-code { font-size: 36px; font-weight: 700; color: #7c3aed; letter-spacing: 8px; margin: 12px 0; font-family: 'Courier New', monospace; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 4px; }
          .warning p { margin: 0; color: #92400e; font-size: 14px; }
          .footer { background: #f9fafb; padding: 24px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2 style="color: #111827; margin-top: 0;">Hello ${name}!</h2>
            <p>
              We received a request to reset your password for your ExpenseAI account.
              Use the OTP code below to complete the password reset process.
            </p>
            
            <div class="otp-container">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">YOUR OTP CODE</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.</p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              This OTP will expire in 10 minutes for security purposes.
            </p>
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
    console.log(`Password reset OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    throw error;
  }
};
