import { describe, it, expect, vi } from "vitest";
import { findByEmailAndFullname } from "../../src/auth/auth.repository.ts";
import { prisma } from "../../src/config/config.database";

vi.mock("../../src/config/config.database.ts", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

// FIND USER BY EMAIL AND FULLNAME DATABASE QUERY TEST //
describe("findByEmailAndFullname", () => {
  // TEST FOR WHEN USER IS FOUND //
  it("should find user by email or fullname", async () => {
    const fakeUser = {
      id: "user-123",
      email: "test@example.com",
      fullname: "John Doe",
      password: "hashed-password",
      createdAt: new Date(),
    };

    vi.mocked(prisma.user.findFirst).mockResolvedValue(fakeUser);

    const result = await findByEmailAndFullname("test@example.com", "John Doe");

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ email: "test@example.com" }, { fullname: "John Doe" }],
      },
    });

    expect(result).toEqual(fakeUser);
  });
  // TEST FOR WHEN USER IS NOT FOUND //
  it("should return null when user is not found", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const result = await findByEmailAndFullname(
      "unknown@example.com",
      "Unknown",
    );

    expect(result).toBeNull();
  });
});
