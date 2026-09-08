import crypto from "node:crypto";
export function generateImageKey({ mimeType, folderName, }) {
    const extensionMap = {
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
//# sourceMappingURL=image.utility.js.map