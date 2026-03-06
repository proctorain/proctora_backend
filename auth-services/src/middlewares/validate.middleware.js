import HTTP_STATUS from "../utils/http.js";
// src/middlewares/validate.middleware.js

// This is a middleware FACTORY.
// You call it with a Zod schema, it gives you back a middleware function.
//
// Usage in routes:
//   router.post("/register", validate(registerDTO), registerController)
//
// Order of execution:
//   1. validate(registerDTO) checks req.body against the schema
//   2a. FAILS → sends 400 error immediately, controller never runs
//   2b. PASSES → calls next() → controller runs with clean data

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  // safeParse = validate without throwing an exception
  // Returns { success: true, data: {...} }
  //      or { success: false, error: ZodError }

  if (!result.success) {
    const errors = result.error?.errors?.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })) ?? [];

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: "error",
      message: "Validation failed",
      errors,
      // Example response:
      // { "errors": [{ "field": "email", "message": "Must be a valid email address" }] }
    });
  }

  req.body = result.data;
  // Replace req.body with Zod's parsed output.
  // This strips any extra fields the user sent that aren't in the schema.
  // e.g., if they send { email, password, isAdmin: true } → isAdmin is removed

  next();
};
