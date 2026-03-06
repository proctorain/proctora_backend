// WHAT IS A PROXY?
// Instead of the frontend calling auth-service directly,
// every request goes through the gateway.
// The gateway receives the request and FORWARDS it to auth-service.
// auth-service responds → gateway forwards the response back to frontend.
// The frontend never knows auth-service exists or what port it's on.
//
// http-proxy-middleware does all the forwarding automatically.
// We just tell it: "anything hitting this route, forward to this URL"

import { createProxyMiddleware } from "http-proxy-middleware";
import { AUTH_SERVICE_URL } from '../config/env.js';

const authProxy = createProxyMiddleware({
  target: `${AUTH_SERVICE_URL}/api/auth`,
  // target = where to forward the request to
  // e.g. POST /api/auth/login → forwarded to http://localhost:5501/api/auth/login

  changeOrigin: true,
  // changeOrigin: true rewrites the Host header on the forwarded request
  // so auth-service sees the request as coming to localhost:5501
  // not as coming from localhost:5500

  on: {
    // Log every proxied request so you can debug easily
    proxyReq: (proxyReq, req) => {
      console.log(
        `[Auth Proxy] ${req.method} ${req.path} → ${AUTH_SERVICE_URL}${req.path}`,
      );
    },

    // If auth-service is down or unreachable, send a clear error
    error: (err, req, res) => {
      console.error("[Auth Proxy Error]", err.message);
      res.status(502).json({
        status: "error",
        message: "Auth service is unavailable. Please try again later.",
        // 502 Bad Gateway = gateway received an invalid response from upstream
      });
    },
  },
});

export default authProxy;
