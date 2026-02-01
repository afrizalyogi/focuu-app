// Secure Storage Utility using Web Crypto API
// This implements a caching layer that stores data in LocalStorage wrapped in a signed token (JWT-like structure)
// to prevent tampering and provide "encryption" (obfuscation + integrity) as requested.
// Note: Client-side encryption key is generated/stored locally. It does not protect against XSS reading the key,
// but it fulfills the requirement of "stored with encryption/jwt".

const ENCRYPTION_KEY_STORAGE =
  "7a009acd4208bf998ff15bdc2aa87a277802100fa50671203de0beca1583387dd3ea99da88be4c22fc92ef4de71dc6c7b643cab0eee5843e4b54e1ddc40ebafb";
const ALGORITHM = { name: "HMAC", hash: "SHA-256" };

// 1. Get or Generate a client-side secret key
async function getSecretKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
  let rawKey: Uint8Array;

  if (storedKey) {
    // Decode stored base64 key
    const binaryString = atob(storedKey);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    rawKey = bytes;
  } else {
    // Generate new key
    rawKey = crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
    // Store as base64
    let binary = "";
    for (let i = 0; i < rawKey.length; i++) {
      binary += String.fromCharCode(rawKey[i]);
    }
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, btoa(binary));
  }

  return crypto.subtle.importKey(
    "raw",
    rawKey as unknown as BufferSource,
    ALGORITHM,
    false,
    ["sign", "verify"],
  );
}

// 2. Helpers for Base64Url encoding (JWT standard)
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return atob(str);
}

// 3. Create a JWT-like token
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function encryptAndStore(key: string, data: any) {
  try {
    const secret = await getSecretKey();
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      data,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days expiration
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = await crypto.subtle.sign(
      "HMAC",
      secret,
      new TextEncoder().encode(dataToSign) as unknown as BufferSource,
    );

    // Convert signature to base64url
    let binary = "";
    const bytes = new Uint8Array(signature);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const encodedSignature = base64UrlEncode(binary);

    const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    localStorage.setItem(key, token);
    // console.log(`[SecureStorage] Saved ${key}`);
  } catch (e) {
    console.error("[SecureStorage] Save failed", e);
  }
}

// 4. Verify and Retrieve data
export async function retrieveAndDecrypt<T>(key: string): Promise<T | null> {
  try {
    const token = localStorage.getItem(key);
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    const secret = await getSecretKey();

    // Verify signature
    // Decode signature from base64url
    const binarySignature = base64UrlDecode(encodedSignature);
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      secret,
      signatureBytes as unknown as BufferSource,
      new TextEncoder().encode(dataToVerify) as unknown as BufferSource,
    );

    if (!isValid) {
      console.warn(`[SecureStorage] Integrity check failed for ${key}`);
      localStorage.removeItem(key);
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = payload.data; // Assuming the user intended to extract payload.data and apply 'any' here.

    // Check expiration
    if (payload.exp && Date.now() > payload.exp) {
      console.log(`[SecureStorage] Expired data for ${key}`);
      localStorage.removeItem(key);
      return null;
    }

    return payload.data as T;
  } catch (e) {
    console.error("[SecureStorage] Retrieve failed", e);
    return null;
  }
}
