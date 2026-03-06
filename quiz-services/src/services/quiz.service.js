import {
  createQuiz,
  findQuizById,
  findQuizzesByTeacher,
  updateQuiz,
  deleteQuiz,
} from "../repositories/quiz.repository.js";

const createNewQuiz = async (input, user) => {
  // Validate start and end times make sense
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  if (end <= start) {
    const err = new Error("End time must be after start time");
    err.code = "BAD_USER_INPUT"; // Apollo uses this to set correct HTTP status
    throw err;
  }

  return createQuiz({
    ...input,
    startTime: start,
    endTime: end,
    teacherId: user.id,
    teacherEmail: user.email,
    published: false, // always starts as draft
  });
};

const getQuiz = async (id, user) => {
  const quiz = await findQuizById(id);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  return quiz;
};

const getActiveQuiz = async (id) => {
  const quiz = await findQuizById(id);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (!quiz.published) {
    const err = new Error("This quiz is not available");
    err.code = "FORBIDDEN";
    throw err;
  }

  const now = new Date();
  if (now < quiz.startTime) {
    const err = new Error(
      `Quiz hasn't started yet. Starts at ${quiz.startTime}`,
    );
    err.code = "FORBIDDEN";
    throw err;
  }

  if (now > quiz.endTime) {
    const err = new Error("This quiz has ended");
    err.code = "FORBIDDEN";
    throw err;
  }

  return quiz;
};

const getMyQuizzes = async (user) => {
  return findQuizzesByTeacher(user.id);
};

const updateExistingQuiz = async (id, input, user) => {
  const quiz = await findQuizById(id);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Only the teacher who created it can edit
  if (quiz.teacherId !== user.id) {
    const err = new Error("You don't have permission to edit this quiz");
    err.code = "FORBIDDEN";
    throw err;
  }

  const data = { ...input };
  if (input.startTime) data.startTime = new Date(input.startTime);
  if (input.endTime) data.endTime = new Date(input.endTime);

  return updateQuiz(id, data);
};

const publishExistingQuiz = async (id, user) => {
  const quiz = await findQuizById(id);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (quiz.teacherId !== user.id) {
    const err = new Error("You don't have permission to publish this quiz");
    err.code = "FORBIDDEN";
    throw err;
  }

  if (quiz.questions.length === 0) {
    const err = new Error("Add at least one question before publishing");
    err.code = "BAD_USER_INPUT";
    throw err;
  }

  return updateQuiz(id, { published: true });
};

const deleteExistingQuiz = async (id, user) => {
  const quiz = await findQuizById(id);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  if (quiz.teacherId !== user.id) {
    const err = new Error("You don't have permission to delete this quiz");
    err.code = "FORBIDDEN";
    throw err;
  }

  await deleteQuiz(id);
  return true;
};

export default {
  createNewQuiz,
  getQuiz,
  getActiveQuiz,
  getMyQuizzes,
  updateExistingQuiz,
  publishExistingQuiz,
  deleteExistingQuiz,
};
