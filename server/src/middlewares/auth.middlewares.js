import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/user.models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET_PATH = path.join(__dirname, "../jwt_secret.txt");
const JWT_SECRET = fs.existsSync(JWT_SECRET_PATH)
  ? fs.readFileSync(JWT_SECRET_PATH, "utf8").trim()
  : "default_jwt_secret_for_development";

const authenticateUser = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized access" });
  }
  
  token = token.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists in database
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }
    
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
