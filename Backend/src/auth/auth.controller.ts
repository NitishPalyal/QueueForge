import type { Request, Response } from "express";
import * as userRepo from "./auth.repository.ts";
import jwt from "jsonwebtoken";
import type { Prisma, User } from "../../generated/prisma/client.ts";
import type { APIResponse } from "../shared/types.ts";
import { logger } from "../shared/logger.ts";
import type {
  LoginControllerBody,
  RegisterControllerBody,
} from "./auth.types.ts";
import { comparePasswordService, hashPasswordService } from "./auth.service.ts";

async function sendTokenResponse(
  user: User,
  res: Response<APIResponse>,
  message: string,
) {
  try {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.cookie("token", token);

    res.status(200).json({
      message,
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
        },
      },
    });
  } catch (error) {
    logger.error("Error in sendTokenResponse", "auth.controller", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
}

export async function registerController(
  req: Request<{}, {}, RegisterControllerBody, {}>,
  res: Response<APIResponse>,
) {
  const { email, fullname, password } = req.body;

  try {
    const existingUser = await userRepo.findByEmailAndFullname(email, fullname);

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or name already exists.",
        success: false,
      });
    }
    const hashedPassword: string = await hashPasswordService(password);
    const userPayload: Prisma.UserCreateInput = {
      email,
      password: hashedPassword,
      fullname,
    };
    const user = await userRepo.createUser(userPayload);

    await sendTokenResponse(user, res, "User registered successfully.");
  } catch (error) {
    logger.error("Error in registerController", "auth.controller", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
}

export async function loginController(
  req: Request<{}, {}, LoginControllerBody, {}>,
  res: Response<APIResponse>,
) {
  try {
    const { email, password } = req.body;

    const user = await userRepo.findByEmail(email);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid email or password.", success: false });
    }

    const isMatch = await comparePasswordService({
      password,
      hashedPassword: user.password,
    });

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid email or password.", success: false });
    }

    await sendTokenResponse(user, res, "User logged in successfully.");
  } catch (error) {
    logger.error("Error in loginController", "auth.controller", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
}

export async function getMeController(
  req: Request<{}, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const user = req.user;

    res.status(200).json({
      message: "User fecthed successfully",
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
        },
      },
    });
  } catch (error) {
    logger.error("Error in getMeController", "auth.controller", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
}

export async function deleteUserController(
  req: Request<{}, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const user = req.user;

    await userRepo.deleteUser(user.id);

    res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    logger.error("Error in deleteUserController", "auth.controller", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
}
