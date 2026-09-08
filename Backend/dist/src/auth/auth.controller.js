import * as userRepo from "./auth.repository.js";
import { logger } from "../shared/logger.js";
import { comparePasswordService, createUserService, deleteUserById, findUserByEmailAndFullnameService, getUserByEmail, hashPasswordService, sendTokenResponse, } from "./auth.service.js";
export async function registerController(req, res) {
    const { email, fullname, password } = req.body;
    try {
        const existingUser = await findUserByEmailAndFullnameService({
            email,
            fullname,
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email or name already exists.",
                success: false,
            });
        }
        const hashedPassword = await hashPasswordService(password);
        const user = await createUserService({
            email,
            fullname,
            password: hashedPassword,
        });
        if (!user) {
            return res
                .status(500)
                .json({ message: "Failed to create user", success: false });
        }
        await sendTokenResponse(user, res, "User registered successfully.");
    }
    catch (error) {
        logger.error("Error in registerController", "auth.controller", error);
        return res
            .status(500)
            .json({ message: "Internal server error", success: false });
    }
}
export async function loginController(req, res) {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);
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
    }
    catch (error) {
        logger.error("Error in loginController", "auth.controller", error);
        return res
            .status(500)
            .json({ message: "Internal server error", success: false });
    }
}
export async function getMeController(req, res) {
    try {
        const user = req.user;
        res.status(200).json({
            message: "User fetched successfully",
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
        logger.error("Error in getMeController", "auth.controller", error);
        return res
            .status(500)
            .json({ message: "Internal server error", success: false });
    }
}
export async function logoutController(req, res) {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            message: "User logged out successfully.",
            success: true,
        });
    }
    catch (error) {
        logger.error("Error in logoutController", "auth.controller", error);
        return res
            .status(500)
            .json({ message: "Internal server error", success: false });
    }
}
export async function deleteUserController(req, res) {
    try {
        const user = req.user;
        await deleteUserById(user.id);
        res.status(200).json({
            message: "User deleted successfully",
            success: true,
        });
    }
    catch (error) {
        logger.error("Error in deleteUserController", "auth.controller", error);
        return res
            .status(500)
            .json({ message: "Internal server error", success: false });
    }
}
//# sourceMappingURL=auth.controller.js.map