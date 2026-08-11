"use client";

import Link from "next/link";

import styles from "./state.module.css";

export default function GalleryError({ reset }) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Private gallery</p>
        <h1>We could not open this gallery.</h1>
        <p>
          Your private details have not been shown. Please try again, or return
          to the main site.
        </p>
        <div className={styles.actions}>
          <button className={styles.button} onClick={reset} type="button">
            Try again
          </button>
          <Link className={styles.link} href="/">
            Return to DDS Photographer
          </Link>
        </div>
      </div>
    </main>
  );
}
