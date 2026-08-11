import assert from "node:assert/strict";
import test from "node:test";

import { upsertVisitorRecord } from "../src/features/private-gallery/server/local-gallery-records.mjs";
import {
  createSignedToken,
  readSignedToken,
} from "../src/features/private-gallery/server/secure-token.mjs";
import { validateGalleryEntry } from "../src/features/private-gallery/validation.mjs";

function createEntry(overrides = {}) {
  const formData = new FormData();
  const values = {
    name: "  Ada Lovelace  ",
    mobile: "+91 98765 43210",
    email: "  ADA@EXAMPLE.COM  ",
    consent: "on",
    ...overrides,
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value !== null) {
      formData.set(key, value);
    }
  });
  return formData;
}

test("valid gallery entry is trimmed and email-normalized", () => {
  const result = validateGalleryEntry(createEntry());

  assert.equal(result.success, true);
  assert.deepEqual(result.fieldErrors, {});
  assert.equal(result.data.name, "Ada Lovelace");
  assert.equal(result.data.mobile, "+91 98765 43210");
  assert.equal(result.data.email, "ada@example.com");
  assert.equal(result.data.consent, true);
});

test("gallery entry rejects every missing or malformed required value", () => {
  const result = validateGalleryEntry(
    createEntry({
      name: " ",
      mobile: "123",
      email: "not-an-email",
      consent: null,
    }),
  );

  assert.equal(result.success, false);
  assert.deepEqual(Object.keys(result.fieldErrors).sort(), [
    "consent",
    "email",
    "mobile",
    "name",
  ]);
});

test("signed tokens reject tampering", () => {
  const secret = "a-secure-test-secret-with-at-least-32-characters";
  const token = createSignedToken(
    { type: "gallery-link", galleryId: "gallery-a", expiresAt: 42 },
    secret,
  );
  const [payload, signature] = token.split(".");
  const tamperedPayload = Buffer.from(
    JSON.stringify({
      type: "gallery-link",
      galleryId: "gallery-b",
      expiresAt: 42,
    }),
  ).toString("base64url");

  assert.equal(readSignedToken(token, secret).galleryId, "gallery-a");
  assert.equal(
    readSignedToken(`${tamperedPayload}.${signature}`, secret),
    null,
  );
  assert.equal(readSignedToken(`${payload}.${signature}x`, secret), null);
});

test("same gallery and normalized email updates one visitor record", () => {
  const database = { visitors: [] };
  const initial = upsertVisitorRecord(
    database,
    "gallery-a",
    {
      name: "First name",
      mobile: "+91 98765 43210",
      email: "visitor@example.test",
      consent: true,
    },
    { id: "visitor-a", timestamp: "2026-08-11T10:00:00.000Z" },
  );
  const updated = upsertVisitorRecord(
    database,
    "gallery-a",
    {
      name: "Updated name",
      mobile: "+91 90000 00000",
      email: "visitor@example.test",
      consent: true,
    },
    { id: "visitor-b", timestamp: "2026-08-11T11:00:00.000Z" },
  );

  assert.equal(database.visitors.length, 1);
  assert.equal(updated.id, initial.id);
  assert.equal(updated.name, "Updated name");
  assert.equal(updated.createdAt, "2026-08-11T10:00:00.000Z");
  assert.equal(updated.updatedAt, "2026-08-11T11:00:00.000Z");
});

test("the same email remains isolated across galleries", () => {
  const database = { visitors: [] };
  const visitorData = {
    name: "Gallery visitor",
    mobile: "+91 98765 43210",
    email: "visitor@example.test",
    consent: true,
  };

  upsertVisitorRecord(database, "gallery-a", visitorData, {
    id: "visitor-a",
    timestamp: "2026-08-11T10:00:00.000Z",
  });
  upsertVisitorRecord(database, "gallery-b", visitorData, {
    id: "visitor-b",
    timestamp: "2026-08-11T10:00:00.000Z",
  });

  assert.equal(database.visitors.length, 2);
  assert.deepEqual(
    database.visitors.map((visitor) => visitor.galleryId).sort(),
    ["gallery-a", "gallery-b"],
  );
});
