const Task = require("../models/Task.model");
const { getPagination } = require("../utils/pagination");

exports.createTask = async (data) => {
  const last = await Task.findOne({ listId: data.listId }).sort({ order: -1 });
  const order = last ? last.order + 1 : 1;

  return Task.create({ ...data, order });
};

exports.updateTask = (id, data) => Task.findByIdAndUpdate(id, data, { new: true });

exports.deleteTask = (id) => Task.findByIdAndDelete(id);

exports.getTaskById = (id) => Task.findById(id);

exports.getTasks = async ({ listId, page, limit, search }) => {
  const q = { listId };
  if (search) q.$text = { $search: search };

  const { skip, page: p, limit: l } = getPagination({ page, limit });

  const tasks = await Task.find(q).sort({ order: 1 }).skip(skip).limit(l);
  const total = await Task.countDocuments(q);

  return { tasks, total, page: p, limit: l };
};

exports.moveTask = async ({ taskId, toListId, toIndex }) => {
  const task = await Task.findById(taskId);
  if (!task) return null;

  const fromListId = String(task.listId);
  const targetListId = String(toListId);
  const sameListMove = fromListId === targetListId;
  const parsedIndex = Number(toIndex);
  const safeIndex = Number.isFinite(parsedIndex) && parsedIndex >= 0 ? Math.floor(parsedIndex) : 0;

  const sourceTasks = await Task.find({ listId: fromListId }).sort({ order: 1, createdAt: 1 });
  const destinationTasks = sameListMove
    ? sourceTasks
    : await Task.find({ listId: targetListId }).sort({ order: 1, createdAt: 1 });

  const sourceWithoutMoved = sourceTasks.filter((item) => String(item._id) !== String(taskId));
  const destinationWithoutMoved = sameListMove
    ? sourceWithoutMoved
    : destinationTasks.filter((item) => String(item._id) !== String(taskId));

  const insertIndex = Math.min(safeIndex, destinationWithoutMoved.length);
  destinationWithoutMoved.splice(insertIndex, 0, task);

  const updates = [];

  if (sameListMove) {
    destinationWithoutMoved.forEach((item, index) => {
      updates.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { order: index + 1 } }
        }
      });
    });
  } else {
    sourceWithoutMoved.forEach((item, index) => {
      updates.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { order: index + 1 } }
        }
      });
    });

    destinationWithoutMoved.forEach((item, index) => {
      updates.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              listId: targetListId,
              order: index + 1
            }
          }
        }
      });
    });
  }

  if (updates.length) {
    await Task.bulkWrite(updates);
  }

  return Task.findById(taskId);
};
