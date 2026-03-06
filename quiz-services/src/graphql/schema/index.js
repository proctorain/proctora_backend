// WHY A BASE TYPE?
// GraphQL requires Query and Mutation to be defined exactly once.
// We then "extend" them in each schema file.
// This base definition is what lets extend work.

import { gql } from "graphql-tag";
import quizSchema from "./quiz.schema.js";
import questionSchema from "./question.schema.js";
import submissionSchema from "./submission.schema.js";

// Base types — extended by each schema file
const baseSchema = gql`
  type Query
  type Mutation
`;

// Export all schemas merged into one array
// Apollo Server accepts an array and merges them automatically
export default [baseSchema, quizSchema, questionSchema, submissionSchema];
