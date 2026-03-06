// src/graphql/resolvers/index.js
//
// WHY MERGE INSTEAD OF SPREAD?
// If you do { ...resolverA, ...resolverB }, and both have a "Query" key,
// the second one completely overwrites the first.
// You'd lose half your resolvers silently — very hard to debug.
//
// lodash merge does a DEEP merge:
// resolverA.Query + resolverB.Query → combined into one Query object
// resolverA.Mutation + resolverB.Mutation → combined into one Mutation object
//
// Example of what merge does:
//
// resolverA = { Query: { quiz: fn1 }, Mutation: { createQuiz: fn2 } }
// resolverB = { Query: { submission: fn3 }, Mutation: { submitQuiz: fn4 } }
//
// merge result = {
//   Query:    { quiz: fn1, submission: fn3 },
//   Mutation: { createQuiz: fn2, submitQuiz: fn4 }
// }
//
// Without merge, resolverB.Query would erase resolverA.Query entirely.

import merge from "lodash.merge";

import quizResolvers from"./quiz.resolver.js";
import questionResolvers from "./question.resolver.js";
import submissionResolvers from "./submission.resolver.js";

export default merge(
  {}, // empty base object — merge mutates the first arg
  quizResolvers, // adds Quiz queries + mutations + field resolvers
  questionResolvers, // adds Question queries + mutations
  submissionResolvers, // adds Submission queries + mutations + field resolvers
);
