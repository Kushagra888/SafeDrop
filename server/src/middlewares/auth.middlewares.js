import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateUser = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    console.log("No token or invalid token format");
    return res.status(401).json({ error: "unauthorized access" });
  }
  
  token = token.split(" ")[1];
  
  try {
    console.log("Verifying token with JWT_SECRET length:", JWT_SECRET.length);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token decoded successfully:", { userId: decoded.userId, email: decoded.email });
    
    // Verify user exists in database
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      console.log("User not found in database for userId:", decoded.userId);
      return res.status(401).json({ error: "user not found" });
    }
    
    console.log("User found in database:", user.id);
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(401).json({ error: "token validation failed" });
  }
};

export { authenticateUser };
