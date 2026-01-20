import express from "express";
import { signUp,login, logout } from  '../controllers/auth.controllers.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout",authMiddleware,logout)

export default router;