const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32ToBytes(base32) {
  const normalized = (base32 || "").replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = "";
  for (const c of normalized) {
    const idx = ALPHABET.indexOf(c);
    if (idx === -1) throw new Error(`Invalid Base32 character: ${c}`);
    bits += idx.toString(2).padStart(5, "0");
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

async function hmacSha1(keyBytes, messageBytes) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageBytes);
  return new Uint8Array(signature);
}

function intTo8ByteArray(value) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, value, false);
  return new Uint8Array(buffer);
}

export async function generateTotp(secretBase32, period = 30, digits = 6, now = Date.now()) {
  const counter = Math.floor(now / 1000 / period);
  const keyBytes = base32ToBytes(secretBase32);
  const msg = intTo8ByteArray(counter);
  const hmac = await hmacSha1(keyBytes, msg);

  const offset = hmac[hmac.length - 1] & 0x0f;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const code = (codeInt % 10 ** digits).toString().padStart(digits, "0");
  const remainingSeconds = period - (Math.floor(now / 1000) % period);

  return { code, remainingSeconds };
}
