import type { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const getBenchmarkControllerValidator = [
  param("jobType")
    .notEmpty()
    .withMessage("jobType is required")
    .isString()
    .isIn(["email", "ai", "image"])
    .withMessage("Please provide a valid jobType"),
  validate,
];
