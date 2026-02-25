import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/users/user.model.js"; 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            firstname: profile.displayName,
            googleId: profile.id,
            isVerified: true,
            lastLoginProvider: "google",
          });
        } else {
          let shouldSave = false;

          // Link google login for existing email users.
          if (!user.googleId) {
            user.googleId = profile.id;
            shouldSave = true;
          }

          if (!user.isVerified) {
            user.isVerified = true;
            shouldSave = true;
          }

          if (user.lastLoginProvider !== "google") {
            user.lastLoginProvider = "google";
            shouldSave = true;
          }

          if (shouldSave) {
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;
