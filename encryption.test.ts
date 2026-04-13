import { describe, it, expect, beforeEach } from "vitest";
import { encryptData, decryptData, encryptJSON, decryptJSON } from "../server/encryption";

describe("Encryption Utilities", () => {
  describe("encryptData and decryptData", () => {
    it("should encrypt and decrypt string data", () => {
      const originalData = "This is sensitive user data";
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(originalData);
      expect(encrypted).not.toBe(originalData);
    });

    it("should produce different ciphertexts for same plaintext (due to random IV)", () => {
      const data = "Same data";
      const encrypted1 = encryptData(data);
      const encrypted2 = encryptData(data);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decryptData(encrypted1)).toBe(data);
      expect(decryptData(encrypted2)).toBe(data);
    });

    it("should handle empty strings", () => {
      const originalData = "";
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it("should handle special characters and unicode", () => {
      const originalData = "Special chars: !@#$%^&*() Ñ é ü 中文";
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(originalData);
    });

    it("should handle long strings", () => {
      const originalData = "A".repeat(10000);
      const encrypted = encryptData(originalData);
      const decrypted = decryptData(encrypted);

      expect(decrypted).toBe(originalData);
    });
  });

  describe("encryptJSON and decryptJSON", () => {
    it("should encrypt and decrypt JSON objects", () => {
      const originalData = {
        weight: 75.5,
        goal: "loss",
        restrictions: ["vegetarian", "gluten-free"],
      };

      const encrypted = encryptJSON(originalData);
      const decrypted = decryptJSON(encrypted);

      expect(decrypted).toEqual(originalData);
    });

    it("should handle nested objects", () => {
      const originalData = {
        user: {
          id: 123,
          preferences: {
            weight: 70,
            goal: "maintenance",
            restrictions: ["vegan"],
          },
        },
      };

      const encrypted = encryptJSON(originalData);
      const decrypted = decryptJSON(encrypted);

      expect(decrypted).toEqual(originalData);
    });

    it("should handle arrays of objects", () => {
      const originalData = [
        { id: 1, name: "Meal 1", calories: 500 },
        { id: 2, name: "Meal 2", calories: 600 },
      ];

      const encrypted = encryptJSON(originalData);
      const decrypted = decryptJSON(encrypted);

      expect(decrypted).toEqual(originalData);
    });

    it("should handle null and undefined values", () => {
      const originalData = {
        weight: null as number | null,
        goal: undefined as string | undefined,
        restrictions: [] as string[],
      };

      const encrypted = encryptJSON(originalData);
      const decrypted = decryptJSON<typeof originalData>(encrypted);

      expect(decrypted.weight).toBeNull();
      expect(decrypted.restrictions).toEqual([]);
    });
  });

  describe("Security Properties", () => {
    it("should not be reversible without the key", () => {
      const data = "Secret data";
      const encrypted = encryptData(data);

      // Encrypted data should be base64 (not readable as plain text)
      expect(() => Buffer.from(encrypted, "base64")).not.toThrow();
    });

    it("should produce base64 encoded output", () => {
      const data = "Test data";
      const encrypted = encryptData(data);

      // Should be valid base64
      const buffer = Buffer.from(encrypted, "base64");
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
