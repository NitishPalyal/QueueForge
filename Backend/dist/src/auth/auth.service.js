import argon2 from "argon2";
import * as userRepo from "./auth.repository.js";
import { logger } from "../shared/logger.js";
import { Prisma } from "../../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import configKeys from "../config/config.keys.js";
export async function sendTokenResponse(user, res, message) {
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
    }
    catch (error) {
        logger.error("Error in sendTokenResponse", "auth.controller", error);
        return res
            .status(500)
            .json({ message: "Internal server error", success: false });
    }
}
export async function hashPasswordService(password) {
    try {
        return argon2.hash(password);
    }
    catch (error) {
        logger.error("Error in hashPasswordService", "auth.service", error);
        throw error;
    }
}
export async function comparePasswordService({ password, hashedPassword, }) {
    try {
        return argon2.verify(hashedPassword, password);
    }
    catch (error) {
        logger.error("Error in comparePasswordService", "auth.service", error);
        throw error;
    }
}
export async function findUserByEmailAndFullnameService({ email, fullname, }) {
    try {
        const isExist = await userRepo.findByEmailAndFullname(email, fullname);
        return Boolean(isExist);
    }
    catch (error) {
        logger.error("Error in findUserByEmailAndFullnameService", "auth.service", error);
        throw error;
    }
}
export async function createUserService({ fullname, email, password, }) {
    try {
        const payload = {
            email,
            password,
            fullname,
        };
        const user = await userRepo.createUser(payload);
        return user;
    }
    catch (error) {
        logger.error("Error in createUserService", "auth.service", error);
        throw error;
    }
}
export async function getUserByEmail(email) {
    try {
        const user = await userRepo.findByEmail(email);
        if (user) {
            return user;
        }
        else {
            return null;
        }
    }
    catch (error) {
        logger.error("Error in getUserByEmail", "auth.service", error);
        throw error;
    }
}
export async function deleteUserById(id) {
    try {
        await userRepo.deleteUser(id);
    }
    catch (error) {
        logger.error("Error in deleteUserById", "auth.service", error);
        throw error;
    }
}
//# sourceMappingURL=auth.service.js.map