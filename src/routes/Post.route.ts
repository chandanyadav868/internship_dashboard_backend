import { createPost, deletePost, getPosts, LikesDislikePost, updatePost } from "@/controllers/Post.controller";
import { authentication } from "@/middleware/middleware";
import { Router } from "express";

const router = Router();

router.route("/create").post(authentication, createPost)
router.route("/all").get(authentication, getPosts)
router.route("/update/:postId").post(authentication, updatePost)
router.route("/like-dislikes/:postId").post(authentication, LikesDislikePost)
router.route("/delete/:postId").delete(authentication, deletePost)

export default router