import prisma from "../config/prisma.js";

const createQuiz = async (data) => {
  return prisma.quiz.create({ data });
};

const findQuizById = async (id) => {
  return prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      // submissions count only — full submissions fetched separately
      _count: { select: { submissions: true } },
    },
  });
};

const findQuizzesByTeacher = async (teacherId) => {
  return prisma.quiz.findMany({
    where: { teacherId },
    include: {
      _count: { select: { submissions: true } },
      questions: { include: { options: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateQuiz = async (id, data) => {
  return prisma.quiz.update({ where: { id }, data });
};

const deleteQuiz = async (id) => {
  return prisma.quiz.delete({ where: { id } });
  // Cascade deletes questions → options → answers automatically
};

export {
  createQuiz,
  findQuizById,
  findQuizzesByTeacher,
  updateQuiz,
  deleteQuiz,
};