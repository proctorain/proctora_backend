import { gql } from "graphql-tag";

const quizSchema = gql`
  type Quiz {
    id: ID!
    title: String!
    description: String
    timeLimit: Int!
    startTime: String
    endTime: String
    teacherId: String!
    teacherEmail: String!
    published: Boolean!
    createdAt: String!
    updatedAt: String!
    questions: [Question!]!
    submissions: [Submission!]!
    submissionCount: Int!
  }

  input CreateQuizInput {
    title: String!
    description: String
    timeLimit: Int!
    startTime: String # optional — defaults to now() if not provided
    endTime: String # optional — quiz stays open indefinitely if not provided
  }

  input UpdateQuizInput {
    title: String
    description: String
    timeLimit: Int
    startTime: String
    endTime: String
  }

  extend type Query {
    quiz(id: ID!): Quiz
    myQuizzes: [Quiz!]!
    activeQuiz(id: ID!): Quiz
  }

  extend type Mutation {
    createQuiz(input: CreateQuizInput!): Quiz!
    updateQuiz(id: ID!, input: UpdateQuizInput!): Quiz!
    publishQuiz(id: ID!): Quiz!
    deleteQuiz(id: ID!): Boolean!
  }
`;

export default quizSchema;
