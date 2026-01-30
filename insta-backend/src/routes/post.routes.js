import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createPost } from "../controllers/post.controller.js";

const router=express.Router();

router.post("/", authMiddleware, createPost);

export default router;
