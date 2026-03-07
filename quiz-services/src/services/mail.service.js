import mailClient from "../utils/mailer.js";

export const sendResultToTeacher = async (quiz, submission) => {
  await mailClient.post("/send", {
    to:   quiz.teacherEmail,
    type: "teacher-result",
    data: { quiz, submission },
  });
};

export const sendResultToStudent = async (quiz, submission) => {
  await mailClient.post("/send", {
    to:   submission.studentEmail,
    type: "student-result",
    data: { quiz, submission },
  });
};
