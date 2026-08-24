import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getMeController,
  loginController,
  registerController,
  deleteUserController,
} from "../../src/auth/auth.controller.ts";

import {
  getUserByEmail,
  comparePasswordService,
  sendTokenResponse,
  createUserService,
  findUserByEmailAndFullnameService,
  hashPasswordService,
  deleteUserById,
} from "../../src/auth/auth.service.ts";

vi.mock("../../src/auth/auth.service.ts", () => ({
  getUserByEmail: vi.fn(),
  comparePasswordService: vi.fn(),
  sendTokenResponse: vi.fn(),
  createUserService: vi.fn(),
  findUserByEmailAndFullnameService: vi.fn(),
  hashPasswordService: vi.fn(),
  deleteUserById: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

// GET ME  CONTROLLER TEST//
describe("getMe controller", () => {
  // TEST FOR RETURING USER //
  it("should return the current user", async () => {
    const req = {
      user: {
        id: "user-123",
        email: "test@example.com",
        fullname: "John Doe",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await getMeController(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User fetched successfully",
      data: {
        user: {
          id: "user-123",
          email: "test@example.com",
          fullname: "John Doe",
        },
      },
    });
  });
});

// LOGIN CONTROLLER TESTS //
describe("loginController", () => {
  // TEST FOR LOGIN SUCESSFULLY //
  it("should login user successfully", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const fakeUser = {
      id: "user-123",
      email: "test@example.com",
      password: "hashed-password",
      fullname: "John Doe",
      createdAt: new Date(),
    };

    vi.mocked(getUserByEmail).mockResolvedValue(fakeUser);

    vi.mocked(comparePasswordService).mockResolvedValue(true);

    await loginController(req as any, res as any);

    expect(getUserByEmail).toHaveBeenCalledWith("test@example.com");

    expect(comparePasswordService).toHaveBeenCalledWith({
      password: "password123",
      hashedPassword: "hashed-password",
    });

    expect(sendTokenResponse).toHaveBeenCalledWith(
      fakeUser,
      res,
      "User logged in successfully.",
    );
  });
  // TEST FOR USER DOES NOT EXIST //
  it("should return 400 when user does not exist", async () => {
    const req = {
      body: {
        email: "unknown@example.com",
        password: "password123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.mocked(getUserByEmail).mockResolvedValue(null);

    await loginController(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password.",
      success: false,
    });
  });
  // TEST FOR PASSWORD IS INCORRECT //
  it("should return 400 when password is incorrect", async () => {
    const fakeUser = {
      id: "user-123",
      email: "test@example.com",
      password: "hashed-password",
      fullname: "John Doe",
      createdAt: new Date(),
    };

    const req = {
      body: {
        email: "test@example.com",
        password: "wrong-password",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.mocked(getUserByEmail).mockResolvedValue(fakeUser);

    vi.mocked(comparePasswordService).mockResolvedValue(false);

    await loginController(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password.",
      success: false,
    });
  });
  // TEST FOR WHEN UNEXPECTED ERROR ACCOURS //
  it("should return 500 when an unexpected error occurs", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.mocked(getUserByEmail).mockRejectedValue(new Error("Database failed"));

    await loginController(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      success: false,
    });
  });
});

// REGISTER CONTROLLER TESTS//
describe("registerController", () => {
  // TEST FOR REGISTERING USER //
  it("should register user successfully", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const fakeUser = {
      id: "user-123",
      email: "test@example.com",
      password: "hashed-password",
      fullname: "John Doe",
      createdAt: new Date(),
    };

    vi.mocked(findUserByEmailAndFullnameService).mockResolvedValue(false);
    vi.mocked(hashPasswordService).mockResolvedValue("hashed-password");
    vi.mocked(createUserService).mockResolvedValue(fakeUser);

    await registerController(req as any, res as any);

    expect(findUserByEmailAndFullnameService).toHaveBeenCalledWith({
      email: "test@example.com",
      fullname: "John Doe",
    });

    expect(hashPasswordService).toHaveBeenCalledWith("password123");

    expect(createUserService).toHaveBeenCalledWith({
      email: "test@example.com",
      fullname: "John Doe",
      password: "hashed-password",
    });

    expect(sendTokenResponse).toHaveBeenCalledWith(
      fakeUser,
      res,
      "User registered successfully.",
    );
  });
  // TEST FOR USER ALREADY EXISTING //
  it("should return 400 when user alreay exist", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.mocked(findUserByEmailAndFullnameService).mockResolvedValue(true);

    await registerController(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "User with this email or name already exists.",
      success: false,
    });
  });
  // TEST FOR FAILED TO CREATE USER //
  it("should return 500 when failed to create user", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.mocked(findUserByEmailAndFullnameService).mockResolvedValue(false);
    vi.mocked(hashPasswordService).mockResolvedValue("hashed-password");
    vi.mocked(createUserService).mockRejectedValue(null);

    await registerController(req as any, res as any);

    expect(findUserByEmailAndFullnameService).toHaveBeenCalledWith({
      email: "test@example.com",
      fullname: "John Doe",
    });

    expect(hashPasswordService).toHaveBeenCalledWith("password123");

    expect(createUserService).toHaveBeenCalledWith({
      email: "test@example.com",
      fullname: "John Doe",
      password: "hashed-password",
    });

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      success: false,
    });
  });
  // TEST FOR WHEN UNEXPECTED ERROR ACCOURS //
  it("should return 500 when an unexpected error occurs", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.mocked(findUserByEmailAndFullnameService).mockRejectedValue(
      new Error("Database failed"),
    );

    await registerController(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      success: false,
    });
  });
});

describe("deleteUserController", () => {
  // TEST FOR DELETING USER //
  it("should delete user successfully", async () => {
    const req = {
      user: {
        id: "user-123",
        email: "test@example.com",
        fullname: "John Doe",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.mocked(deleteUserById).mockResolvedValue();

    await deleteUserController(req as any, res as any);

    expect(deleteUserById).toHaveBeenCalledWith("user-123");

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
      success: true,
    });
  });
  // TEST FOR WHEN UNEXPECTED ERROR ACCOURS //
  it("should return 500 when an unexpected error occurs", async () => {
    const req = {
      user: {
        id: "user-123",
        email: "test@example.com",
        fullname: "John Doe",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.mocked(deleteUserById).mockRejectedValue(new Error("Database failed"));

    await deleteUserController(req as any, res as any);

    expect(deleteUserById).toHaveBeenCalledWith("user-123");

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      success: false,
    });
  });
});
