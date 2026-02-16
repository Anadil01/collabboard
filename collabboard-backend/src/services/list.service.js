const List = require("../models/List.model");
const Task = require("../models/Task.model");

exports.createList = async ({ boardId, title }) => {
  const last = await List.findOne({ boardId })
    .sort({ order: -1 });

  const order = last ? last.order + 1 : 1;

  return List.create({ boardId, title: title.trim(), order });
};

exports.updateList = async (id, data) => {
  const patch = {};
  if (typeof data.title === "string") {
    patch.title = data.title.trim();
  }
  return List.findByIdAndUpdate(id, patch, { new: true });
};

exports.deleteList = async (id) => {
  const list = await List.findById(id).select("boardId order");
  if (!list) return null;

  await Promise.all([
    Task.deleteMany({ listId: list._id }),
    List.deleteOne({ _id: list._id })
  ]);

  const lists = await List.find({ boardId: list.boardId })
    .sort({ order: 1, createdAt: 1 })
    .select("_id");

  if (lists.length) {
    await List.bulkWrite(
      lists.map((item, index) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { order: index + 1 } }
        }
      }))
    );
  }

  return list;
};

exports.reorderLists = async ({ boardId, orderedListIds }) => {
  const lists = await List.find({ boardId }).select("_id");
  if (!lists.length) return [];

  const existingIds = new Set(lists.map((item) => String(item._id)));
  const nextIds = (orderedListIds || []).map(String);

  if (nextIds.length !== existingIds.size) {
    throw new Error("orderedListIds must include all board lists");
  }

  const hasMissing = Array.from(existingIds).some((id) => !nextIds.includes(id));
  if (hasMissing) {
    throw new Error("orderedListIds contains missing or invalid list ids");
  }

  await List.bulkWrite(
    nextIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, boardId },
        update: { $set: { order: index + 1 } }
      }
    }))
  );

  return List.find({ boardId }).sort({ order: 1 });
};
