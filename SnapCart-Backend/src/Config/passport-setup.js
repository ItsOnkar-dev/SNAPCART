import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../Models/User.js';

dotenv.config();

// Utility function to check database connection
const checkDatabaseConnection = async () => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return true;
    }
    
    // If not connected, try to connect
    if (mongoose.connection.readyState === 0) {
      console.log("Attempting to connect to database...");
      await mongoose.connect(process.env.DB_URL);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
};

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth callback initiated");
        console.log("Access token received:", !!accessToken);
        console.log("Refresh token received:", !!refreshToken);
        console.log("Callback URL:", `${process.env.BACKEND_URL}/auth/google/callback`);
        
        // Validate environment variables
        if (!process.env.BACKEND_URL) {
          console.error("BACKEND_URL environment variable is not set");
          return done(new Error("Backend URL not configured"), null);
        }
        
        // Check database connection
        if (!await checkDatabaseConnection()) {
          console.error("Database connection not available");
          return done(new Error("Database connection not available"), null);
        }
        
        console.log("Google profile received:", {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails ? profile.emails[0]?.value : 'No email',
          photos: profile.photos ? profile.photos.length : 0
        });

        // Validate required profile data
        if (!profile.id) {
          console.error("No profile ID received from Google");
          return done(new Error("Invalid profile data received from Google"), null);
        }

        // Validate that we have either email or display name
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.error("No email received from Google profile");
          return done(new Error("Email is required for registration"), null);
        }

        // First, check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        console.log("Existing user by googleId:", user ? user._id : 'Not found');

        if (!user) {
          // If not found by googleId, check by email
          console.log("User not found by googleId, checking by email");
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          console.log("Email from Google profile:", email);
          
          if (email) {
            user = await User.findOne({ email });
            console.log("User found by email:", user ? user._id : 'Not found');
          }
          
          if (user) {
            // If user exists by email but no googleId, update the user to link Google account
            console.log("Linking existing user to Google account");
            user.googleId = profile.id;
            // Store the original display name
            user.name = profile.displayName || user.name;
            if (profile.photos && profile.photos.length > 0 && profile.photos[0].value) {
              user.avatar = profile.photos[0].value;
            } else {
              // Use a default Google avatar if no photo is provided
              user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || user.username || 'User')}`;
            }
            await user.save();
            console.log("User updated successfully");
          } else {
            // Create new user if doesn't exist at all
            console.log("Creating new user from Google profile");
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
              avatar: profile.photos && profile.photos.length > 0 && profile.photos[0].value
                ? profile.photos[0].value
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || username)}`,
              isOAuthUser: true
            });
            
            user = await newUser.save();
            console.log("New user successfully saved:", user._id);
          }
        } else {
          // Update the name if the user already exists
          if (profile.displayName && (!user.name || user.name !== profile.displayName)) {
            user.name = profile.displayName;
            await user.save();
            console.log("User name updated");
          }
        }
        
        console.log("Google strategy completed successfully for user:", user._id);
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