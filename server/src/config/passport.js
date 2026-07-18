import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model.js';

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          let user = await User.findOne({ email });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              user.profilePhoto = user.profilePhoto || profile.photos?.[0]?.value;
              await user.save();
            }
            return done(null, user);
          }

          // New user — will need org domain check in the auth controller
          const newUser = {
            googleId: profile.id,
            name: profile.displayName,
            email,
            profilePhoto: profile.photos?.[0]?.value,
            isEmailVerified: true,
          };

          return done(null, newUser, { isNewUser: true });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id || user.email);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
