export const GALLERY_FORM_LIMITS = Object.freeze({
  name: 80,
  mobile: 24,
  email: 254,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s().-]*[0-9]$/;

function readText(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function validateGalleryEntry(formData) {
  const values = {
    name: readText(formData, "name"),
    mobile: readText(formData, "mobile"),
    email: readText(formData, "email").toLowerCase(),
  };
  const fieldErrors = {};

  if (!values.name) {
    fieldErrors.name = "Enter your name.";
  } else if (values.name.length > GALLERY_FORM_LIMITS.name) {
    fieldErrors.name = `Use ${GALLERY_FORM_LIMITS.name} characters or fewer.`;
  }

  if (!values.mobile) {
    fieldErrors.mobile = "Enter your mobile number.";
  } else {
    const mobileDigits = values.mobile.replace(/\D/g, "");
    if (
      values.mobile.length > GALLERY_FORM_LIMITS.mobile ||
      mobileDigits.length < 7 ||
      mobileDigits.length > 15 ||
      !PHONE_PATTERN.test(values.mobile)
    ) {
      fieldErrors.mobile = "Enter a valid mobile number.";
    }
  }

  if (!values.email) {
    fieldErrors.email = "Enter your email address.";
  } else if (
    values.email.length > GALLERY_FORM_LIMITS.email ||
    !EMAIL_PATTERN.test(values.email)
  ) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (formData.get("consent") !== "on") {
    fieldErrors.consent = "Consent is required to enter this gallery.";
  }

  return {
    data: {
      ...values,
      consent: true,
    },
    fieldErrors,
    success: Object.keys(fieldErrors).length === 0,
  };
}
