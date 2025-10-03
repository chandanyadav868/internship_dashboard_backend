import { createPost, deletePost } from "@/controllers/Post.controller";
import { authentication } from "@/middleware/middleware";
import { Router } from "express";

const router = Router();

router.route("/create").post(authentication, createPost)
router.route("/delete/:postId").delete(authentication, deletePost)

export default router