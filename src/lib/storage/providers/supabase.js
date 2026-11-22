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

export async function uploadFile({ key, body, contentType }) {
  const { data, error } = await getSupabaseClient()
    .storage.from(getBucket())
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
    .storage.from(getBucket())
    .remove([key]);

  if (error) throw error;
}

export async function downloadFile(key) {
  const { data, error } = await getSupabaseClient()
    .storage.from(getBucket())
    .download(key);

  if (error) throw error;

  return data;
}

export async function objectExists(key) {
  return (await findObject(key)) !== null;
}

export async function getMetadata(key) {
  const object = await findObject(key);
  if (!object) throw createNotFoundError(key);
  return {
    key,
    sizeBytes: object.metadata?.size ?? null,
    contentType:
      object.metadata?.mimetype ?? object.metadata?.contentType ?? null,
    etag: object.metadata?.etag ?? null,
    metadata: object.metadata ?? {},
  };
}

async function findObject(key) {
  const separator = key.lastIndexOf("/");
  const folder = separator === -1 ? "" : key.slice(0, separator);
  const filename = key.slice(separator + 1);
  const { data, error } = await getSupabaseClient()
    .storage.from(getBucket())
    .list(folder, { search: filename, limit: 100 });
  if (error) {
    if (
      error.status === 404 ||
      error.statusCode === 404 ||
      error.code === "NoSuchKey"
    )
      return null;
    throw error;
  }
  return data?.find((entry) => entry.name === filename) ?? null;
}

function createNotFoundError(key) {
  const error = new Error(`Supabase object not found: ${key}`);
  error.status = 404;
  return error;
}
