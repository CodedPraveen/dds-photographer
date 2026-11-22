import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function getR2Config(env = process.env) {
    const endpoint = env.R2_ACCOUNT_ENDPOINT;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
    const bucket = env.R2_BUCKET_NAME;
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
        throw new Error("R2_ACCOUNT_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME are required.");
    }
    let parsedEndpoint;
    try { parsedEndpoint = new URL(endpoint); } catch { throw new Error("R2_ACCOUNT_ENDPOINT must be a valid HTTPS URL."); }
    if (parsedEndpoint.protocol !== "https:") throw new Error("R2_ACCOUNT_ENDPOINT must use HTTPS.");
    return { endpoint: parsedEndpoint.toString().replace(/\/$/, ""), accessKeyId, secretAccessKey, bucket };
}

export function buildVersionedObjectKey({ galleryId, photoId, versionId, derivative }) {
    for (const [name, value] of Object.entries({ galleryId, photoId, versionId })) {
        if (typeof value !== "string" || !value || value.includes("/")) throw new Error(`Invalid ${name} for R2 object key.`);
    }
    if (derivative !== undefined && (typeof derivative !== "string" || !/^[a-zA-Z0-9_-]+$/.test(derivative))) throw new Error("Invalid derivative for R2 object key.");
    return `galleries/${galleryId}/${photoId}/versions/${versionId}/${derivative ? `${derivative}.bin` : "original.jpg"}`;
}

function createDefaultClient(config) {
    return new S3Client({ region: "auto", endpoint: config.endpoint, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } });
}

export function createR2Storage({ client, config = getR2Config() } = {}) {
    const r2Client = client || createDefaultClient(config);
    return {
        async uploadFile({ key, body, contentType, metadata }) {
            await r2Client.send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: body, ContentType: contentType, Metadata: metadata }));
            return { key, provider: "R2" };
        },
        async objectExists(key) {
            try { await r2Client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key })); return true; }
            catch (error) { if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound") return false; throw error; }
        },
        async getMetadata(key) {
            const response = await r2Client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
            return { key, sizeBytes: response.ContentLength ?? null, contentType: response.ContentType ?? null, etag: response.ETag ?? null, metadata: response.Metadata ?? {} };
        },
        async deleteFile(key) { await r2Client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key })); },
        async downloadFile(key) {
            const response = await r2Client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
            if (!response.Body) throw new Error("R2 returned an empty file.");
            return response.Body.transformToWebStream();
        },
    };
}

let storage;
function getStorage() { return (storage ||= createR2Storage()); }
export const uploadFile = (options) => getStorage().uploadFile(options);
export const objectExists = (key) => getStorage().objectExists(key);
export const getMetadata = (key) => getStorage().getMetadata(key);
export const deleteFile = (key) => getStorage().deleteFile(key);
export const downloadFile = (key) => getStorage().downloadFile(key);
