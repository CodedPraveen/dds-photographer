import Link from "next/link";

import styles from "./state.module.css";

export default function GalleryNotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Private gallery</p>
        <h1>This gallery link is unavailable.</h1>
        <p>
          The link may be invalid, expired, or the gallery may no longer be
          open. Please use the original link or QR code supplied by the
          photographer.
        </p>
        <Link className={styles.link} href="/">
          Return to DDS Photographer
        </Link>
      </div>
    </main>
  );
}
