import {
  getAuthorizedGalleryVisitor,
  resolveGalleryToken,
} from "@/features/private-gallery/server/gallery-access";

export const dynamic = "force-dynamic";

const PALETTES = [
  ["#302a27", "#b99f87", "#f2e8dc"],
  ["#202325", "#76858a", "#e6e0d7"],
  ["#3a3029", "#9b765e", "#efe1d2"],
  ["#252126", "#786878", "#ece7e0"],
];

function hash(value) {
  return [...value].reduce((total, character) => {
    return (total * 31 + character.charCodeAt(0)) >>> 0;
  }, 0);
}

function escapeXml(value) {
  return value.replace(/[<>&"']/g, (character) => {
    return {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    }[character];
  });
}

function renderDevelopmentMedia(gallery, media) {
  const palette = PALETTES[hash(media.id) % PALETTES.length];
  const title = escapeXml(gallery.title);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" role="img" aria-label="${escapeXml(media.altText)}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette[0]}"/>
      <stop offset="1" stop-color="${palette[1]}"/>
    </linearGradient>
    <radialGradient id="light" cx="68%" cy="22%" r="58%">
      <stop offset="0" stop-color="${palette[2]}" stop-opacity=".72"/>
      <stop offset="1" stop-color="${palette[2]}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="1200" fill="url(#background)"/>
  <rect width="1600" height="1200" fill="url(#light)"/>
  <circle cx="590" cy="510" r="270" fill="none" stroke="${palette[2]}" stroke-opacity=".26" stroke-width="3"/>
  <circle cx="980" cy="690" r="360" fill="${palette[0]}" fill-opacity=".2"/>
  <text x="96" y="1050" fill="${palette[2]}" font-family="Arial, sans-serif" font-size="42" letter-spacing="8">DDS PHOTOGRAPHER</text>
  <text x="96" y="1115" fill="${palette[2]}" fill-opacity=".76" font-family="Arial, sans-serif" font-size="28">${title}</text>
</svg>`;
}

function denied() {
  return new Response("Not found", {
    status: 404,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

export async function GET(_request, { params }) {
  const { mediaId, token } = await params;
  const gallery = await resolveGalleryToken(token);

  if (!gallery) {
    return denied();
  }

  const media = gallery.media.find((item) => item.id === mediaId);
  if (!media) {
    return denied();
  }

  if (!media.isCover) {
    const visitor = await getAuthorizedGalleryVisitor(gallery.id);
    if (!visitor) {
      return denied();
    }
  }

  if (!media.storageKey.startsWith("development/")) {
    return new Response("Media unavailable", {
      status: 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  return new Response(renderDevelopmentMedia(gallery, media), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
