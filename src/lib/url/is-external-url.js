const EXTERNAL_PROTOCOL_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export function isExternalUrl(href) {
  return (
    typeof href === "string" && EXTERNAL_PROTOCOL_PATTERN.test(href.trim())
  );
}
