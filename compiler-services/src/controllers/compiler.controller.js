// src/controllers/compiler.controller.js

import { executeCode } from "../services/compiler.service.js";
import logger from "../config/logger.js";

// POST /api/compiler/execute
export const execute = async (req, res, next) => {
  try {
    const { language, code, stdin } = req.body;

    const result = await executeCode({ language, code, stdin });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/compiler/languages
// Returns list of supported languages
// Frontend uses this to populate a language dropdown
export const getSupportedLanguages = async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      languages: [
        {
          id: "java",
          label: "Java",
          version: "OpenJDK 17",
          extension: ".java",
          // Default boilerplate so editor shows something useful on load
          template: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
        },
        {
          id: "python",
          label: "Python",
          version: "Python 3.11",
          extension: ".py",
          template: `name = input()\nprint(f"Hello, {name}!")`,
        },
      ],
    },
  });
};
