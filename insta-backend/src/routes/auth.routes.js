import express from "express";
import { signUp,login, logout, refresh } from  '../controllers/auth.controllers.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimit.middleware.js";
const router = express.Router();

router.post("/signup",signUp);
//put the rate ,limiting middleware on login and refresh token routes
router.post("/login",rateLimit({keyPrefix:"login",limit:5,windowSeconds:10*60}), login);
router.post("/logout",authMiddleware,logout);
router.post("/refresh",rateLimit({keyPrefix:"refresh",limit:10,windowSeconds:10*60}), refresh);

export default router;