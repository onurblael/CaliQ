import crypto from "crypto";

/**
 * Encryption utility for sensitive user data
 * Uses AES-256-GCM for authenticated encryption
 */

// Get encryption key from environment or generate a default (for development only)
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.ENCRYPTION_KEY;
  if (!keyEnv) {
    console.warn(
      "⚠️  ENCRYPTION_KEY not set. Using default key (development only). Set ENCRYPTION_KEY in production."
    );
    // Default 32-byte key for development
    return Buffer.from("0".repeat(64), "hex");
  }
  return Buffer.from(keyEnv, "hex");
}

/**
 * Encrypt data using AES-256-GCM
 * Returns base64 encoded string with IV and auth tag
 */
export function encryptData(data: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Combine IV + encrypted data + auth tag and encode as base64
  const combined = Buffer.concat([iv, Buffer.from(encrypted, "hex"), authTag]);
  return combined.toString("base64");
}

/**
 * Decrypt data encrypted with encryptData
 */
export function decryptData(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedBase64, "base64");

  // Extract IV (first 16 bytes), auth tag (last 16 bytes), and encrypted data
  const iv = combined.slice(0, 16);
  const authTag = combined.slice(-16);
  const encrypted = combined.slice(16, -16).toString("hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Encrypt JSON object
 */
export function encryptJSON<T>(data: T): string {
  return encryptData(JSON.stringify(data));
}

/**
 * Decrypt JSON object
 */
export function decryptJSON<T>(encryptedBase64: string): T {
  const decrypted = decryptData(encryptedBase64);
  return JSON.parse(decrypted) as T;
}
