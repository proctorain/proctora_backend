// src/runners/java.runner.js
//
// This is the core of the compiler service.
// Everything Java-specific lives here.
// When you add Python later, you create python.runner.js
// and register it in index.js — nothing else changes.
//
// EXECUTION FLOW:
// 1. Write code to temp/execId/Main.java
// 2. Run Docker container mounting that folder
// 3. Container compiles then runs the code
// 4. Capture stdout + stderr from container
// 5. Clean up temp folder
// 6. Return result
//
// WHY A TEMP FOLDER PER EXECUTION?
// Each execution gets its own folder with a UUID name.
// This prevents two simultaneous executions from overwriting each other's files.
// The folder is deleted immediately after execution — no leftover files.

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger.js";

const execAsync = promisify(exec);
// promisify turns exec (callback-based) into a promise
// so we can use async/await instead of nested callbacks

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temp directory — two levels up from runners/ to project root /temp
const TEMP_DIR = path.join(__dirname, "../../temp");

export const runJava = async (code, stdin = "") => {
  // Unique ID for this execution — prevents file collisions
  const execId = uuidv4();
  const execDir = path.join(TEMP_DIR, execId);
  // e.g. /compiler-service/temp/a1b2c3d4-uuid/

  try {
    // ── Step 1: Create isolated temp directory ──────────────────────────────
    await fs.mkdir(execDir, { recursive: true });

    // Write the Java source file
    // Java requires the class name to match the filename
    // We always name the class Main so students don't have to worry about this
    await fs.writeFile(path.join(execDir, "Main.java"), code, "utf8");

    // Write stdin to a file so we can pipe it into the container
    await fs.writeFile(path.join(execDir, "stdin.txt"), stdin, "utf8");

    // ── Step 2: Build the Docker command ───────────────────────────────────
    //
    // Breaking down the docker command:
    //
    // docker run              → start a container
    // --rm                    → auto-delete container when done (no cleanup needed)
    // --network none          → NO internet access inside container
    //                           prevents code from making HTTP requests
    // --memory 128m           → max 128MB RAM
    // --cpus 0.5              → max 0.5 CPU cores
    // --pids-limit 50         → max 50 processes (prevents fork bombs)
    // --read-only             → filesystem is read-only EXCEPT mounted volume
    // --tmpfs /tmp            → writable /tmp inside container (javac needs it)
    // -v execDir:/code        → mount our temp folder as /code inside container
    // -w /code                → set working directory to /code
    // openjdk:17-slim         → the Java Docker image
    // sh -c "..."             → run shell commands:
    //   javac Main.java       → compile
    //   && java Main < stdin  → if compile succeeds, run with stdin piped in

    const dockerImage = process.env.DOCKER_IMAGE_JAVA || "openjdk:17-slim";
    const memoryLimit = process.env.MEMORY_LIMIT || "128m";
    const cpuLimit = process.env.CPU_LIMIT || "0.5";
    const timeout = parseInt(process.env.EXECUTION_TIMEOUT_MS || "10000");

    const dockerCmd = [
      "docker run",
      "--rm", // auto-remove container
      "--network none", // no internet
      `--memory ${memoryLimit}`, // memory limit
      `--cpus ${cpuLimit}`, // cpu limit
      "--pids-limit 50", // process limit
      "--read-only", // read-only filesystem
      "--tmpfs /tmp:rw,size=64m", // writable tmp for javac
      `-v "${execDir}:/code"`, // mount code directory
      "-w /code", // working directory
      dockerImage,
      `sh -c "javac Main.java 2>&1 && java -cp . Main < stdin.txt 2>&1"`,
      // 2>&1 merges stderr into stdout so we capture everything in one stream
      // javac errors and runtime errors both come back in the same output
    ].join(" ");

    logger.debug({ execId, dockerCmd }, "Running Docker command");

    const startTime = Date.now();

    // ── Step 3: Execute and capture output ─────────────────────────────────
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    try {
      const result = await execAsync(dockerCmd, {
        timeout,
        // If execution exceeds timeout, execAsync throws with signal SIGTERM
        maxBuffer: 1024 * 1024, // 1MB max output
      });

      stdout = result.stdout || "";
      stderr = result.stderr || "";
    } catch (execErr) {
      // execAsync throws on non-zero exit code (compile error, runtime error)
      // This is NOT a server error — it's the user's code failing
      // We capture it and return it as output, not as a 500

      if (execErr.killed || execErr.signal === "SIGTERM") {
        timedOut = true;
        stdout = "";
        stderr = "Execution timed out. Your code took too long to run.";
      } else {
        // Compilation error or runtime exception
        // execErr.stdout has the javac error output
        stdout = execErr.stdout || "";
        stderr = execErr.stderr || execErr.message || "";
      }
    }

    const executionTime = Date.now() - startTime;

    logger.info(
      {
        execId,
        executionTime,
        timedOut,
        hasError: !!stderr,
      },
      "Execution complete",
    );

    // ── Step 4: Return result ───────────────────────────────────────────────
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      executionTime, // ms
      timedOut,
      language: "java",
    };
  } finally {
    // ── Step 5: Always clean up — even if execution threw ───────────────────
    // finally block runs whether the try succeeded or threw
    try {
      await fs.rm(execDir, { recursive: true, force: true });
      logger.debug({ execId }, "Temp directory cleaned up");
    } catch (cleanupErr) {
      // Log but don't throw — cleanup failure shouldn't affect the response
      logger.error({ execId, err: cleanupErr.message }, "Cleanup failed");
    }
  }
};
