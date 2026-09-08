export const SUPPORTED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];
export function isMimeType(value) {
    return SUPPORTED_MIME_TYPES.includes(value);
}
export const FolderName = {
    uploaded: "uploaded",
    processed: "processed",
};
//# sourceMappingURL=image.types.js.map