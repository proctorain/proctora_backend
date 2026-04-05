// src/config/passport.js
//
// Passport is the OAuth middleware for Node.js.
// We configure the Google strategy here.
// When Google redirects back to our callback URL,
// passport extracts the profile and calls the verify function.

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import logger from "./logger.js";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from './env.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["email", "profile"],
        // scope tells Google what info we want:
        // email  → user's email address
        // profile → name + profile picture
      },

      // This function runs after Google authenticates the user
      // profile = everything Google gave us about the user
      // done = callback to tell passport we're done
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract what we need from the Google profile object
          const googleUser = {
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value,
            googleId: profile.id,
          };

          logger.info(
            { email: googleUser.email },
            "Google OAuth profile received",
          );

          // Pass the Google user data to the callback
          // The actual DB logic lives in auth.service.js
          // passport just extracts — service decides what to do
          done(null, googleUser);
        } catch (err) {
          logger.error({ err: err.message }, "Google OAuth strategy error");
          done(err, null);
        }
      },
    ),
  );

  // Passport requires serialize/deserialize for sessions
  // We use JWT not sessions, so these are minimal
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};
