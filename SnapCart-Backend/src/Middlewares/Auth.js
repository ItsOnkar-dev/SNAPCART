import jwt from "jsonwebtoken";
import { AuthorizationError } from "../Core/ApiError.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "JWTKJDGFSDFHDGSVFSDUFSDBFS";

export const isLoggedIn = (req, res, next) => {
  // Check if Authorization header exists
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AuthorizationError("No token provided. Please login."));
  }

  // Extract token and verify
  try {
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      console.error("Empty token");
      return next(new AuthorizationError("Invalid token format"));
    }

    const { userId } = jwt.verify(token, JWT_SECRET_KEY);
    req.userId = userId;

    return next(); //this will call the next middleware function in the stack
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AuthorizationError("Session expired. Please login again."));
    }
    return next(new AuthorizationError("Invalid Token. Please login to continue"));
  }
};

// export const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // Check if user role is included in the allowed roles
//     if (!roles.includes(req.user.role)) {
//       Logger.warn("User does not have permission", { userRole: req.user.role, requiredRoles: roles });
//       return next(new UnauthorizedError('You do not have permission to perform this action'));
//     }
    
//     next();
//   };
// };

// export const isAdmin = (req, res, next) => {
//   Logger.info("Checking if user is admin");
  
//   if (!req.user || req.user.role !== 'admin') {
//     Logger.warn("Access denied: User is not an admin", { user: req.user ? req.user._id : 'unknown' });
//     return next(new UnauthorizedError('Access denied. Admin privileges required.'));
//   }
  
//   next();
// };



