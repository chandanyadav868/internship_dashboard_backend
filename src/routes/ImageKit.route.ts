import { ImageKitAuthentication } from "@/controllers/ImageKit.controller";
import { authentication } from "@/middleware/middleware";
import { Router } from "express";

const router = Router();

router.route("/authentication").get(authentication, ImageKitAuthentication)

export default router