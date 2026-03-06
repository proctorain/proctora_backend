import prisma from "../config/prisma.js";

const createSubmission = async (data) => {
  return prisma.submission.create({ data });
};

const findSubmissionById = async (id) => {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      answers: {
        include: {
          question: { include: { options: true } },
          option: true,
        },
      },
    },
  });
};

const findSubmissionByStudentAndQuiz = async (studentId, quizId) => {
  return prisma.submission.findFirst({
    where: { studentId, quizId },
    include: { answers: true },
  });
};

const findSubmissionsByQuiz = async (quizId) => {
  return prisma.submission.findMany({
    where: { quizId },
    include: {
      answers: {
        include: {
          question: { include: { options: true } },
          option: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
};

const updateSubmission = async (id, data) => {
  return prisma.submission.update({ where: { id }, data });
};

const createAnswer = async (data) => {
  return prisma.answer.create({ data });
};

export default {
  createSubmission,
  findSubmissionById,
  findSubmissionByStudentAndQuiz,
  findSubmissionsByQuiz,
  updateSubmission,
  createAnswer,
};
