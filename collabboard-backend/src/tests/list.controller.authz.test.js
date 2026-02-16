jest.mock("../services/list.service", () => ({
  createList: jest.fn(),
  updateList: jest.fn(),
  deleteList: jest.fn(),
  reorderLists: jest.fn()
}));

jest.mock("../models/Board.model", () => ({
  findOne: jest.fn()
}));

jest.mock("../models/List.model", () => ({
  findById: jest.fn()
}));

jest.mock("../services/activity.service", () => ({
  log: jest.fn()
}));

jest.mock("../services/socket.service", () => ({
  emitBoardUpdate: jest.fn()
}));

const ctrl = require("../controllers/list.controller");
const Board = require("../models/Board.model");
const List = require("../models/List.model");
const { createRes } = require("./helpers");

describe("list.controller auth/ownership", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("create returns 403 when requester is not board member", async () => {
    Board.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = {
      body: { boardId: "507f1f77bcf86cd799439011", title: "Backlog" },
      userId: "u1"
    };
    const res = createRes();

    await ctrl.create(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });

  test("update returns 404 when list does not exist", async () => {
    List.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = { params: { id: "507f1f77bcf86cd799439012" }, body: { title: "Doing" }, userId: "u1" };
    const res = createRes();

    await ctrl.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "List not found" });
  });

  test("remove returns 403 when requester is not board member", async () => {
    List.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ boardId: "b1" })
    });
    Board.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = { params: { id: "507f1f77bcf86cd799439012" }, userId: "u1" };
    const res = createRes();

    await ctrl.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });
});
