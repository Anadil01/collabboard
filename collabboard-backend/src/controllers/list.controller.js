const svc = require("../services/list.service");
const Board = require("../models/Board.model");
const List = require("../models/List.model");
const activitySvc = require("../services/activity.service");
const socketSvc = require("../services/socket.service");

exports.create = async (req, res) => {
  const board = await Board.findOne({
    _id: req.body.boardId,
    members: req.userId
  }).select("_id");

  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const list = await svc.createList(req.body);
  await activitySvc.log({
    boardId: req.body.boardId,
    userId: req.userId,
    action: "list_created",
    meta: { listId: list._id, title: list.title }
  });
  socketSvc.emitBoardUpdate(String(req.body.boardId), "listCreated", list);
  return res.json(list);
};

exports.update = async (req, res) => {
  const listDoc = await List.findById(req.params.id).select("boardId");
  if (!listDoc) {
    return res.status(404).json({ message: "List not found" });
  }

  const board = await Board.findOne({
    _id: listDoc.boardId,
    members: req.userId
  }).select("_id");

  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!req.body?.title || !String(req.body.title).trim()) {
    return res.status(400).json({ message: "title is required" });
  }

  const list = await svc.updateList(req.params.id, req.body);
  await activitySvc.log({
    boardId: listDoc.boardId,
    userId: req.userId,
    action: "list_updated",
    meta: { listId: list?._id, title: list?.title }
  });
  socketSvc.emitBoardUpdate(String(listDoc.boardId), "listUpdated", list);
  return res.json(list);
};

exports.remove = async (req, res) => {
  const listDoc = await List.findById(req.params.id).select("boardId");
  if (!listDoc) {
    return res.status(404).json({ message: "List not found" });
  }

  const board = await Board.findOne({
    _id: listDoc.boardId,
    members: req.userId
  }).select("_id");

  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const removed = await svc.deleteList(req.params.id);
  await activitySvc.log({
    boardId: listDoc.boardId,
    userId: req.userId,
    action: "list_deleted",
    meta: { listId: req.params.id, title: removed?.title }
  });
  socketSvc.emitBoardUpdate(String(listDoc.boardId), "listDeleted", { listId: req.params.id });
  return res.json({ ok: true });
};

exports.reorder = async (req, res) => {
  const { boardId, orderedListIds } = req.body || {};

  if (!boardId || !Array.isArray(orderedListIds) || !orderedListIds.length) {
    return res.status(400).json({ message: "boardId and orderedListIds are required" });
  }

  const board = await Board.findOne({
    _id: boardId,
    members: req.userId
  }).select("_id");

  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const lists = await svc.reorderLists({ boardId, orderedListIds });

    await activitySvc.log({
      boardId,
      userId: req.userId,
      action: "list_reordered",
      meta: { orderedListIds }
    });

    socketSvc.emitBoardUpdate(String(boardId), "listReordered", {
      boardId,
      orderedListIds
    });

    return res.json({ lists });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to reorder lists" });
  }
};
