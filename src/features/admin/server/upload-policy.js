export const MAX_ORIGINAL_SIZE = 50 * 1024 * 1024;
export const UPLOAD_URL_TTL_SECONDS = 15 * 60;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function validFilename(filename) {
    return typeof filename === "string" && filename.trim().length > 0 && filename.length <= 255;
}

export function validateUploadFileInput(file) {
    if (!validFilename(file?.filename) || file?.mimeType !== "image/jpeg" || !Number.isInteger(file?.sizeBytes) || file.sizeBytes < 1 || file.sizeBytes > MAX_ORIGINAL_SIZE) {
        return "Only JPEG files from 1 byte through 50 MB are accepted.";
    }
    if (file.uploadMode && file.uploadMode !== "SINGLE") return "Multipart uploads are not available yet.";
    return null;
}
