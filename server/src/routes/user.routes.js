import express from "express";
import { 
  getUsers, 
  getUserById, 
  registerUser, 
  loginUser, 
  updateUser, 
  deleteUser, 
  logoutUser 
} from "../controllers/user.controller.js";

import { authenticateUser } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/user", getUsers);
router.get("/user/:userId", getUserById);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/logout', logoutUser);

router.put("/user/:userId", authenticateUser, updateUser);
router.delete("/user/:userId", authenticateUser, deleteUser);

export default router;
