import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getFeed } from "../controllers/feed.controller.js";

const router=express.Router();

router.get("/", authMiddleware, getFeed);

export default router;