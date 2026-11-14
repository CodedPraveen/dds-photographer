import { createHmac, randomBytes } from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function createTotpSecret() {
  return encodeBase32(randomBytes(20));
}

function encodeBase32(buffer) {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");
  let output = "";
  for (let i = 0; i < bits.length; i += 5) {
    output += alphabet[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  }
  return output;
}

function decodeBase32(value) {
  const bits = value
    .toUpperCase()
    .replace(/=+$/, "")
    .split("")
    .map((c) => alphabet.indexOf(c).toString(2).padStart(5, "0"))
    .join("");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8)
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function verifyTotp(secret, input, now = Date.now()) {
  const code = String(input).replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  const counter = Math.floor(now / 30000);
  return [-1, 0, 1].some(
    (offset) => generateTotp(secret, counter + offset) === code,
  );
}

function generateTotp(secret, counter) {
  const data = Buffer.alloc(8);
  data.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", decodeBase32(secret)).update(data).digest();
  const offset = digest[digest.length - 1] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(
    6,
    "0",
  );
}
