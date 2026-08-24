import argon2 from "argon2";
import * as userRepo from "./auth.repository.ts";
import { logger } from "../shared/logger.ts";
import { Prisma, type User } from "../../generated/prisma/client.ts";
import jwt from "jsonwebtoken";
import type {
  ComparePasswordServiceParam,
  createUserServiceParams,
  findUserByEmailAndFullnameServiceParam,
} from "./auth.types.ts";
import type { APIResponse } from "../shared/types.ts";
import type { Response } from "express";
import configKeys from "../config/config.keys.ts";

export async function sendTokenResponse(
  user: User,
  res: Response<APIResponse>,
  message: string,
) {
  try {
    const token = jwt.sign({ id: user.id }, configKeys.JWT_SECRET, {
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

export async function hashPasswordService(password: string): Promise<string> {
  try {
    return argon2.hash(password);
  } catch (error) {
    logger.error("Error in hashPasswordService", "auth.service", error);
    throw error;
  }
}

export async function comparePasswordService({
  password,
  hashedPassword,
}: ComparePasswordServiceParam): Promise<boolean> {
  try {
    return argon2.verify(hashedPassword, password);
  } catch (error) {
    logger.error("Error in comparePasswordService", "auth.service", error);
    throw error;
  }
}

export async function findUserByEmailAndFullnameService({
  email,
  fullname,
}: findUserByEmailAndFullnameServiceParam): Promise<boolean> {
  try {
    const isExist = await userRepo.findByEmailAndFullname(email, fullname);
    return Boolean(isExist);
  } catch (error) {
    logger.error(
      "Error in findUserByEmailAndFullnameService",
      "auth.service",
      error,
    );
    throw error;
  }
}

export async function createUserService({
  fullname,
  email,
  password,
}: createUserServiceParams): Promise<User> {
  try {
    const payload: Prisma.UserCreateInput = {
      email,
      password,
      fullname,
    };
    const user = await userRepo.createUser(payload);
    return user;
  } catch (error) {
    logger.error("Error in createUserService", "auth.service", error);
    throw error;
  }
}
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await userRepo.findByEmail(email);
    if (user) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    logger.error("Error in getUserByEmail", "auth.service", error);
    throw error;
  }
}

export async function deleteUserById(id: string): Promise<void> {
  try {
    await userRepo.deleteUser(id);
  } catch (error) {
    logger.error("Error in deleteUserById", "auth.service", error);
    throw error;
  }
}
