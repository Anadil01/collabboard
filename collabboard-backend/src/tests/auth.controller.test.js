jest.mock("../models/User.model", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock("../utils/hash", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

jest.mock("../utils/jwt", () => ({
  signToken: jest.fn()
}));

const User = require("../models/User.model");
const { hashPassword, comparePassword } = require("../utils/hash");
const { signToken } = require("../utils/jwt");
const ctrl = require("../controllers/auth.controller");
const { createRes } = require("./helpers");

describe("auth.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("signup normalizes email and creates user", async () => {
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hash");
    User.create.mockResolvedValue({
      _id: "u1",
      name: "Alice",
      email: "alice@example.com"
    });
    signToken.mockReturnValue("token123");

    const req = {
      body: {
        name: "Alice",
        email: "  Alice@Example.com  ",
        password: "Password123!"
      }
    };
    const res = createRes();

    await ctrl.signup(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "alice@example.com" });
    expect(User.create).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "hash"
    });
    expect(res.json).toHaveBeenCalledWith({
      token: "token123",
      user: { id: "u1", name: "Alice", email: "alice@example.com" }
    });
  });

  test("login rejects invalid credentials", async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { email: "none@example.com", password: "x" } };
    const res = createRes();

    await ctrl.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  test("login returns token on success with normalized email", async () => {
    User.findOne.mockResolvedValue({
      _id: "u2",
      name: "Bob",
      email: "bob@example.com",
      passwordHash: "hash2"
    });
    comparePassword.mockResolvedValue(true);
    signToken.mockReturnValue("token456");

    const req = { body: { email: "  BOB@example.com ", password: "secret" } };
    const res = createRes();

    await ctrl.login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "bob@example.com" });
    expect(res.json).toHaveBeenCalledWith({
      token: "token456",
      user: { id: "u2", name: "Bob", email: "bob@example.com" }
    });
  });
});
