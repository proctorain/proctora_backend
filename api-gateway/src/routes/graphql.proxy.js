// GraphQL is different from REST in one key way:
// ALL GraphQL operations (queries + mutations) go to ONE endpoint: /graphql
// So we proxy everything hitting /graphql on the gateway
// → to /graphql on quiz-service
//
// Apollo Server also has a built-in browser playground at /graphql (GET)
// We proxy that too so you can open localhost:5500/graphql in the browser
// and get the Apollo Sandbox for testing

import { createProxyMiddleware } from "http-proxy-middleware";
import { QUIZ_SERVICE_URL } from '../config/env.js';

const graphqlProxy = createProxyMiddleware({
  target: QUIZ_SERVICE_URL,
  // Everything going to /graphql → forwarded to http://localhost:5502/graphql

  changeOrigin: true,

  // ws: true would enable WebSocket proxying (needed for GraphQL subscriptions)
  // We don't have subscriptions yet but good to know it exists
  // ws: true,

  on: {
    proxyReq: (proxyReq, req) => {
      console.log(
        `[GraphQL Proxy] ${req.method} ${req.path} → ${QUIZ_SERVICE_URL}${req.path}`,
      );
    },

    error: (err, req, res) => {
      console.error("[GraphQL Proxy Error]", err.message);
      // GraphQL errors must always be JSON with an "errors" array
      // This is the GraphQL spec for error responses
      res.status(502).json({
        errors: [
          {
            message: "Quiz service is unavailable. Please try again later.",
            extensions: { code: "SERVICE_UNAVAILABLE" },
          },
        ],
      });
    },
  },
});

export default graphqlProxy;