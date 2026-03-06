// WHAT IS CONTEXT IN GRAPHQL?
// Context is an object passed to EVERY resolver automatically.
// It's equivalent to req.user in Express middleware.
// We use it to verify the JWT and attach the user to every request.
//
// HOW IT WORKS:
// Every GraphQL request hits our single /graphql endpoint.
// Before any resolver runs, this context function runs first.
// It reads the Authorization header, calls auth-service to verify,
// and puts the user on the context object.
// Resolvers then do: if (!context.user) throw new Error("Unauthorized")

import axios from "axios";

const buildContext = async ({ req }) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No token — context.user will be null
    // Public resolvers (like activeQuiz) work fine
    // Protected resolvers will throw when they check context.user
    return { user: null };
  }

  const token = authHeader.split(" ")[1];

  try {
    // Call auth-service to validate token and get user
    // This is inter-service communication — same pattern as form-service
    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return { user: response.data.data.user };
    // context.user = { id, email, verified }
  } catch {
    // Token invalid or auth-service down
    return { user: null };
  }
};

export default buildContext;