// src/routes/compiler.routes.js

import { Router } from "express";
import {
  execute,
  getSupportedLanguages,
} from "../controllers/compiler.controller.js";

const router = Router();

// Public — anyone can use these endpoints
// No auth middleware as discussed

// GET /api/compiler/languages — get supported languages
router.get("/languages", getSupportedLanguages);

// POST /api/compiler/execute — run code
router.post("/execute", execute);

export default router;
