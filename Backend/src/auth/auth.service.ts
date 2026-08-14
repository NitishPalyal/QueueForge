import argon2 from "argon2";
import * as userRepo from "./auth.repository.ts";
import { logger } from "../shared/logger.ts";
import type {
  ComparePasswordServiceParam,
  findUserByEmailAndFullnameServiceParam,
} from "./auth.types.ts";

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
