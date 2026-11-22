"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function GalleryMediaManager({ galleryId }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setIsUploading(true);
    setError("");
    setMessage("");
    setProgress({ current: 0, total: files.length });

    let uploadedCount = 0;
    const failedFiles = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        setProgress({ current: i + 1, total: files.length });

        try {
          const response = await fetch(
            `/api/admin/galleries/${galleryId}/media`,
            {
              method: "POST",
              body: formData,
            },
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Upload failed.");
          }

          uploadedCount++;
        } catch {
          failedFiles.push(files[i].name);
        }
      }

      if (uploadedCount > 0) {
        setMessage(`${uploadedCount} photo(s) uploaded successfully.`);
        router.refresh();
      }

      if (failedFiles.length > 0) {
        setError(`Failed to upload: ${failedFiles.join(", ")}`);
      }
    } finally {
      setIsUploading(false);
      setProgress({ current: 0, total: 0 });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="admin-card">
      <h2>Gallery Photos</h2>

      <p>Select photos to upload. Maximum file size is 15 MB per photo.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple
        disabled={isUploading}
        onChange={handleUpload}
      />

      {isUploading && (
        <p>
          Uploading {progress.current} of {progress.total} photos...
        </p>
      )}

      {message && <p role="status">{message}</p>}

      {error && <p role="alert">{error}</p>}
    </section>
  );
}
