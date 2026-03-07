export const passwordResetTemplate = ({ resetLink }) => ({
  subject: "Reset your password",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7e22ce;">Reset your password</h2>
      <p>Click below to set a new password. Link expires in <strong>1 hour</strong>.</p>
      <a href="${resetLink}"
         style="display:inline-block; padding:12px 24px; background:#dc2626;
                color:white; text-decoration:none; border-radius:6px;">
        Reset Password
      </a>
      <p style="color:#999; font-size:12px; margin-top:16px;">
        If you didn't request this, ignore this email.
      </p>
    </div>
  `,
});
