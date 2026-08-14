import type { NextFunction, Request, Response } from "express";
import * as userRepo from "./auth.repository.ts";
import jwt from "jsonwebtoken";
import type { JwtPayloadWithId } from "./auth.types.ts";

/**
 * Validates the authenticated session for protected routes.
 *
 * This guard is shared across all user-protected endpoints and is intended to
 * behave as the standard userAuthValidator for the application.
 */
export const authenticateUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JwtPayloadWithId;

    if (typeof decoded === "string" || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userRepo.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * Shared auth guard used across protected routes.
 *
 * This alias keeps the auth middleware name consistent with the rest of the
 * validation naming pattern used in the project.
 */
export const userAuthValidator = authenticateUserMiddleware;
