import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../../src/features/auth/state/useAuthStore";

const user = {
  id: "user-123",
  email: "user@example.com",
  fullname: "Queue Forge User",
};

describe("auth store", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/";
    useAuthStore.getState().setUser(null);
  });

  // TEST FOR PERSISTING THE USER AND MARKING THE SESSION AUTHENTICATED //
  it("persists a logged-in user and updates authentication state", () => {
    useAuthStore.getState().setUser(user);

    expect(useAuthStore.getState()).toMatchObject({
      user,
      isAuthenticated: true,
      isCheckingAuth: false,
    });
    expect(localStorage.getItem("queueforge_user")).toBe(JSON.stringify(user));
  });

  // TEST FOR CLEARING USER STATE AND THE SESSION CACHE ON LOGOUT //
  it("clears user state and the persisted session on logout", () => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: false,
    });
    expect(localStorage.getItem("queueforge_user")).toBeNull();
  });
});
