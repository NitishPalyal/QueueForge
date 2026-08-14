import argon2 from "argon2";
import * as userRepo from "./auth.repository.ts";
import type {
  ComparePasswordServiceParam,
  findUserByEmailAndFullnameServiceParam,
} from "./auth.types.ts";

export async function hashPasswordService(password: string): Promise<string> {
  try {
    return argon2.hash(password);
  } catch (error) {
    console.error("Error in hashPasswordService.");
    console.error(error);
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
    console.error("Error in comparePasswordService.");
    console.error(error);
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
    console.error("Error in findUserByEmailAndFullnameService.");
    console.error(error);
    throw error;
  }
}
