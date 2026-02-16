jest.mock("../models/Task.model", () => ({
  findById: jest.fn(),
  find: jest.fn(),
  bulkWrite: jest.fn()
}));

const Task = require("../models/Task.model");
const service = require("../services/task.service");

describe("task.service moveTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("moves task across lists and updates order", async () => {
    const movingTask = { _id: "t2", listId: "l1", boardId: "b1", order: 2 };
    const updatedTask = { _id: "t2", listId: "l2", boardId: "b1", order: 2 };

    Task.findById
      .mockResolvedValueOnce(movingTask)
      .mockResolvedValueOnce(updatedTask);

    Task.find.mockImplementation((query) => ({
      sort: jest.fn().mockResolvedValue(
        String(query.listId) === "l1"
          ? [
              { _id: "t1", listId: "l1", order: 1 },
              { _id: "t2", listId: "l1", order: 2 }
            ]
          : [{ _id: "t3", listId: "l2", order: 1 }]
      )
    }));

    const result = await service.moveTask({
      taskId: "t2",
      toListId: "l2",
      toIndex: 1
    });

    expect(Task.bulkWrite).toHaveBeenCalled();
    expect(result).toEqual(updatedTask);
  });
});
