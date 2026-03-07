export const verificationTemplate = ({ verificationLink }) => ({
  subject: "Verify your email address",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7e22ce;">Verify your email</h2>
      <p>Thanks for signing up! Click below to verify your account.</p>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <a href="${verificationLink}"
         style="display:inline-block; padding:12px 24px; background:#9333ea;
                color:white; text-decoration:none; border-radius:6px;">
        Verify Email
      </a>
      <p style="color:#999; font-size:12px; margin-top:16px;">
        If you didn't sign up, ignore this email.
      </p>
    </div>
  `,
});
