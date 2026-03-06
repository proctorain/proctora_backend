// Same pattern as auth-service.
// Redis is used in quiz-service for one thing right now:
// Storing the "quiz started" state per student so if they refresh
// the page mid-quiz, we know they already started and when.
//
// Key:   "quiz_started:<studentId>:<quizId>"
// Value: submissionId (so we can resume)
// TTL:   matches the quiz time limit

import { createClient } from "redis";
import { REDIS_URL } from '../config/env.js'

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis error (quiz-service):", err);
});

redisClient.connect().then(() => {
  console.log("Redis connected (quiz-service)");
});

export default redisClient;
