import {
  createQuiz,
  findQuizById,
  findQuizzesByTeacher,
  updateQuiz,
  deleteQuiz,
} from "../repositories/quiz.repository.js";

const createNewQuiz = async (input, user) => {
  // startTime defaults to right now if teacher doesn't provide one
  const start = input.startTime ? new Date(input.startTime) : new Date();

  // endTime is optional — if not provided, quiz has no closing time
  const end = input.endTime ? new Date(input.endTime) : null;

  // Only validate end vs start if both are provided
  if (end && end <= start) {
    const err = new Error("End time must be after start time");
    err.code = "BAD_USER_INPUT";
    throw err;
  }

  return createQuiz({
    title: input.title,
    description: input.description ?? null,
    timeLimit: input.timeLimit,
    startTime: start,
    endTime: end, // null is fine — schema has endTime as DateTime?
    teacherId: user.id,
    teacherEmail: user.email,
    published: false,
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

  // Check start time — if startTime exists and we haven't reached it yet
  if (quiz.startTime && now < quiz.startTime) {
    const err = new Error(
      `Quiz hasn't started yet. Starts at ${quiz.startTime.toISOString()}`,
    );
    err.code = "FORBIDDEN";
    throw err;
  }

  // Check end time — only if endTime was set (null = no closing time)
  if (quiz.endTime && now > quiz.endTime) {
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

export {
  createNewQuiz,
  getQuiz,
  getActiveQuiz,
  getMyQuizzes,
  updateExistingQuiz,
  publishExistingQuiz,
  deleteExistingQuiz,
};
