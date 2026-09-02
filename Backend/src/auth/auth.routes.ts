import express from "express";
import { userAuthValidator } from "./auth.middleware.ts";
import {
  deleteUserController,
  getMeController,
  loginController,
  logoutController,
  registerController,
} from "./auth.controller.ts";
import { loginValidator, registerValidator } from "./auth.validator.ts";
import { getMeRateLimiter, loginRateLimiter } from "./auth.rateLimiters.ts";

const authRouter = express.Router();

authRouter.post("/register", registerValidator, registerController);
authRouter.post("/login", loginRateLimiter, loginValidator, loginController);
authRouter.post("/logout", userAuthValidator, logoutController);
authRouter.get("/get-me", getMeRateLimiter, userAuthValidator, getMeController);
authRouter.delete("/deleteUser", userAuthValidator, deleteUserController);

export default authRouter;
