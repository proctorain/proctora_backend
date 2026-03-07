export const teacherResultTemplate = ({ quiz, submission }) => {
  const percentage = (
    (submission.score / submission.totalPoints) *
    100
  ).toFixed(1);
  const minutes = Math.floor(submission.timeTaken / 60);
  const seconds = submission.timeTaken % 60;

  const answerRows = submission.answers
    .map((ans) => {
      const correctOptions = ans.question.options
        .filter((o) => o.isCorrect)
        .map((o) => o.text)
        .join(", ");

      return `
      <tr style="border-bottom: 1px solid #f0e6ff;">
        <td style="padding: 10px;">${ans.question.text}</td>
        <td style="padding: 10px;">${ans.option.text}</td>
        <td style="padding: 10px; color: ${ans.isCorrect ? "#16a34a" : "#dc2626"}">
          ${ans.isCorrect ? "✓ Correct" : "✗ Wrong"}
        </td>
        <td style="padding: 10px;">${correctOptions}</td>
        <td style="padding: 10px;">${ans.timeTaken}s</td>
      </tr>
    `;
    })
    .join("");

  return {
    subject: `[Proctora] ${submission.studentName} submitted "${quiz.title}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <h2 style="color: #7e22ce;">New Submission — ${quiz.title}</h2>
        <p><strong>Student:</strong> ${submission.studentEmail}</p>
        <p><strong>Score:</strong> ${submission.score} / ${submission.totalPoints} (${percentage}%)</p>
        <p><strong>Time taken:</strong> ${minutes}m ${seconds}s</p>
        <p><strong>Submitted at:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
        <h3 style="color: #7e22ce; margin-top: 24px;">Answer Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f3e8ff;">
              <th style="padding: 10px; text-align: left;">Question</th>
              <th style="padding: 10px; text-align: left;">Student Answer</th>
              <th style="padding: 10px; text-align: left;">Result</th>
              <th style="padding: 10px; text-align: left;">Correct Answer</th>
              <th style="padding: 10px; text-align: left;">Time</th>
            </tr>
          </thead>
          <tbody>${answerRows}</tbody>
        </table>
      </div>
    `,
  };
};
