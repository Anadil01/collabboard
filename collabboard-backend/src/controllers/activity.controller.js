const Activity = require("../models/Activity.model");
const { getPagination } = require("../utils/pagination");
const Board = require("../models/Board.model");
const socketSvc = require("../services/socket.service");

exports.getBoardActivity = async (req, res) => {
  if (!req.query.boardId) {
    return res.status(400).json({ message: "boardId is required" });
  }

  const board = await Board.findOne({
    _id: req.query.boardId,
    members: req.userId
  }).select("_id");

  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { page, limit, skip } = getPagination({
    page: req.query.page,
    limit: req.query.limit || 20
  });

  const items = await Activity.find({ boardId: req.query.boardId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name");

  res.json({ items, page, limit });
};

exports.clearBoardActivity = async (req, res) => {
  const { boardId } = req.query || {};
  if (!boardId) {
    return res.status(400).json({ message: "boardId is required" });
  }

  const board = await Board.findOne({
    _id: boardId,
    members: req.userId
  }).select("_id");

  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Activity.deleteMany({ boardId });
  socketSvc.emitBoardUpdate(String(boardId), "activityCleared", { boardId });
  return res.json({ ok: true });
};
