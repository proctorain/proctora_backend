import axios from "axios";
import { MAIL_SERVICE_SECRET, MAIL_SERVICE_URL } from "../config/env.js";
const mailClient = axios.create({
  baseURL: MAIL_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-mail-secret": MAIL_SERVICE_SECRET,
  },
});

export default mailClient;
