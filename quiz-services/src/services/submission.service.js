// src/services/submission.service.js

import {
  createSubmission,
  findSubmissionById,
  findSubmissionByStudentAndQuiz,
  findSubmissionsByQuiz,
  updateSubmission,
  createAnswer,
} from "../repositories/submission.repository.js";
import { findQuizById } from"../repositories/quiz.repository.js";
import { sendResultToStudent, sendResultToTeacher } from"./mail.service.js";

const startQuiz = async (quizId, user) => {
  // Check student hasn't already started
  const existing = await findSubmissionByStudentAndQuiz(user.id, quizId);
  if (existing) {
    const err = new Error("You have already started this quiz");
    err.code = "BAD_USER_INPUT";
    throw err;
  }

  return createSubmission({
    quizId,
    studentId: user.id,
    studentEmail: user.email,
    studentName: user.email.split("@")[0], // use email prefix as name
    score: 0,
    totalPoints: 0,
    startedAt: new Date(),
    timeTaken: 0,
  });
};

const submitQuiz = async (submissionId, answers, user) => {
  const submission = await findSubmissionById(submissionId);

  if (!submission) {
    const err = new Error("Submission not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Only the student who started can submit
  if (submission.studentId !== user.id) {
    const err = new Error("Not authorized");
    err.code = "FORBIDDEN";
    throw err;
  }

  const quiz = await findQuizById(submission.quizId);

  // Calculate score
  // For each answer: check if selected option is correct
  let score = 0;
  const totalPoints = quiz.questions.length;

  const answerRecords = [];

  for (const ans of answers) {
    // Find the option they picked
    const question = quiz.questions.find((q) => q.id === ans.questionId);
    const option = question?.options.find((o) => o.id === ans.optionId);
    const isCorrect = option?.isCorrect ?? false;

    if (isCorrect) score++;

    answerRecords.push({
      submissionId,
      questionId: ans.questionId,
      optionId: ans.optionId,
      timeTaken: ans.timeTaken,
      isCorrect,
    });
  }

  // Save all answers
  for (const record of answerRecords) {
    await createAnswer(record);
  }

  const submittedAt = new Date();
  const timeTaken = Math.floor((submittedAt - submission.startedAt) / 1000);

  // Update submission with final score
  const finalSubmission = await updateSubmission(submissionId, {
    score,
    totalPoints,
    timeTaken,
    submittedAt,
  });

  const fullSubmission = await findSubmissionById(submissionId);

  // Send result email to teacher immediately
  await sendResultToTeacher(quiz, fullSubmission);

  // Schedule student email 1 hour later
  // We store the time and a background job would pick this up
  // For simplicity: using setTimeout (in production use a job queue like Bull)
  setTimeout(
    async () => {
      await sendResultToStudent(quiz, fullSubmission);
      await updateSubmission(submissionId, { emailSentAt: new Date() });
    },
    60 * 60 * 1000,
  ); // 1 hour in ms

  return fullSubmission;
};

const getQuizSubmissions = async (quizId, user) => {
  const quiz = await findQuizById(quizId);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Only the teacher who owns the quiz can see all submissions
  if (quiz.teacherId !== user.id) {
    const err = new Error("Not authorized");
    err.code = "FORBIDDEN";
    throw err;
  }

  return findSubmissionsByQuiz(quizId);
};

export { startQuiz, submitQuiz, getQuizSubmissions };
