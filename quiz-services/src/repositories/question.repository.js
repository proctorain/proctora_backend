import prisma from "../config/prisma.js";

const addQuestion = async (data) => {
  return prisma.question.create({
    data,
    include: { options: true },
  });
};

const findQuestionById = async (id) => {
  return prisma.question.findUnique({
    where: { id },
    include: { options: { orderBy: { order: "asc" } } },
  });
};

const updateQuestion = async (id, data) => {
  return prisma.question.update({
    where: { id },
    data,
    include: { options: true },
  });
};

const deleteQuestion = async (id) => {
  return prisma.question.delete({ where: { id } });
};

const addOption = async (data) => {
  return prisma.option.create({ data });
};

const updateOption = async (id, data) => {
  return prisma.option.update({ where: { id }, data });
};

const deleteOption = async (id) => {
  return prisma.option.delete({ where: { id } });
};

const findOptionById = async (id) => {
  return prisma.option.findUnique({ where: { id } });
};

export {
  addQuestion,
  findQuestionById,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
  findOptionById,
};
