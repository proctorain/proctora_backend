// mail-service/src/templates/otpVerification.js

export const otpVerificationTemplate = ({ otp, email }) => ({
  subject: "Your Proctora verification code",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #7e22ce;">Verify your email</h2>
      <p>Your one-time verification code is:</p>
      <div style="
        font-size: 40px;
        font-weight: bold;
        letter-spacing: 12px;
        color: #9333ea;
        text-align: center;
        padding: 24px;
        background: #faf5ff;
        border-radius: 8px;
        margin: 24px 0;
      ">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 14px;">
        This code expires in <strong>10 minutes</strong>.
        Do not share it with anyone.
      </p>
      <p style="color: #94a3b8; font-size: 12px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `,
});
