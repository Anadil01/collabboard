jest.mock("../services/task.service", () => ({
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  getTaskById: jest.fn(),
  getTasks: jest.fn(),
  moveTask: jest.fn()
}));

jest.mock("../services/socket.service", () => ({
  emitBoardUpdate: jest.fn()
}));

jest.mock("../services/activity.service", () => ({
  log: jest.fn()
}));

jest.mock("../models/Board.model", () => ({
  findOne: jest.fn()
}));

jest.mock("../models/List.model", () => ({
  findById: jest.fn(),
  findOne: jest.fn()
}));

jest.mock("../models/Activity.model", () => ({
  find: jest.fn()
}));

const taskCtrl = require("../controllers/task.controller");
const activityCtrl = require("../controllers/activity.controller");
const svc = require("../services/task.service");
const Board = require("../models/Board.model");
const List = require("../models/List.model");
const { createRes } = require("./helpers");

describe("task/activity controller auth checks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("task create returns 403 for non-member", async () => {
    Board.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = {
      body: {
        boardId: "507f1f77bcf86cd799439011",
        listId: "507f1f77bcf86cd799439012",
        title: "Task"
      },
      userId: "u1"
    };
    const res = createRes();

    await taskCtrl.create(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });

  test("task getOne returns 403 when requester is not board member", async () => {
    svc.getTaskById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "t1",
        boardId: "b1"
      })
    });
    Board.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = { params: { id: "507f1f77bcf86cd799439013" }, userId: "u1" };
    const res = createRes();

    await taskCtrl.getOne(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });

  test("task get returns 404 when list does not exist", async () => {
    List.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = { query: { listId: "507f1f77bcf86cd799439012" }, userId: "u1" };
    const res = createRes();

    await taskCtrl.get(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "List not found" });
  });

  test("activity get returns 403 when requester has no board access", async () => {
    Board.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const req = { query: { boardId: "507f1f77bcf86cd799439011" }, userId: "u1" };
    const res = createRes();

    await activityCtrl.getBoardActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });
});
