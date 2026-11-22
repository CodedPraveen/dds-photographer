import assert from "node:assert/strict";
import test from "node:test";

import {
  cleanupExpiredMultipart,
  operateMultipart,
} from "../src/features/admin/server/multipart-upload.js";
import { MULTIPART_PART_SIZE as partSize } from "../src/features/admin/server/upload-policy.js";

function fixture() {
  const session = {
    id: "session",
    adminId: "owner",
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 60_000),
  };
  const file = {
    uploadSession: session,
    uploadMode: "MULTIPART",
    status: "PENDING",
    sizeBytes: partSize * 2 + 7,
    r2ObjectKey: "key",
  };
  const calls = { starts: 0, finishes: 0, aborts: 0, signs: [] };
  let finalized = false;
  const parts = [
    { PartNumber: 1, Size: partSize, ETag: "first" },
    { PartNumber: 2, Size: partSize, ETag: "second" },
    { PartNumber: 3, Size: 7, ETag: "last" },
  ];
  const storage = {
    startMultipart: async () => {
      calls.starts++;
      return "r2-id";
    },
    signPart: async (input) => {
      calls.signs.push(input);
      return "signed";
    },
    listParts: async () => parts,
    finishMultipart: async (_key, _id, manifest) => {
      assert.deepEqual(
        manifest,
        parts.map(({ PartNumber, ETag }) => ({ PartNumber, ETag })),
      );
      calls.finishes++;
      finalized = true;
    },
    objectExists: async () => finalized,
    abortMultipart: async () => {
      calls.aborts++;
    },
  };
  const tx = {
    $executeRaw: async () => {},
    uploadFile: {
      findUnique: async () => file,
      findMany: async () => [{ id: "file" }],
      findFirst: async () =>
        file.multipartUploadId && file.status === "UPLOADING" ? file : null,
      update: async ({ data }) => Object.assign(file, data),
      updateMany: async ({ data }) => Object.assign(file, data),
    },
    uploadSession: { updateMany: async () => ({ count: 1 }) },
  };
  let tail = Promise.resolve();
  const db = {
    ...tx,
    $transaction(callback) {
      const run = tail.then(() => callback(tx));
      tail = run.catch(() => {});
      return run;
    },
  };
  const deps = {
    db,
    getStorage: async () => storage,
    getCurrentAdmin: async () => ({ id: "owner" }),
    verify: async ({ multipart }) => ({
      success: multipart,
      media: { id: "media" },
    }),
  };
  return {
    file,
    session,
    calls,
    parts,
    storage,
    db,
    deps,
    run: (action, partNumber) =>
      operateMultipart(
        { sessionId: "session", fileId: "file", action, partNumber },
        deps,
      ),
  };
}

test("multipart uses authoritative parts, supports independent retries and completes only once", async () => {
  const f = fixture();
  await Promise.all([f.run("start"), f.run("start")]);
  assert.equal(f.calls.starts, 1);
  await f.run("part", 3);
  await f.run("part", 3);
  assert.deepEqual(
    f.calls.signs.map(({ partNumber, size }) => [partNumber, size]),
    [
      [3, 7],
      [3, 7],
    ],
  );
  assert.equal((await f.run("part", 4)).status, 400);
  const last = f.parts.pop();
  assert.equal((await f.run("complete")).status, 409);
  f.parts.push(last);
  const results = await Promise.all([f.run("complete"), f.run("complete")]);
  assert.deepEqual(results[0], results[1]);
  assert.equal(f.calls.finishes, 1);
  assert.equal((await f.run("abort")).status, 409);
});

test("multipart rejects non-owners and expired sessions before contacting R2", async () => {
  const f = fixture();
  f.deps.getCurrentAdmin = async () => ({ id: "other" });
  assert.equal((await f.run("start")).status, 404);
  f.deps.getCurrentAdmin = async () => ({ id: "owner" });
  f.session.expiresAt = new Date(0);
  assert.equal((await f.run("start")).status, 409);
  assert.equal(f.calls.starts, 0);
});

test("duplicate aborts are idempotent and expired cleanup retries failures", async () => {
  const f = fixture();
  await f.run("start");
  await Promise.all([f.run("abort"), f.run("abort")]);
  assert.equal(f.calls.aborts, 1);
  const expired = fixture();
  await expired.run("start");
  expired.session.expiresAt = new Date(0);
  const abort = expired.storage.abortMultipart;
  expired.storage.abortMultipart = async () => {
    throw new Error("unavailable");
  };
  assert.deepEqual(await cleanupExpiredMultipart(expired.db, expired.storage), {
    aborted: 0,
    failed: 1,
  });
  assert.equal(expired.file.partMetadata.state, "cleanup_retry_required");
  expired.storage.abortMultipart = abort;
  assert.deepEqual(await cleanupExpiredMultipart(expired.db, expired.storage), {
    aborted: 1,
    failed: 0,
  });
  assert.deepEqual(await cleanupExpiredMultipart(expired.db, expired.storage), {
    aborted: 0,
    failed: 0,
  });
});

test("start compensates when the upload ID cannot be persisted", async () => {
  const f = fixture();
  f.db.uploadFile.update = async () => {
    throw new Error("database unavailable");
  };
  await assert.rejects(f.run("start"), /database unavailable/);
  assert.equal(f.calls.starts, 1);
  assert.equal(f.calls.aborts, 1);
  assert.equal(f.file.multipartUploadId, undefined);
});

for (const action of ["complete", "abort", "cleanup"]) {
  test(`${action} recovers when R2 succeeds and the database update fails`, async () => {
    const f = fixture();
    await f.run("start");
    const update = f.db.uploadFile.update;
    f.db.uploadFile.update = async () => {
      throw new Error("database unavailable");
    };
    if (action === "cleanup") {
      f.session.expiresAt = new Date(0);
      assert.deepEqual(await cleanupExpiredMultipart(f.db, f.storage), {
        aborted: 0,
        failed: 1,
      });
      assert.equal(f.file.partMetadata.state, "cleanup_retry_required");
    } else {
      await assert.rejects(f.run(action), /database unavailable/);
    }
    assert.equal(f.file.multipartUploadId, "r2-id");
    f.db.uploadFile.update = update;
    if (action === "cleanup") {
      assert.deepEqual(await cleanupExpiredMultipart(f.db, f.storage), {
        aborted: 1,
        failed: 0,
      });
    } else {
      assert.equal((await f.run(action)).success, true);
    }
    assert.equal(
      f.file.status,
      action === "complete" ? "UPLOADED" : "CANCELLED",
    );
    assert.equal(f.calls.finishes, action === "complete" ? 1 : 0);
  });
}

test("cleanup preserves a finalized object after a lost completion response", async () => {
  const f = fixture();
  await f.run("start");
  await f.run("complete");
  f.file.status = "UPLOADING";
  f.session.expiresAt = new Date(0);
  assert.deepEqual(await cleanupExpiredMultipart(f.db, f.storage), {
    aborted: 0,
    failed: 0,
  });
  assert.equal(f.calls.aborts, 0);
});
