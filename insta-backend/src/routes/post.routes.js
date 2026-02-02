import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createPost } from "../controllers/post.controller.js";
import { likePost,unlikePost,getPostLikes } from "../controllers/likes.controller.js";
import { getPostComments,addComment,deleteComment } from "../controllers/comments.controller.js";

const router=express.Router();

router.post("/", authMiddleware, createPost);
router.post("/:id/like",authMiddleware,likePost);
router.delete("/:id/like",authMiddleware,unlikePost);
router.get("/:id/likes",authMiddleware,getPostLikes);
router.post("/:id/comments",authMiddleware,addComment);
router.get("/:id/comments",getPostComments);
router.delete("/comments/:commentId",authMiddleware,deleteComment);

export default router;
