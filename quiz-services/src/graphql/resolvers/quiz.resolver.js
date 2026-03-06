// A resolver is the function that runs when a query or mutation is called.
// Every field in your schema maps to a resolver.
// Args = the arguments passed in the query/mutation
// Context = the object from context.js (has context.user)

import {
  createNewQuiz,
  getQuiz,
  getActiveQuiz,
  getMyQuizzes,
  updateExistingQuiz,
  publishExistingQuiz,
  deleteExistingQuiz,
} from "../../services/quiz.service.js";

const quizResolvers = {
  Query: {
    // resolver signature: (parent, args, context, info)
    // parent = result from parent resolver (not needed here)
    // args   = what was passed in the query: quiz(id: "123") → args.id = "123"
    // context = { user } from context.js

    quiz: async (_, { id }, context) => {
      return getQuiz(id, context.user);
    },

    myQuizzes: async (_, __, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return getMyQuizzes(context.user);
    },

    activeQuiz: async (_, { id }) => {
      // Public — no auth needed, but quiz must be published and active
      return getActiveQuiz(id);
    },
  },

  Mutation: {
    createQuiz: async (_, { input }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return createNewQuiz(input, context.user);
    },

    updateQuiz: async (_, { id, input }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return updateExistingQuiz(id, input, context.user);
    },

    publishQuiz: async (_, { id }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return publishExistingQuiz(id, context.user);
    },

    deleteQuiz: async (_, { id }, context) => {
      if (!context.user) throw new Error("You must be logged in");
      return deleteExistingQuiz(id, context.user);
    },
  },

  // FIELD RESOLVERS
  // These run for specific fields on the Quiz type
  // submissionCount isn't stored directly — we compute it here
  Quiz: {
    submissionCount: (parent) => {
      return parent._count?.submissions ?? 0;
    },

    // Use optional chaining — if null, return null (not crash)
    startTime: (parent) => parent.startTime?.toISOString() ?? null,
    endTime: (parent) => parent.endTime?.toISOString() ?? null,
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },
};

export default quizResolvers;
