import express from "express";
import { userAuthValidator } from "./auth.middleware.ts";
import {
  deleteUserController,
  getMeController,
  loginController,
  registerController,
} from "./auth.controller.ts";
import { loginValidator, registerValidator } from "./auth.validator.ts";
const authRouter = express.Router();

authRouter.post("/register", registerValidator, registerController);
authRouter.post("/login", loginValidator, loginController);
authRouter.get("/get-me", userAuthValidator, getMeController);
authRouter.delete("/deleteUser", userAuthValidator, deleteUserController);

export default authRouter;
