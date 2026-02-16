jest.mock("../models/Board.model", () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn()
}));

jest.mock("../models/List.model", () => ({
  insertMany: jest.fn()
}));

jest.mock("../utils/pagination", () => ({
  getPagination: jest.fn()
}));

const Board = require("../models/Board.model");
const List = require("../models/List.model");
const { getPagination } = require("../utils/pagination");
const service = require("../services/board.service");

describe("board.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createBoard creates board and default lists", async () => {
    Board.create.mockResolvedValue({ _id: "b1", title: "Roadmap" });

    const result = await service.createBoard("Roadmap", "u1");

    expect(Board.create).toHaveBeenCalledWith({
      title: "Roadmap",
      description: "",
      createdBy: "u1",
      members: ["u1"],
      memberRoles: { u1: "owner" }
    });
    expect(List.insertMany).toHaveBeenCalledWith([
      { boardId: "b1", title: "To Do", order: 1 },
      { boardId: "b1", title: "In Progress", order: 2 },
      { boardId: "b1", title: "Done", order: 3 }
    ]);
    expect(result).toEqual({ _id: "b1", title: "Roadmap" });
  });

  test("getUserBoards applies pagination and search", async () => {
    getPagination.mockReturnValue({ skip: 5, page: 2, limit: 5 });
    const sort = jest.fn().mockResolvedValue([{ _id: "b2", title: "X" }]);
    const limit = jest.fn().mockReturnValue({ sort });
    const skip = jest.fn().mockReturnValue({ limit });
    Board.find.mockReturnValue({ skip });
    Board.countDocuments.mockResolvedValue(11);

    const result = await service.getUserBoards({
      userId: "u1",
      page: 2,
      limit: 5,
      search: "roadmap"
    });

    expect(Board.find).toHaveBeenCalledWith({
      members: "u1",
      $text: { $search: "roadmap" }
    });
    expect(result).toEqual({
      boards: [{ _id: "b2", title: "X" }],
      total: 11,
      page: 2,
      limit: 5
    });
  });
});
