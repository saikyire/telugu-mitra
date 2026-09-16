import nodemailer from 'nodemailer';

export const sendOTP = async (email, otp, purpose) => {
  // If no API key / credentials are provided in the environment, we just log to console (useful for local dev)
  if (!process.env.EMAIL_API_KEY && !process.env.SMTP_USER) {
    console.log(`\n========================================`);
    console.log(`MOCK EMAIL SENT TO: ${email}`);
    console.log(`PURPOSE: ${purpose}`);
    console.log(`OTP CODE: ${otp}`);
    console.log(`========================================\n`);
    return true;
  }

  // If you use a real SMTP service (e.g. SendGrid, Resend via SMTP, AWS SES)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_API_KEY,
        pass: process.env.SMTP_PASS || process.env.EMAIL_API_KEY,
      },
    });

    let subject = 'TeluguMitra - Verify Your Email';
    let text = `Your verification code is: ${otp}. It expires in 5 minutes.`;

    if (purpose === 'PASSWORD_RESET') {
      subject = 'TeluguMitra - Password Reset Code';
      text = `Your password reset code is: ${otp}. It expires in 5 minutes. If you didn't request this, please ignore this email.`;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"TeluguMitra" <noreply@telugumitra.com>',
      to: email,
      subject: subject,
      text: text,
    });

    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
