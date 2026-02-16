const svc = require("../services/task.service");
const socketSvc = require("../services/socket.service");
const activitySvc = require("../services/activity.service");
const Board = require("../models/Board.model");
const List = require("../models/List.model");

exports.create = async (req, res) => {
  const board = await Board.findOne({
    _id: req.body.boardId,
    members: req.userId
  }).select("_id");
  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const list = await List.findOne({
    _id: req.body.listId,
    boardId: req.body.boardId
  }).select("_id");
  if (!list) {
    return res.status(400).json({ message: "listId does not belong to boardId" });
  }

  const task = await svc.createTask({
    ...req.body,
    label: req.body.label || "task",
    priority: req.body.priority || "medium",
    dueDate: req.body.dueDate || null,
    createdBy: req.userId
  });

  await activitySvc.log({
    boardId: task.boardId,
    taskId: task._id,
    userId: req.userId,
    action: "task_created",
    meta: { title: task.title }
  });

  socketSvc.emitBoardUpdate(String(task.boardId), "taskCreated", task);
  return res.json(task);
};

exports.update = async (req, res) => {
  const existing = await svc.getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  const board = await Board.findOne({
    _id: existing.boardId,
    members: req.userId
  }).select("_id");
  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (Array.isArray(req.body.assignedTo)) {
    const boardMemberIds = await Board.findById(existing.boardId).select("members");
    const allowed = new Set((boardMemberIds?.members || []).map((id) => String(id)));
    const hasInvalid = req.body.assignedTo.some((id) => !allowed.has(String(id)));
    if (hasInvalid) {
      return res.status(400).json({ message: "assignedTo must contain only board members" });
    }
  }

  const payload = { ...req.body };
  if (payload.dueDate === "") payload.dueDate = null;

  const task = await svc.updateTask(req.params.id, payload);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  await activitySvc.log({
    boardId: task.boardId,
    taskId: task._id,
    userId: req.userId,
    action: "task_updated",
    meta: { title: task.title }
  });

  socketSvc.emitBoardUpdate(String(task.boardId), "taskUpdated", task);
  return res.json(task);
};

exports.remove = async (req, res) => {
  const existing = await svc.getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  const board = await Board.findOne({
    _id: existing.boardId,
    members: req.userId
  }).select("_id");
  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const task = await svc.deleteTask(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  await activitySvc.log({
    boardId: task.boardId,
    taskId: task._id,
    userId: req.userId,
    action: "task_deleted",
    meta: { title: task.title }
  });

  socketSvc.emitBoardUpdate(String(task.boardId), "taskDeleted", task);
  return res.json({ ok: true });
};

exports.get = async (req, res) => {
  if (!req.query.listId) {
    return res.status(400).json({ message: "listId is required" });
  }

  const list = await List.findById(req.query.listId).select("boardId");
  if (!list) {
    return res.status(404).json({ message: "List not found" });
  }

  const board = await Board.findOne({
    _id: list.boardId,
    members: req.userId
  }).select("_id");
  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const data = await svc.getTasks({
    listId: req.query.listId,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search || ""
  });

  return res.json(data);
};

exports.getOne = async (req, res) => {
  const task = await svc.getTaskById(req.params.id).populate("assignedTo", "name email");
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const board = await Board.findOne({
    _id: task.boardId,
    members: req.userId
  }).select("_id");
  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json(task);
};

exports.move = async (req, res) => {
  const existing = await svc.getTaskById(req.body.taskId);
  if (!existing) {
    return res.status(404).json({ message: "Task not found" });
  }

  const board = await Board.findOne({
    _id: existing.boardId,
    members: req.userId
  }).select("_id");
  if (!board) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const toList = await List.findOne({
    _id: req.body.toListId,
    boardId: existing.boardId
  }).select("_id");
  if (!toList) {
    return res.status(400).json({ message: "toListId does not belong to task board" });
  }

  const task = await svc.moveTask(req.body);

  await activitySvc.log({
    boardId: task.boardId,
    taskId: task._id,
    userId: req.userId,
    action: "task_moved",
    meta: { toListId: req.body.toListId, toIndex: req.body.toIndex }
  });

  socketSvc.emitBoardUpdate(String(task.boardId), "taskMoved", task);
  return res.json(task);
};
