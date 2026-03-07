import transporter from "../config/mailer.js";
import { verificationTemplate } from "../templates/verification.js";
import { passwordResetTemplate } from "../templates/passwordReset.js";
import { teacherResultTemplate } from "../templates/teacherResult.js";
import { studentResultTemplate } from "../templates/studentResult.js";

const TEMPLATES = {
  verification: verificationTemplate,
  "password-reset": passwordResetTemplate,
  "teacher-result": teacherResultTemplate,
  "student-result": studentResultTemplate,
};

export const sendMail = async ({ to, type, data }) => {
  // Look up the template function by type
  const templateFn = TEMPLATES[type];

  if (!templateFn) {
    const err = new Error(`Unknown email type: "${type}"`);
    err.statusCode = 400;
    throw err;
  }

  // Call the template function with the data to get subject + html
  const { subject, html } = templateFn(data);

  await transporter.sendMail({
    from: `"Proctora" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`[Mail] Sent "${type}" to ${to}`);
};
