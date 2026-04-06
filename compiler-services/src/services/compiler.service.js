// src/services/compiler.service.js
//
// Business logic — validates input, picks runner, returns result.
// No HTTP here — no req/res.

import { getRunner, SUPPORTED_LANGUAGES } from "../runners/index.js";
import logger from "../config/logger.js";

export const executeCode = async ({ language, code, stdin = "" }) => {
  // ── Validate language ───────────────────────────────────────────────────
  if (!language) {
    const err = new Error("Language is required");
    err.statusCode = 400;
    throw err;
  }

  const normalizedLang = language.toLowerCase().trim();

  if (!SUPPORTED_LANGUAGES.includes(normalizedLang)) {
    const err = new Error(
      `Language "${language}" is not supported. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
    );
    err.statusCode = 400;
    throw err;
  }

  // ── Validate code ───────────────────────────────────────────────────────
  if (!code || !code.trim()) {
    const err = new Error("Code cannot be empty");
    err.statusCode = 400;
    throw err;
  }

  if (code.length > 50000) {
    // 50KB max code size — prevents absurdly large submissions
    const err = new Error("Code is too large. Maximum 50,000 characters.");
    err.statusCode = 400;
    throw err;
  }

  // ── Get the right runner and execute ───────────────────────────────────
  const runner = getRunner(normalizedLang);

  logger.info(
    { language: normalizedLang, codeLength: code.length },
    "Executing code",
  );

  const result = await runner(code, stdin);

  return result;
};
