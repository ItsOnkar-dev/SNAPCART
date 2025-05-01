import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../Models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL || 'http://localhost:8000'}/auth/google/callback`,
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        // console.log("Google profile received:", profile);
        // First, check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        console.log("Existing user by googleId:", user);

        if (!user) {
          // If not found by googleId, check by email
          console.log("Creating new user from Google profile:", profile.id);
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          console.log("Email from Google profile:", email);
          
          if (email) {
            user = await User.findOne({ email });
          }
          
          if (user) {
            // If user exists by email but no googleId, update the user to link Google account
            user.googleId = profile.id;
            // Store the original display name
            user.name = profile.displayName || user.name;
            if (profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          } else {
            // Create new user if doesn't exist at all
            const username = profile.displayName
              ? profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000)
              : 'google_user_' + Math.floor(Math.random() * 10000);
              
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 12);
            
            const newUser = new User({
              username,
              name: profile.displayName || username, // Store the original display name
              email: email || `${username}@placeholder.com`,
              googleId: profile.id,
              password: hashedPassword, // Store a random password hash for account security
              role: 'Buyer', // Default role
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
              isOAuthUser: true
            });
            
            user = await newUser.save();
            console.log("New user successfully saved:", user);
          }
        } else {
          // Update the name if the user already exists
          if (profile.displayName && (!user.name || user.name !== profile.displayName)) {
            user.name = profile.displayName;
            await user.save();
          }
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Passport Google Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

// Passport configuration
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