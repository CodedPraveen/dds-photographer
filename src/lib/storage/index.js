
import "server-only";

import { getStorageProvider } from "./storage-config.js";

export async function getMultipartStorage() {
    return (await getAdapter("r2")).multipartStorage();
}

async function getAdapter(provider) {
    const selectedProvider = (provider || getStorageProvider()).toLowerCase();

    if (selectedProvider === "supabase") {
        return import("./providers/supabase.js");
    }

    if (selectedProvider === "r2") {
        return import("./providers/cloudflare-r2.js");
    }

    throw new Error(`Unsupported storage provider: ${selectedProvider}`);
}

export async function uploadFile(options) {
    const provider = getStorageProvider();
    const storage = await getAdapter(provider);

    return storage.uploadFile(options);
}

export async function deleteFile(key, provider) {
    const storage = await getAdapter(provider);

    return storage.deleteFile(key);
}

export async function objectExists(key, provider) {
    const storage = await getAdapter(provider || getStorageProvider());
    return storage.objectExists(key);
}

export async function getMetadata(key, provider) {
    const storage = await getAdapter(provider || getStorageProvider());
    return storage.getMetadata(key);
}

export async function downloadFile(key, provider) {
    const storage = await getAdapter(provider);

    return storage.downloadFile(key);
}

export async function createUploadUrl(options) {
    const storage = await getAdapter("r2");
    if (typeof storage.createUploadUrl !== "function") {
        throw new Error("The selected R2 adapter cannot create upload URLs.");
    }
    return storage.createUploadUrl(options);
}
