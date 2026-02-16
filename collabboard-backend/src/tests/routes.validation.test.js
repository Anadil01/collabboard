jest.mock("../middleware/auth.middleware", () => (req, _res, next) => {
  req.userId = "u1";
  next();
});

jest.mock("../controllers/board.controller", () => ({
  getBoards: jest.fn(),
  createBoard: jest.fn(),
  getBoardFull: jest.fn(),
  addMember: jest.fn(),
  updateMemberRole: jest.fn(),
  removeMember: jest.fn(),
  leaveBoard: jest.fn(),
  transferOwnership: jest.fn(),
  removeBoard: jest.fn()
}));

jest.mock("../controllers/list.controller", () => ({
  create: jest.fn(),
  reorder: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
}));

jest.mock("../controllers/task.controller", () => ({
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(),
  getOne: jest.fn(),
  move: jest.fn()
}));

jest.mock("../controllers/activity.controller", () => ({
  getBoardActivity: jest.fn(),
  clearBoardActivity: jest.fn()
}));

const boardRoutes = require("../routes/board.routes");
const listRoutes = require("../routes/list.routes");
const taskRoutes = require("../routes/task.routes");
const activityRoutes = require("../routes/activity.routes");

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function getRouteValidator(router, method, path) {
  const layer = router.stack.find(
    (item) => item.route && item.route.path === path && item.route.methods[method]
  );
  if (!layer) throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  return layer.route.stack[0].handle;
}

describe("route validators", () => {
  test("board id validator rejects invalid id", () => {
    const validator = getRouteValidator(boardRoutes, "get", "/:id/full");
    const req = { params: { id: "bad-id" } };
    const res = createRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid board id" });
    expect(next).not.toHaveBeenCalled();
  });

  test("board create validator rejects short title", () => {
    const validator = getRouteValidator(boardRoutes, "post", "/");
    const req = { body: { title: "A" } };
    const res = createRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "title must be at least 2 characters" });
    expect(next).not.toHaveBeenCalled();
  });

  test("list id validator rejects invalid id", () => {
    const validator = getRouteValidator(listRoutes, "patch", "/:id");
    const req = { params: { id: "bad-id" } };
    const res = createRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid list id" });
    expect(next).not.toHaveBeenCalled();
  });

  test("task list query validator rejects invalid listId", () => {
    const validator = getRouteValidator(taskRoutes, "get", "/");
    const req = { query: { listId: "bad-id" } };
    const res = createRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid listId" });
    expect(next).not.toHaveBeenCalled();
  });

  test("task move validator rejects negative toIndex", () => {
    const validator = getRouteValidator(taskRoutes, "post", "/move");
    const req = {
      body: {
        taskId: "507f1f77bcf86cd799439011",
        toListId: "507f1f77bcf86cd799439012",
        toIndex: -1
      }
    };
    const res = createRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "toIndex must be a non-negative number" });
    expect(next).not.toHaveBeenCalled();
  });

  test("activity board query validator rejects invalid boardId", () => {
    const validator = getRouteValidator(activityRoutes, "get", "/");
    const req = { query: { boardId: "bad-id" } };
    const res = createRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid boardId" });
    expect(next).not.toHaveBeenCalled();
  });

  test("member role validator rejects invalid role", () => {
    const validator = getRouteValidator(boardRoutes, "patch", "/:id/members/:memberId/role");
    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
        memberId: "507f1f77bcf86cd799439012"
      },
      body: { role: "owner" }
    };
    const res = createRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "role must be admin or member" });
    expect(next).not.toHaveBeenCalled();
  });

  test("remove member validator rejects invalid member id", () => {
    const validator = getRouteValidator(boardRoutes, "delete", "/:id/members/:memberId");
    const req = {
      params: {
        id: "507f1f77bcf86cd799439011",
        memberId: "bad-id"
      }
    };
    const res = createRes();
    const next = jest.fn();

    validator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid member id" });
    expect(next).not.toHaveBeenCalled();
  });
});
