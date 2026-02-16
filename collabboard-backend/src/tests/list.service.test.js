jest.mock("../models/List.model", () => ({
  find: jest.fn(),
  bulkWrite: jest.fn()
}));

const List = require("../models/List.model");
const service = require("../services/list.service");

describe("list.service reorderLists", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("throws when orderedListIds is incomplete", async () => {
    List.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: "l1" }, { _id: "l2" }])
    });

    await expect(
      service.reorderLists({ boardId: "b1", orderedListIds: ["l1"] })
    ).rejects.toThrow("orderedListIds must include all board lists");
  });

  test("reorders lists and returns sorted result", async () => {
    const firstCall = {
      select: jest.fn().mockResolvedValue([{ _id: "l1" }, { _id: "l2" }, { _id: "l3" }])
    };
    const secondCall = {
      sort: jest.fn().mockResolvedValue([
        { _id: "l3", order: 1 },
        { _id: "l1", order: 2 },
        { _id: "l2", order: 3 }
      ])
    };
    List.find
      .mockReturnValueOnce(firstCall)
      .mockReturnValueOnce(secondCall);

    const result = await service.reorderLists({
      boardId: "b1",
      orderedListIds: ["l3", "l1", "l2"]
    });

    expect(List.bulkWrite).toHaveBeenCalled();
    expect(result).toEqual([
      { _id: "l3", order: 1 },
      { _id: "l1", order: 2 },
      { _id: "l2", order: 3 }
    ]);
  });
});
