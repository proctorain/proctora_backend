// src/runners/index.js
//
// Runner registry — maps language name to runner function.
// When you add Python later:
//   1. Create python.runner.js
//   2. Import and add it here
//   3. Done — compiler.service.js needs no changes
//
// This is the open/closed principle:
// Open for extension (add new languages)
// Closed for modification (don't touch existing code)

import { runJava } from "./java.runner.js";
import { runPython } from "./python.runner.js";

const RUNNERS = {
  java: runJava,
  python: runPython,
  // python: runPython,   ← add later
  // cpp:    runCpp,      ← add later
  // js:     runNode,     ← add later
};

// Supported languages list — used for validation
export const SUPPORTED_LANGUAGES = Object.keys(RUNNERS);

// Get runner function by language
export const getRunner = (language) => {
  return RUNNERS[language.toLowerCase()] || null;
};
