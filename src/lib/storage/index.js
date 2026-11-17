
import "server-only";

import { getStorageProvider } from "./storage-config";

export async function uploadFile(options) {
    const provider = getStorageProvider();

    if (provider === "supabase") {
        const storage = await import("./providers/supabase");
        return storage.uploadFile(options);
    }

    if (provider === "r2") {
        const storage = await import("./providers/cloudflare-r2");
        return storage.uploadFile(options);
    }

    throw new Error(`Unsupported storage provider: ${provider}`);
}

export async function deleteFile(key) {
    const provider = getStorageProvider();

    if (provider === "supabase") {
        const storage = await import("./providers/supabase");
        return storage.deleteFile(key);
    }

    if (provider === "r2") {
        const storage = await import("./providers/cloudflare-r2");
        return storage.deleteFile(key);
    }

    throw new Error(`Unsupported storage provider: ${provider}`);
}

export async function downloadFile(key) {
    const provider = getStorageProvider();

    if (provider === "supabase") {
        const storage = await import("./providers/supabase");
        return storage.downloadFile(key);
    }

    if (provider === "r2") {
        const storage = await import("./providers/cloudflare-r2");
        return storage.downloadFile(key);
    }

    throw new Error(`Unsupported storage provider: ${provider}`);
}

