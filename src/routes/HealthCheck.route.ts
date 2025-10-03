import { healthCheckUp } from "@/controllers/Health.controller";
import { Router } from "express";

const router = Router();

router.route("/").get(healthCheckUp)

export default router
