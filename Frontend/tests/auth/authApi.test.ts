import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../src/shared/lib/axios";
import { authApi } from "../../src/features/auth/api/authApi";

vi.mock("../../src/shared/lib/axios", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const user = {
  id: "user-123",
  email: "user@example.com",
  fullname: "Queue Forge User",
};

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST FOR RETURNING THE REGISTERED USER FROM THE API RESPONSE //
  it("returns the registered user", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, message: "registered", data: { user } },
    });

    await expect(
      authApi.register({
        email: user.email,
        password: "password123",
        fullname: user.fullname,
      }),
    ).resolves.toEqual(user);

    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/register", {
      email: user.email,
      password: "password123",
      fullname: user.fullname,
    });
  });

  // TEST FOR REJECTING AUTHENTICATION WHEN THE USER IS MISSING FROM THE RESPONSE //
  it("throws the backend message when login returns no user", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: false, message: "Invalid credentials" },
    });

    await expect(
      authApi.login({ email: user.email, password: "wrong-password" }),
    ).rejects.toThrow("Invalid credentials");
  });

  // TEST FOR CALLING THE LOGOUT ENDPOINT //
  it("calls the logout endpoint", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, message: "logged out" },
    });

    await authApi.logout();

    expect(apiClient.post).toHaveBeenCalledWith("/api/auth/logout");
  });
});
