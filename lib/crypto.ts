import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY env var is not set");
  return Buffer.from(key, "base64");
}

export function encryptSecret(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptSecret(data: {
  ciphertext: string;
  iv: string;
  authTag: string;
}): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(data.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(data.authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
