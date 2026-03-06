import { gql } from "graphql-tag";

const questionSchema = gql`
  type Question {
    id: ID!
    quizId: String!
    text: String!
    order: Int!
    options: [Option!]!
  }

  type Option {
    id: ID!
    text: String!
    isCorrect: Boolean! # hidden from students — resolver handles this
    order: Int!
  }

  # Used when teacher adds an option to a question
  input OptionInput {
    text: String!
    isCorrect: Boolean!
    order: Int!
  }

  extend type Query {
    # Get all questions for a quiz (teacher view — includes isCorrect)
    quizQuestions(quizId: ID!): [Question!]!
  }

  extend type Mutation {
    # Add a question to a quiz
    addQuestion(quizId: ID!, text: String!, order: Int!): Question!

    # Update question text
    updateQuestion(id: ID!, text: String!): Question!

    # Delete a question
    deleteQuestion(id: ID!): Boolean!

    # Add an option to a question
    addOption(questionId: ID!, input: OptionInput!): Option!

    # Update an existing option
    updateOption(id: ID!, text: String, isCorrect: Boolean): Option!

    # Delete an option
    deleteOption(id: ID!): Boolean!
  }
`;

export default questionSchema;
