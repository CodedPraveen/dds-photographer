
import "server-only";

import { createClient } from "@supabase/supabase-js";

let supabaseClient;

function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;

    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !secretKey) {
        throw new Error("Supabase Storage environment variables are missing.");
    }

    supabaseClient = createClient(url, secretKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return supabaseClient;
}

function getBucket() {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;

    if (!bucket) {
        throw new Error("SUPABASE_STORAGE_BUCKET is missing.");
    }

    return bucket;
}

export async function uploadFile({
    key,
    body,
    contentType,
}) {
    const { data, error } = await getSupabaseClient()
        .storage
        .from(getBucket())
        .upload(key, body, {
            contentType,
            upsert: false,
        });

    if (error) throw error;

    return {
        key: data.path,
        provider: "SUPABASE",
    };
}

export async function deleteFile(key) {
    const { error } = await getSupabaseClient()
        .storage
        .from(getBucket())
        .remove([key]);

    if (error) throw error;
}

export async function downloadFile(key) {
    const { data, error } = await getSupabaseClient()
        .storage
        .from(getBucket())
        .download(key);

    if (error) throw error;

    return data;
}
