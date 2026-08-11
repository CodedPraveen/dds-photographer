"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button/Button";
import { GALLERY_FORM_LIMITS } from "@/features/private-gallery/validation.mjs";

import { submitGalleryEntry } from "../server/actions";
import styles from "./PrivateGallery.module.css";

const INITIAL_STATE = {
  status: "idle",
  fieldErrors: {},
  values: {},
};

function FieldError({ children, id }) {
  if (!children) {
    return null;
  }

  return (
    <span className={styles.fieldError} id={id}>
      {children}
    </span>
  );
}

export function GalleryEntryForm({ token }) {
  const action = submitGalleryEntry.bind(null, token);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className={styles.form} noValidate>
      <div className={styles.formIntro}>
        <p className={styles.eyebrow}>Private gallery</p>
        <h1 className={styles.entryHeading}>Your photographs are ready.</h1>
        <p className={styles.introCopy}>
          Enter your details and consent below to continue to this private
          collection.
        </p>
      </div>

      {state.formError ? (
        <div className={styles.formError} role="alert">
          {state.formError}
        </div>
      ) : null}

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="gallery-name">
          Name
        </label>
        <input
          aria-describedby={errors.name ? "gallery-name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
          className={styles.input}
          defaultValue={state.values?.name ?? ""}
          disabled={isPending}
          id="gallery-name"
          maxLength={GALLERY_FORM_LIMITS.name}
          name="name"
          required
          type="text"
        />
        <FieldError id="gallery-name-error">{errors.name}</FieldError>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="gallery-mobile">
          Mobile
        </label>
        <input
          aria-describedby={errors.mobile ? "gallery-mobile-error" : undefined}
          aria-invalid={Boolean(errors.mobile)}
          autoComplete="tel"
          className={styles.input}
          defaultValue={state.values?.mobile ?? ""}
          disabled={isPending}
          id="gallery-mobile"
          inputMode="tel"
          maxLength={GALLERY_FORM_LIMITS.mobile}
          name="mobile"
          required
          type="tel"
        />
        <FieldError id="gallery-mobile-error">{errors.mobile}</FieldError>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="gallery-email">
          Email
        </label>
        <input
          aria-describedby={errors.email ? "gallery-email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          autoCapitalize="none"
          autoComplete="email"
          className={styles.input}
          defaultValue={state.values?.email ?? ""}
          disabled={isPending}
          id="gallery-email"
          inputMode="email"
          maxLength={GALLERY_FORM_LIMITS.email}
          name="email"
          required
          spellCheck="false"
          type="email"
        />
        <FieldError id="gallery-email-error">{errors.email}</FieldError>
      </div>

      <div className={styles.consentGroup}>
        <label className={styles.consentLabel} htmlFor="gallery-consent">
          <input
            aria-describedby={
              errors.consent ? "gallery-consent-error" : "gallery-consent-help"
            }
            aria-invalid={Boolean(errors.consent)}
            className={styles.checkbox}
            disabled={isPending}
            id="gallery-consent"
            name="consent"
            required
            type="checkbox"
          />
          <span>
            I consent to DDS Photographer storing these details to provide
            access to this private gallery.
          </span>
        </label>
        <p className={styles.consentHelp} id="gallery-consent-help">
          Your details are attached only to this gallery.
        </p>
        <FieldError id="gallery-consent-error">{errors.consent}</FieldError>
      </div>

      <Button
        className={styles.submitButton}
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Opening gallery…" : "Continue to gallery"}
      </Button>

      <p aria-live="polite" className={styles.srStatus} role="status">
        {isPending ? "Validating your details and opening the gallery." : ""}
      </p>
    </form>
  );
}
