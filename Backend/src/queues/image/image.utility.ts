import crypto from "node:crypto";
import type { generateImageKeyParam } from "./image.types.ts";

export function generateImageKey({
  mimeType,
  folderName,
}: generateImageKeyParam): string {
  const extensionMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

  const extension = extensionMap[mimeType];

  if (!extension) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  return `images/${folderName}/${crypto.randomUUID()}${extension}`;
}
