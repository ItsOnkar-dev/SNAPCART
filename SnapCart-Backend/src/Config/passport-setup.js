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
      console.log("Database connection is active");
      return true;
    }
    
    // If not connected, try to connect
    if (mongoose.connection.readyState === 0) {
      console.log("Attempting to connect to database...");
      await mongoose.connect(process.env.DB_URL);
      console.log("Database connected successfully");
      return true;
    }
    
    console.log("Database connection state:", mongoose.connection.readyState);
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
      callbackURL: "/auth/google/callback", // Use relative path instead of absolute
      scope: ["profile", "email"],
      // Add these options for Render compatibility
      proxy: true, // Important for Render deployments
      passReqToCallback: false
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("=== Google Strategy Callback ===");
        console.log("Access token received:", !!accessToken);
        console.log("Profile ID:", profile.id);
        console.log("Profile emails:", profile.emails);
        console.log("Profile displayName:", profile.displayName);
        
        // Validate environment variables
        if (!process.env.BACKEND_URL) {
          console.error("BACKEND_URL environment variable is not set");
          return done(new Error("Backend URL not configured"), null);
        }
        
        // Check database connection
        const dbConnected = await checkDatabaseConnection();
        if (!dbConnected) {
          console.error("Database connection not available");
          return done(new Error("Database connection not available"), null);
        }
        
        // Validate required profile data
        if (!profile.id) {
          console.error("No profile ID received from Google");
          return done(new Error("Invalid profile data received from Google"), null);
        }

        // Get email from profile
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          console.error("No email received from Google profile");
          return done(new Error("Email is required for registration"), null);
        }

        console.log("Processing user with email:", email);

        // First, check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        console.log("User found by googleId:", user ? user._id : 'Not found');

        if (!user) {
          // Check by email if not found by googleId
          console.log("Checking for existing user by email");
          user = await User.findOne({ email: email });
          console.log("User found by email:", user ? user._id : 'Not found');
          
          if (user) {
            // Link existing user to Google account
            console.log("Linking existing user to Google account");
            user.googleId = profile.id;
            
            // Update name if provided
            if (profile.displayName) {
              user.name = profile.displayName;
            }
            
            // Update avatar if provided
            if (profile.photos && profile.photos.length > 0 && profile.photos[0].value) {
              user.avatar = profile.photos[0].value;
            }
            
            user.isOAuthUser = true;
            await user.save();
            console.log("User linked and updated successfully");
          } else {
            // Create new user
            console.log("Creating new user from Google profile");
            
            // Generate unique username
            const baseUsername = profile.displayName
              ? profile.displayName.replace(/\s+/g, '').toLowerCase()
              : email.split('@')[0];
            
            let username = baseUsername;
            let counter = 1;
            
            // Ensure username is unique
            while (await User.findOne({ username })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }
            
            console.log("Generated username:", username);
            
            // Generate random password for security
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 12);
            
            const newUserData = {
              username,
              name: profile.displayName || username,
              email: email,
              googleId: profile.id,
              password: hashedPassword,
              role: 'Buyer', // Default role
              avatar: profile.photos && profile.photos.length > 0 && profile.photos[0].value
                ? profile.photos[0].value
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || username)}&background=random`,
              isOAuthUser: true,
              isEmailVerified: true // Since it's from Google, we can assume email is verified
            };
            
            console.log("Creating user with data:", {
              username: newUserData.username,
              email: newUserData.email,
              name: newUserData.name,
              googleId: newUserData.googleId
            });
            
            user = new User(newUserData);
            await user.save();
            console.log("New user created successfully:", user._id);
          }
        } else {
          // Update existing OAuth user
          console.log("Updating existing OAuth user");
          
          // Update name if it has changed
          if (profile.displayName && user.name !== profile.displayName) {
            user.name = profile.displayName;
          }
          
          // Update avatar if provided
          if (profile.photos && profile.photos.length > 0 && profile.photos[0].value) {
            user.avatar = profile.photos[0].value;
          }
          
          // Update email if it has changed
          if (email && user.email !== email) {
            user.email = email;
          }
          
          await user.save();
          console.log("User updated successfully");
        }
        
        console.log("Google strategy completed successfully for user:", user._id);
        return done(null, user);
        
      } catch (error) {
        console.error('=== Passport Google Strategy Error ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.code === 11000) {
          // Duplicate key error
          console.error('Duplicate key error - user might already exist');
          return done(new Error('User already exists with this email'), null);
        }
        
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user._id);
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user with ID:", id);
    const user = await User.findById(id);
    if (!user) {
      console.log("User not found during deserialization");
      return done(null, false);
    }
    console.log("User deserialized successfully:", user._id);
    done(null, user);
  } catch (error) {
    console.error("Error during user deserialization:", error);
    done(error, null);
  }
});

export default passport;