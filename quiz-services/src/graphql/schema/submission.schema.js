import { gql } from "graphql-tag";

const submissionSchema = gql`
  type Submission {
    id: ID!
    quizId: String!
    studentId: String!
    studentEmail: String!
    studentName: String!
    score: Int!
    totalPoints: Int!
    percentage: Float! # calculated field: score/totalPoints * 100
    timeTaken: Int! # total seconds
    startedAt: String!
    submittedAt: String!
    answers: [AnswerResult!]!
  }

  type AnswerResult {
    id: ID!
    question: Question!
    option: Option! # what the student picked
    isCorrect: Boolean!
    timeTaken: Int! # seconds on this question
  }

  # Each answer the student submits
  input AnswerInput {
    questionId: ID!
    optionId: ID!
    timeTaken: Int! # frontend tracks seconds spent per question
  }

  extend type Query {
    # Teacher: get all submissions for a quiz
    quizSubmissions(quizId: ID!): [Submission!]!

    # Teacher: get one student's full submission
    submission(id: ID!): Submission

    # Student: get their own submission for a quiz
    mySubmission(quizId: ID!): Submission
  }

  extend type Mutation {
    # Student starts the quiz — records startedAt time
    startQuiz(quizId: ID!): Submission!

    # Student submits all answers at once
    submitQuiz(submissionId: ID!, answers: [AnswerInput!]!): Submission!
  }
`;

export default submissionSchema;