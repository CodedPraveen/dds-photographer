"use server";

import { redirect } from "next/navigation";

import { validateGalleryEntry } from "../validation.mjs";
import { grantGalleryAccess, resolveGalleryToken } from "./gallery-access";
import { upsertGalleryVisitor } from "./gallery-repository";

export async function submitGalleryEntry(token, _previousState, formData) {
  const validation = validateGalleryEntry(formData);

  if (!validation.success) {
    return {
      status: "validation-error",
      fieldErrors: validation.fieldErrors,
      values: {
        name: validation.data.name,
        mobile: validation.data.mobile,
        email: validation.data.email,
      },
    };
  }

  let gallery;
  let visitor;

  try {
    gallery = await resolveGalleryToken(token);
    if (!gallery) {
      return {
        status: "invalid-gallery",
        formError:
          "This private gallery link is invalid or no longer available.",
        fieldErrors: {},
        values: validation.data,
      };
    }

    visitor = await upsertGalleryVisitor(gallery.id, validation.data);
    await grantGalleryAccess(gallery.id, visitor.id);
  } catch {
    return {
      status: "server-error",
      formError: "We could not open the gallery. Please try again.",
      fieldErrors: {},
      values: validation.data,
    };
  }

  redirect(`/gallery/${encodeURIComponent(token)}`);
}
