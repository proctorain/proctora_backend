// src/graphql/resolvers/submission.resolver.js

import {
  startQuiz,
  submitQuiz,
  getQuizSubmissions,
} from "../../services/submission.service.js";
import {
  findSubmissionById,
  findSubmissionByStudentAndQuiz,
} from "../../repositories/submission.repository.js";

const submissionResolvers = {
  Query: {
    quizSubmissions: async (_, { quizId }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return getQuizSubmissions(quizId, context.user);
    },

    submission: async (_, { id }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return findSubmissionById(id);
    },

    mySubmission: async (_, { quizId }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return findSubmissionByStudentAndQuiz(context.user.id, quizId);
    },
  },

  Mutation: {
    startQuiz: async (_, { quizId }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return startQuiz(quizId, context.user);
    },

    submitQuiz: async (_, { submissionId, answers }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return submitQuiz(submissionId, answers, context.user);
    },
  },

  // Field resolvers for computed fields
  Submission: {
    percentage: (parent) => {
      if (parent.totalPoints === 0) return 0;
      return parseFloat(((parent.score / parent.totalPoints) * 100).toFixed(1));
    },
    startedAt: (parent) => parent.startedAt.toISOString(),
    submittedAt: (parent) => parent.submittedAt.toISOString(),
  },
};

export default submissionResolvers;
