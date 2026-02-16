const Board = require("../models/Board.model");
const List = require("../models/List.model");
const { getPagination } = require("../utils/pagination");

exports.createBoard = async (title, userId, description = "") => {
  const ownerId = String(userId);
  const board = await Board.create({
    title,
    description,
    createdBy: userId,
    members: [userId],
    memberRoles: { [ownerId]: "owner" }
  });

  await List.insertMany([
    { boardId: board._id, title: "To Do", order: 1 },
    { boardId: board._id, title: "In Progress", order: 2 },
    { boardId: board._id, title: "Done", order: 3 }
  ]);

  return board;
};

exports.getUserBoards = async ({ userId, page, limit, search }) => {
  const query = { members: userId };
  if (search) query.$text = { $search: search };

  const { skip, page: p, limit: l } = getPagination({ page, limit });

  const boards = await Board.find(query).skip(skip).limit(l).sort({ updatedAt: -1 });
  const total = await Board.countDocuments(query);

  return { boards, total, page: p, limit: l };
};
