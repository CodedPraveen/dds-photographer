import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { audit, getCurrentAdmin } from "@/features/admin/server/auth";
import { prisma } from "@/features/admin/server/prisma";
import { deleteFile, uploadFile } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function detectImageType(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  )
    return "image/jpeg";

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";

  if (
    buffer.length >= 6 &&
    ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6))
  )
    return "image/gif";

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 4, 8) === "ftyp" &&
    ["avif", "avis"].includes(buffer.toString("ascii", 8, 12))
  )
    return "image/avif";

  return null;
}

export async function POST(request, { params }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Reject cross-origin browser submissions.
  const origin = request.headers.get("origin");

  if (origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const { id: galleryId } = await params;

  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: { id: true },
  });

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > MAX_FILE_SIZE + 1024 * 1024) {
    return NextResponse.json(
      { error: "Upload request is too large." },
      { status: 413 },
    );
  }

  let formData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json(
      { error: "Select an image to upload." },
      { status: 400 },
    );
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image must be between 1 byte and 15 MB." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = detectImageType(buffer);

  if (!mimeType) {
    return NextResponse.json(
      { error: "Unsupported or invalid image file." },
      { status: 400 },
    );
  }

  const storageKey = `galleries/${galleryId}/${randomUUID()}`;

  let uploaded;

  try {
    uploaded = await uploadFile({
      key: storageKey,
      body: buffer,
      contentType: mimeType,
    });

    const mediaCount = await prisma.galleryMedia.count({
      where: { galleryId },
    });

    const media = await prisma.galleryMedia.create({
      data: {
        galleryId,
        storageProvider: uploaded.provider,
        storageKey: uploaded.key,
        altText: "Gallery photo",
        mimeType,
        sizeBytes: buffer.length,
        sortOrder: mediaCount,
        isCover: mediaCount === 0,
      },
    });

    await audit(admin.id, "gallery.media.upload", media.id, {
      galleryId,
      mimeType,
      sizeBytes: buffer.length,
    });

    return NextResponse.json({
      success: true,
      media: {
        id: media.id,
        altText: media.altText,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        isCover: media.isCover,
      },
    });
  } catch (error) {
    if (uploaded) {
      try {
        await deleteFile(uploaded.key, uploaded.provider);
      } catch {
        console.error("Failed to clean up uploaded gallery media.");
      }
    }

    console.error("Gallery upload failed:", error);

    return NextResponse.json(
      { error: "Photo upload failed. Please try again." },
      { status: 500 },
    );
  }
}
