import { Router } from "express";
import { sendMail } from "../services/mail.service.js";
import { MAIL_SERVICE_SECRET } from "../config/env.js";

const router = Router();

// Internal auth middleware — checks secret header
const requireSecret = (req, res, next) => {
  const secret = req.headers["x-mail-secret"];

  if (!secret || secret !== MAIL_SERVICE_SECRET) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized — invalid or missing mail service secret",
    });
  }

  next();
};

// POST /send — main endpoint all services call
router.post("/send", requireSecret, async (req, res, next) => {
  try {
    const { to, type, data } = req.body;

    // Basic validation
    if (!to || !type || !data) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: to, type, data",
      });
    }

    await sendMail({ to, type, data });

    res.status(200).json({
      status: "success",
      message: `Email "${type}" sent to ${to}`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
