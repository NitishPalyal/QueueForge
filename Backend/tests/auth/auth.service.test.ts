import { describe, it, expect, vi, afterEach } from "vitest";
import argon2 from "argon2";
import {
  comparePasswordService,
  hashPasswordService,
} from "../../src/auth/auth.service.ts";

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock("argon2", () => ({
  default: {
    hash: vi.fn(),
    verify: vi.fn(),
  },
}));

// HASH PASSWORD SERVICE TEST//
describe("hashPasswordService", () => {
  // TEST FOR HASHING PASSWORD //
  it("should hash the password", async () => {
    vi.mocked(argon2.hash).mockResolvedValue("hashed-password");

    const result = await hashPasswordService("password123");

    expect(argon2.hash).toHaveBeenCalledWith("password123");
    expect(result).toBe("hashed-password");
  });
  // TEST FOR WHEN HASHING FAILED //
  it("should throw error when hashing fails", async () => {
    const error = new Error("Hashing failed");

    vi.mocked(argon2.hash).mockRejectedValue(error);

    await expect(hashPasswordService("password123")).rejects.toThrow(
      "Hashing failed",
    );
  });
});

describe("comparePasswordService", async () => {
  // TEST FOR COMPARING PASSWORD //
  it("should hash the password", async () => {
    vi.mocked(argon2.verify).mockResolvedValue(true);

    const result = await comparePasswordService({
      password: "password-123",
      hashedPassword: "hashed-password",
    });

    expect(argon2.verify).toHaveBeenCalledWith(
      "hashed-password",
      "password-123",
    );
    expect(result).toBe(true);
  });
  // TEST FOR WHEN COMPARING FAILED //
  it("should throw error when hashing fails", async () => {
    const error = new Error("Comparing failed");

    vi.mocked(argon2.verify).mockRejectedValue(error);

    await expect(
      comparePasswordService({
        password: "password-123",
        hashedPassword: "hashed-password",
      }),
    ).rejects.toThrow("Comparing failed");
  });
});
