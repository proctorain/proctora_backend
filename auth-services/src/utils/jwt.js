import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES,
  JWT_VERIFY_SECRET,
} from "../config/env.js";

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES,
  });
};
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
  s;
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES,
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

export const generateVerificationToken = (email) => {
  return jwt.sign(
    { email },
    JWT_VERIFY_SECRET,
    { expiresIn: "1d" }, 
  );
};

export const verifyVerificationToken = (token) => {
  return jwt.verify(token, JWT_VERIFY_SECRET);
};