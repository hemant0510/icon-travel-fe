import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export async function sendVerificationEmail(toEmail: string, token: string, name: string) {
    if (!SMTP_USER || !SMTP_PASS) {
        console.warn("SMTP credentials not configured. Verification email skipped. Token:", token);
        return;
    }

    const verificationUrl = `${APP_URL}/verify?token=${token}`;

    const mailOptions = {
        from: `"Icon Fly" <${SMTP_USER}>`,
        to: toEmail,
        subject: "Verify your email - Icon Fly",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1a56db; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Icon Fly</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">
            Thank you for registering with Icon Fly. To complete your registration and access your account, please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #1a56db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #555; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, you can copy and paste this link into your browser: <br/>
            <a href="${verificationUrl}" style="color: #1a56db;">${verificationUrl}</a>
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 40px; text-align: center;">
            If you didn't request this email, please safely ignore it.
          </p>
        </div>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent successfully to ${toEmail}`);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email.");
    }
}
