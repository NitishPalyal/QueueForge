import type { NextFunction, Request, Response } from "express";
import {
  body,
  check,
  header,
  param,
  validationResult,
} from "express-validator";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const createEmailJobValidator = [
  body("to")
    .notEmpty()
    .withMessage("Recipient email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("prompt")
    .notEmpty()
    .withMessage("Prompt is required")
    .isLength({ min: 10 })
    .withMessage("Prompt must be at least 10 characters long"),

  body("idempotency_key")
    .notEmpty()
    .withMessage("Idempotency key is required")
    .isLength({ min: 10 })
    .withMessage("Idempotency key must be at least 10 characters long"),
  validate,
];

export const createAiResponseJobValidator = [
  body("prompt")
    .notEmpty()
    .withMessage("Prompt is required")
    .isLength({ min: 10 })
    .withMessage("Prompt must be at least 10 characters long"),

  body("idempotency_key")
    .notEmpty()
    .withMessage("Idempotency key is required")
    .isLength({ min: 10 })
    .withMessage("Idempotency key must be at least 10 characters long"),
  validate,
];

export const createImageProcessingJobValidator = [
  header("idempotency_key")
    .notEmpty()
    .withMessage("Idempotency key is required")
    .isLength({ min: 10 })
    .withMessage("Idempotency key must be at least 10 characters long"),

  check("image").custom((_, { req }) => {
    if (!req.file) {
      throw new Error("Please upload an image file");
    }

    const MAX_SIZE_MB = 10;
    const maxSizeBytes = MAX_SIZE_MB * 1024 * 1024;

    if (req.file.size > maxSizeBytes) {
      throw new Error(`Image file size exceeds the ${MAX_SIZE_MB}MB limit`);
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error(
        "Invalid file format. Only JPEG, JPG, PNG, and WEBP are allowed",
      );
    }

    return true;
  }),

  validate,
];

export const getJobByIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Job ID is required")
    .isUUID()
    .withMessage("Job ID must be a valid UUID"),
  validate,
];

export const deleteJobByQueueAndIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Job ID is required")
    .isUUID()
    .withMessage("Job ID must be a valid UUID"),

  param("queue")
    .notEmpty()
    .withMessage("Queue name is required")
    .isIn(["mailQueue", "aiQueue", "imageQueue"])
    .withMessage("Queue name must be one of: mailQueue, aiQueue, imageQueue"),
  validate,
];

export const getJobStatusByIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Job ID is required")
    .isUUID()
    .withMessage("Job ID must be a valid UUID"),
  validate,
];

export const getAllJobsByStatusValidator = [
  param("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "completed", "failed"])
    .withMessage("Status must be one of: pending, completed, failed"),
  validate,
];

export const getAllJobsByQueueValidator = [
  param("queue")
    .notEmpty()
    .withMessage("Queue name is required")
    .isIn(["mailQueue", "aiQueue", "imageQueue"])
    .withMessage("Queue name must be one of: mailQueue, aiQueue, imageQueue"),
  validate,
];

export const getAllJobsByQueueAndStatusValidator = [
  param("queue")
    .notEmpty()
    .withMessage("Queue name is required")
    .isIn(["mailQueue", "aiQueue", "imageQueue"])
    .withMessage("Queue name must be one of: mailQueue, aiQueue, imageQueue"),

  param("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "completed", "failed"])
    .withMessage("Status must be one of: pending, completed, failed"),

  validate,
];
