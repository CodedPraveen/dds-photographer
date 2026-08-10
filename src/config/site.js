const DEFAULT_SITE_URL = "http://localhost:3000";

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;

  try {
    return new URL(configuredUrl);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an absolute URL, for example https://example.com.",
    );
  }
}

export const siteConfig = Object.freeze({
  name: "DDS Photographer",
  description:
    "Premium photography studio and private client gallery platform.",
  url: resolveSiteUrl(),
});
