import "server-only";

import { cookies } from "next/headers";

import { findGalleryById, findVisitorById } from "./gallery-repository";
import { getGallerySigningSecret } from "./gallery-secret";
import {
  createNonce,
  createSignedToken,
  readSignedToken,
} from "./secure-token.mjs";

const ACCESS_COOKIE_NAME = "dds_gallery_access";
const ACCESS_DURATION_SECONDS = 60 * 60 * 12;
const LINK_DURATION_SECONDS = 60 * 60 * 24 * 30;

function asTimestamp(value) {
  if (!value) {
    return null;
  }
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isGalleryAvailable(gallery, now = Date.now()) {
  if (!gallery?.isActive) {
    return false;
  }
  const opensAt = asTimestamp(gallery.opensAt);
  const closesAt = asTimestamp(gallery.closesAt);
  return (!opensAt || opensAt <= now) && (!closesAt || closesAt > now);
}

export async function createGalleryLinkToken(gallery) {
  const now = Math.floor(Date.now() / 1000);
  return createSignedToken(
    {
      type: "gallery-link",
      galleryId: gallery.id,
      tokenVersion: gallery.tokenVersion,
      nonce: createNonce(),
      issuedAt: now,
      expiresAt: now + LINK_DURATION_SECONDS,
    },
    await getGallerySigningSecret(),
  );
}

export async function resolveGalleryToken(token) {
  const payload = readSignedToken(token, await getGallerySigningSecret());
  const now = Math.floor(Date.now() / 1000);

  if (
    payload?.type !== "gallery-link" ||
    typeof payload.galleryId !== "string" ||
    typeof payload.nonce !== "string" ||
    !Number.isInteger(payload.tokenVersion) ||
    !Number.isInteger(payload.expiresAt) ||
    payload.expiresAt <= now
  ) {
    return null;
  }

  const gallery = await findGalleryById(payload.galleryId);
  if (
    !isGalleryAvailable(gallery) ||
    gallery.tokenVersion !== payload.tokenVersion
  ) {
    return null;
  }

  return gallery;
}

export async function grantGalleryAccess(galleryId, visitorId) {
  const now = Math.floor(Date.now() / 1000);
  const accessToken = createSignedToken(
    {
      type: "gallery-access",
      galleryId,
      visitorId,
      nonce: createNonce(),
      issuedAt: now,
      expiresAt: now + ACCESS_DURATION_SECONDS,
    },
    await getGallerySigningSecret(),
  );
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/gallery",
    maxAge: ACCESS_DURATION_SECONDS,
  });
}

export async function getAuthorizedGalleryVisitor(galleryId) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return null;
  }

  const payload = readSignedToken(accessToken, await getGallerySigningSecret());
  const now = Math.floor(Date.now() / 1000);

  if (
    payload?.type !== "gallery-access" ||
    payload.galleryId !== galleryId ||
    typeof payload.visitorId !== "string" ||
    !Number.isInteger(payload.expiresAt) ||
    payload.expiresAt <= now
  ) {
    return null;
  }

  const visitor = await findVisitorById(payload.visitorId);
  if (!visitor || visitor.galleryId !== galleryId || visitor.consent !== true) {
    return null;
  }

  return visitor;
}
