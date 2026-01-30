import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { followUser,unfollowUser } from "../controllers/follow.controller.js";

const router=express.Router();

router.post("/:id/follow", authMiddleware, followUser);
router.delete("/:id/follow", authMiddleware, unfollowUser);

export default router;