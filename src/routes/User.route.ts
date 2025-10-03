import { Router } from "express";
import { getUser, loginController, logoutController, registerController, userDeleteController, userUpdateController } from "@/controllers/User.controller"
import { authentication } from "@/middleware/middleware";

// Router is initialised and put its property and methods on router variable
const router = Router();

router.route("/login").post(loginController);
router.route("/register").post(registerController);
router.route("/find").get(authentication,getUser);
router.route("/logout").get(authentication,logoutController);
router.route("/update").put(authentication,userUpdateController);
router.route("/delete").delete(authentication,userDeleteController);

export default router