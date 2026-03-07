import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import typeDefs from "./graphql/schema/index.js";
import resolvers from "./graphql/resolvers/index.js";
import buildContext from "./graphql/context.js";
import { PORT } from './config/env.js';

async function startServer() {
  const server = new ApolloServer({
    typeDefs, // your schema definitions
    resolvers, // your resolver functions

    // formatError lets you customize how errors look to the client
    formatError: (formattedError, error) => {
      console.error("[GraphQL Error]", error);
      return {
        message: formattedError.message,
        code: formattedError.extensions?.code,
      };
    },
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(PORT) },
    context: buildContext,
    // context runs before every request — attaches user to context
  });

  console.log(`Quiz GraphQL service ready at ${url}`);
  console.log(`GraphQL Playground available at ${url}`);
}

startServer();
