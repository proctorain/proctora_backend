
import {
  addQuestion,
  findQuestionById,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
  findOptionById,
} from "../repositories/question.repository.js";

import { findQuizById } from "../repositories/quiz.repository.js";


// Reused across all functions to avoid repeating the same check
const assertTeacherOwnsQuiz = async (quizId, userId) => {
  const quiz = await findQuizById(quizId);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (quiz.teacherId !== userId) {
    const err = new Error("You do not have permission to edit this quiz");
    err.code = "FORBIDDEN";
    throw err;
  }

  return quiz;
};

const assertTeacherOwnsQuestion = async (questionId, userId) => {
  const question = await findQuestionById(questionId);

  if (!question) {
    const err = new Error("Question not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Question belongs to a quiz — check the quiz owner
  await assertTeacherOwnsQuiz(question.quizId, userId);

  return question;
};

const addQuestionToQuiz = async (quizId, text, order, user) => {
  // Ownership check first — no DB write if not authorized
  await assertTeacherOwnsQuiz(quizId, user.id);

  return addQuestion({ quizId, text, order });
};

const updateQuestionText = async (questionId, text, user) => {
  await assertTeacherOwnsQuestion(questionId, user.id);

  return updateQuestion(questionId, { text });
};

const deleteQuestionById = async (questionId, user) => {
  await assertTeacherOwnsQuestion(questionId, user.id);

  await deleteQuestion(questionId);
  // Cascade in Prisma schema deletes options and answers automatically
  return true;
};

const addOptionToQuestion = async (questionId, input, user) => {
  // Check teacher owns the question (which checks they own the quiz too)
  await assertTeacherOwnsQuestion(questionId, user.id);

  // Validate: a question must have at least one correct option
  // But we can't enforce this here because teacher adds options one by one
  // We enforce it at publish time in quiz.service.js instead

  return addOption({
    questionId,
    text: input.text,
    isCorrect: input.isCorrect,
    order: input.order,
  });
};

const updateExistingOption = async (optionId, text, isCorrect, user) => {
  const option = await findOptionById(optionId);

  if (!option) {
    const err = new Error("Option not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  await assertTeacherOwnsQuestion(option.questionId, user.id);

  const data = {};
  if (text !== undefined) data.text = text;
  if (isCorrect !== undefined) data.isCorrect = isCorrect;

  return updateOption(optionId, data);
};

const deleteExistingOption = async (optionId, user) => {
  const option = await findOptionById(optionId);

  if (!option) {
    const err = new Error("Option not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  await assertTeacherOwnsQuestion(option.questionId, user.id);

  await deleteOption(optionId);
  return true;
};

export {
  addQuestionToQuiz,
  updateQuestionText,
  deleteQuestionById,
  addOptionToQuestion,
  updateExistingOption,
  deleteExistingOption,
};
