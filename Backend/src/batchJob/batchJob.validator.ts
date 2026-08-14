import type { NextFunction, Request, Response } from "express";
import { body, check, param, validationResult } from "express-validator";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export const uploadImageValidator = [
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

export const createBatchJobValidator = [
  body("steps")
    .isArray({ min: 2, max: 3 })
    .withMessage("Steps must be an array with 2 to 3 elements")
    .custom((steps) => {
      const types = steps.map((step: any) => step.type);
      const uniqueTypes = new Set(types);
      if (uniqueTypes.size !== types.length) {
        throw new Error("Each job type can only appear once in a batch");
      }
      return true;
    }),
  validate,
];

export const deleteBatchByIdValidator = [
  param("id").isString().withMessage("Batch ID must be a string"),
  validate,
];

export const getBatchJobsByIdValidator = [
  param("id").isString().withMessage("Batch ID must be a string"),
  validate,
];
