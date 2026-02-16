jest.mock("../services/board.service", () => ({
  createBoard: jest.fn(),
  getUserBoards: jest.fn()
}));

jest.mock("../models/Board.model", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn()
}));

jest.mock("../models/List.model", () => ({
  find: jest.fn(),
  deleteMany: jest.fn()
}));

jest.mock("../models/Task.model", () => ({
  find: jest.fn(),
  deleteMany: jest.fn()
}));

jest.mock("../models/Activity.model", () => ({
  deleteMany: jest.fn()
}));

jest.mock("../models/User.model", () => ({
  findOne: jest.fn()
}));

const ctrl = require("../controllers/board.controller");
const Board = require("../models/Board.model");
const { createRes } = require("./helpers");

describe("board.controller auth/ownership", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getBoardFull returns 404 when board not found", async () => {
    Board.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null)
    });

    const req = { params: { id: "507f1f77bcf86cd799439011" }, userId: "u1" };
    const res = createRes();

    await ctrl.getBoardFull(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Board not found" });
  });

  test("addMember returns 404 when board not found for requester", async () => {
    Board.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { email: "user@example.com" },
      userId: "u1"
    };
    const res = createRes();

    await ctrl.addMember(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Board not found" });
  });

  test("removeBoard returns 403 for non-member", async () => {
    Board.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "b1",
        createdBy: "owner-1",
        members: ["member-2"]
      })
    });

    const req = { params: { id: "b1" }, userId: "u1" };
    const res = createRes();

    await ctrl.removeBoard(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Only owner/admin can delete board" });
  });

  test("addMember returns 403 when requester is not owner/admin", async () => {
    Board.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "b1",
        createdBy: "owner-1",
        members: ["u1"],
        memberRoles: { u1: "member" }
      })
    });

    const req = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: { email: "new@example.com" },
      userId: "u1"
    };
    const res = createRes();

    await ctrl.addMember(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Only owner/admin can manage board members" });
  });

  test("updateMemberRole returns 403 when requester is not owner", async () => {
    Board.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "b1",
        createdBy: "owner-1",
        members: ["u1", "u2"],
        memberRoles: { u1: "admin", u2: "member" }
      })
    });

    const req = {
      params: { id: "b1", memberId: "u2" },
      body: { role: "admin" },
      userId: "u1"
    };
    const res = createRes();

    await ctrl.updateMemberRole(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Only owner can change member roles" });
  });

  test("updateMemberRole updates target role when requester is owner", async () => {
    const select = jest.fn().mockResolvedValue({
      _id: "b1",
      createdBy: "owner-1",
      members: ["owner-1", "u2"],
      memberRoles: { "owner-1": "owner", u2: "member" }
    });
    const populate = jest.fn().mockResolvedValue({
      _id: "b1",
      members: [{ _id: "owner-1", name: "Owner" }, { _id: "u2", name: "User2" }]
    });
    Board.findById
      .mockReturnValueOnce({ select })
      .mockReturnValueOnce({ populate });
    Board.updateOne.mockResolvedValue({ acknowledged: true });

    const req = {
      params: { id: "b1", memberId: "u2" },
      body: { role: "admin" },
      userId: "owner-1"
    };
    const res = createRes();

    await ctrl.updateMemberRole(req, res);

    expect(Board.updateOne).toHaveBeenCalledWith(
      { _id: "b1" },
      { $set: { "memberRoles.u2": "admin" } }
    );
    expect(res.json).toHaveBeenCalled();
  });

  test("removeMember returns 403 when requester is neither owner nor admin", async () => {
    Board.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "b1",
        createdBy: "owner-1",
        members: ["u1", "u2"],
        memberRoles: { u1: "member", u2: "member" }
      })
    });

    const req = {
      params: { id: "b1", memberId: "u2" },
      userId: "u1"
    };
    const res = createRes();

    await ctrl.removeMember(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Only owner/admin can remove members" });
  });

  test("removeMember allows owner to remove member", async () => {
    const select = jest.fn().mockResolvedValue({
      _id: "b1",
      createdBy: "owner-1",
      members: ["owner-1", "u2"],
      memberRoles: { "owner-1": "owner", u2: "member" }
    });
    const populate = jest.fn().mockResolvedValue({
      _id: "b1",
      members: [{ _id: "owner-1" }]
    });
    Board.findById
      .mockReturnValueOnce({ select })
      .mockReturnValueOnce({ populate });
    Board.updateOne.mockResolvedValue({ acknowledged: true });

    const req = {
      params: { id: "b1", memberId: "u2" },
      userId: "owner-1"
    };
    const res = createRes();

    await ctrl.removeMember(req, res);

    expect(Board.updateOne).toHaveBeenCalledWith(
      { _id: "b1" },
      {
        $pull: { members: "u2" },
        $unset: { "memberRoles.u2": 1 }
      }
    );
    expect(res.json).toHaveBeenCalled();
  });

  test("removeBoard allows legacy member delete when no owner/roles metadata", async () => {
    Board.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "b-legacy",
        members: ["u1", "u2"]
      })
    });

    const req = { params: { id: "b-legacy" }, userId: "u1" };
    const res = createRes();

    await ctrl.removeBoard(req, res);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
