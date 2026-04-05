import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pino from "pino";

const level = "error";

const logDir = fileURLToPath(new URL("../../logs/", import.meta.url));
fs.mkdirSync(logDir, { recursive: true });

const streams = [
  { level, stream: process.stderr },
  {
    level: "error",
    stream: pino.destination({
      dest: path.join(logDir, "error.log"),
      sync: false,
    }),
  },
];

const logger = pino(
  {
    level,
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    serializers: {
      err: pino.stdSerializers.err,
    },
  },
  pino.multistream(streams),
);

export default logger;
