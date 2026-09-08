import express from "express";
import { userAuthValidator } from "./auth.middleware.js";
import { deleteUserController, getMeController, loginController, logoutController, registerController, } from "./auth.controller.js";
import { loginValidator, registerValidator } from "./auth.validator.js";
import { getMeRateLimiter, loginRateLimiter } from "./auth.rateLimiters.js";
const authRouter = express.Router();
authRouter.post("/register", registerValidator, registerController);
authRouter.post("/login", loginRateLimiter, loginValidator, loginController);
authRouter.post("/logout", userAuthValidator, logoutController);
authRouter.get("/get-me", getMeRateLimiter, userAuthValidator, getMeController);
authRouter.delete("/deleteUser", userAuthValidator, deleteUserController);
export default authRouter;
//# sourceMappingURL=auth.routes.js.map