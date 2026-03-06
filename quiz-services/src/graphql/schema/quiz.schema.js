// This file defines:
//   - What a Quiz looks like (type Quiz)
//   - What queries exist for quizzes (in type Query)
//   - What mutations exist for quizzes (in type Mutation)

import { gql } from 'graphql-tag';

const quizSchema = gql`
  type Quiz {
    id: ID!
    title: String!
    description: String # nullable — optional field
    timeLimit: Int!
    startTime: String! # ISO datetime string
    endTime: String! # ISO datetime string
    teacherId: String!
    teacherEmail: String!
    published: Boolean!
    createdAt: String!
    updatedAt: String!
    questions: [Question!]! # array of questions — always an array, never null
    submissions: [Submission!]! # only visible to teacher
    submissionCount: Int! # how many students have submitted
  }

  # Inputs
  # Input types are used for mutation arguments
  # They're separate from return types because they have different fields

  input CreateQuizInput {
    title: String!
    description: String # optional
    timeLimit: Int!
    startTime: String! # ISO string e.g. "2024-01-15T09:00:00.000Z"
    endTime: String!
  }

  input UpdateQuizInput {
    title: String
    description: String
    timeLimit: Int
    startTime: String
    endTime: String
  }

  extend type Query {
    # Get one quiz by ID — used by student to load quiz via share link
    quiz(id: ID!): Quiz

    # Get all quizzes created by the logged-in teacher
    myQuizzes: [Quiz!]!

    # Get quiz for student to take — validates it's active and published
    activeQuiz(id: ID!): Quiz
  }

  extend type Mutation {
    # Step 1: Teacher creates quiz (draft state)
    createQuiz(input: CreateQuizInput!): Quiz!

    # Teacher updates quiz details (even after publishing)
    updateQuiz(id: ID!, input: UpdateQuizInput!): Quiz!

    # Teacher publishes quiz — makes it accessible to students
    publishQuiz(id: ID!): Quiz!

    # Teacher deletes quiz (cascades to questions + submissions)
    deleteQuiz(id: ID!): Boolean!
  }
`;

export default quizSchema;