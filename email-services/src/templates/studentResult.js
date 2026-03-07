export const studentResultTemplate = ({ quiz, submission }) => {
  const percentage = (
    (submission.score / submission.totalPoints) *
    100
  ).toFixed(1);

  const questionRows = submission.answers
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
        <td style="padding: 10px; color: #7e22ce;">${correctOptions}</td>
      </tr>
    `;
    })
    .join("");

  return {
    subject: `Your results for "${quiz.title}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <h2 style="color: #7e22ce;">Your Quiz Results</h2>
        <h3>${quiz.title}</h3>
        <p><strong>Your score:</strong> ${submission.score} / ${submission.totalPoints} (${percentage}%)</p>
        <h3 style="color: #7e22ce; margin-top: 24px;">Questions & Correct Answers</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f3e8ff;">
              <th style="padding: 10px; text-align: left;">Question</th>
              <th style="padding: 10px; text-align: left;">Your Answer</th>
              <th style="padding: 10px; text-align: left;">Result</th>
              <th style="padding: 10px; text-align: left;">Correct Answer</th>
            </tr>
          </thead>
          <tbody>${questionRows}</tbody>
        </table>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
          Results released 1 hour after submission as per quiz settings.
        </p>
      </div>
    `,
  };
};
