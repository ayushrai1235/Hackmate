import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Setup Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // If not, see if email already exists
        const email = profile.emails[0].value;
        user = await User.findOne({ email });

        if (user) {
          // Link googleId to existing account
          user.googleId = profile.id;
          if (!user.avatar?.secureUrl && profile.photos && profile.photos.length > 0) {
            user.avatar = { secureUrl: profile.photos[0].value };
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          avatar: { secureUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '' },
          onboardingComplete: false,
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Setup GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Handle missing email from GitHub profile (happens if email is private)
        const email = profile.emails && profile.emails.length > 0 
          ? profile.emails[0].value 
          : `${profile.username}@github.com`; // Fallback email

        user = await User.findOne({ email });

        if (user) {
          user.githubId = profile.id;
          user.githubUsername = profile.username;
          if (!user.avatar?.secureUrl && profile.photos && profile.photos.length > 0) {
            user.avatar = { secureUrl: profile.photos[0].value };
          }
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          githubId: profile.id,
          githubUsername: profile.username,
          avatar: { secureUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '' },
          onboardingComplete: false,
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// We won't use sessions, but Passport requires serialize/deserialize methods to be defined
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
