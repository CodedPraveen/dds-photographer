
import "server-only";

import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";

let r2Client;

function getR2Client() {
    if (r2Client) return r2Client;

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error("Cloudflare R2 environment variables are missing.");
    }

    r2Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    return r2Client;
}

function getBucket() {
    const bucket = process.env.R2_BUCKET_NAME;

    if (!bucket) {
        throw new Error("R2_BUCKET_NAME is missing.");
    }

    return bucket;
}

export async function uploadFile({ key, body, contentType }) {
    await getR2Client().send(
        new PutObjectCommand({
            Bucket: getBucket(),
            Key: key,
            Body: body,
            ContentType: contentType,
        }),
    );

    return {
        key,
        provider: "R2",
    };
}

export async function deleteFile(key) {
    await getR2Client().send(
        new DeleteObjectCommand({
            Bucket: getBucket(),
            Key: key,
        }),
    );
}

export async function downloadFile(key) {
    const response = await getR2Client().send(
        new GetObjectCommand({
            Bucket: getBucket(),
            Key: key,
        }),
    );

    return response.Body;
}
