import "server-only";

export function getStorageProvider() {
    const provider =
        process.env.STORAGE_PROVIDER ||
        (process.env.NODE_ENV === "production" ? "r2" : "supabase");

    if (!["supabase", "r2"].includes(provider)) {
        throw new Error(`Unsupported storage provider: ${provider}`);
    }

    return provider;
}