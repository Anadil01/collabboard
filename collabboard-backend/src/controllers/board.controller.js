const boardService = require("../services/board.service");
const Board = require("../models/Board.model");
const List = require("../models/List.model");
const Task = require("../models/Task.model");
const Activity = require("../models/Activity.model");
const User = require("../models/User.model");

const asId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const getBoardRole = (board, userId) => {
  const requesterId = String(userId);
  const ownerId = asId(board?.createdBy || board?.owner);

  if (ownerId && ownerId === requesterId) return "owner";

  const roles = board?.memberRoles;
  if (roles) {
    if (roles instanceof Map) {
      const role = roles.get(requesterId);
      if (role) return role;
    } else if (typeof roles === "object") {
      if (roles[requesterId]) return roles[requesterId];
    }
  }

  const isMember = Array.isArray(board?.members)
    && board.members.some((memberId) => asId(memberId) === requesterId);

  return isMember ? "member" : null;
};

exports.createBoard = async (req, res) => {
  const title = String(req.body.title || "").trim();
  const description = String(req.body.description || "").trim();
  const board = await boardService.createBoard(title, req.userId, description);
  res.json(board);
};

exports.getBoards = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";

  const data = await boardService.getUserBoards({
    userId: req.userId,
    page,
    limit,
    search
  });

  res.json(data);
};

exports.getBoardFull = async (req, res) => {
  const board = await Board.findOne({
    _id: req.params.id,
    members: req.userId
  }).populate("members", "name email");

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const lists = await List.find({ boardId: board._id }).sort({ order: 1 });
  const tasks = await Task.find({ boardId: board._id })
    .sort({ order: 1, createdAt: 1 })
    .populate("assignedTo", "name email");

  return res.json({ board, lists, tasks });
};

exports.addMember = async (req, res) => {
  const { email } = req.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(400).json({ message: "email is required" });
  }

  const board = await Board.findOne({
    _id: req.params.id,
    members: req.userId
  }).select("_id members createdBy memberRoles");

  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const requesterRole = getBoardRole(board, req.userId);
  if (!requesterRole || !["owner", "admin"].includes(requesterRole)) {
    return res.status(403).json({ message: "Only owner/admin can manage board members" });
  }

  const user = await User.findOne({ email: normalizedEmail }).select("_id name email");
  if (!user) {
    return res.status(404).json({ message: "User with this email not found" });
  }

  const targetRole = getBoardRole(board, user._id);
  const update = { $addToSet: { members: user._id } };
  if (!targetRole) {
    update.$set = { [`memberRoles.${String(user._id)}`]: "member" };
  }

  await Board.updateOne(
    { _id: board._id },
    update
  );

  const updated = await Board.findById(board._id).populate("members", "name email");
  return res.json({ board: updated });
};

exports.updateMemberRole = async (req, res) => {
  const { role } = req.body || {};
  const memberId = String(req.params.memberId);

  const board = await Board.findById(req.params.id).select("_id members createdBy memberRoles");
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const requesterRole = getBoardRole(board, req.userId);
  if (requesterRole !== "owner") {
    return res.status(403).json({ message: "Only owner can change member roles" });
  }

  const targetRole = getBoardRole(board, memberId);
  if (!targetRole) {
    return res.status(404).json({ message: "Member not found on board" });
  }
  if (targetRole === "owner") {
    return res.status(400).json({ message: "Owner role cannot be changed" });
  }

  await Board.updateOne(
    { _id: board._id },
    { $set: { [`memberRoles.${memberId}`]: role } }
  );

  const updated = await Board.findById(board._id).populate("members", "name email");
  return res.json({ board: updated });
};

exports.removeMember = async (req, res) => {
  const memberId = String(req.params.memberId);

  const board = await Board.findById(req.params.id).select("_id members createdBy memberRoles");
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const requesterRole = getBoardRole(board, req.userId);
  if (!requesterRole || !["owner", "admin"].includes(requesterRole)) {
    return res.status(403).json({ message: "Only owner/admin can remove members" });
  }

  const targetRole = getBoardRole(board, memberId);
  if (!targetRole) {
    return res.status(404).json({ message: "Member not found on board" });
  }
  if (targetRole === "owner") {
    return res.status(400).json({ message: "Owner cannot be removed from board" });
  }
  if (String(req.userId) === memberId) {
    return res.status(400).json({ message: "Use leave board flow to remove yourself" });
  }
  if (requesterRole === "admin" && targetRole !== "member") {
    return res.status(403).json({ message: "Admin can remove only members" });
  }

  await Board.updateOne(
    { _id: board._id },
    {
      $pull: { members: memberId },
      $unset: { [`memberRoles.${memberId}`]: 1 }
    }
  );

  const updated = await Board.findById(board._id).populate("members", "name email");
  return res.json({ board: updated });
};

exports.leaveBoard = async (req, res) => {
  const board = await Board.findById(req.params.id).select("_id members createdBy memberRoles");
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const requesterRole = getBoardRole(board, req.userId);
  if (!requesterRole) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (requesterRole === "owner") {
    return res.status(400).json({ message: "Owner must transfer ownership before leaving board" });
  }

  const memberId = String(req.userId);
  await Board.updateOne(
    { _id: board._id },
    {
      $pull: { members: memberId },
      $unset: { [`memberRoles.${memberId}`]: 1 }
    }
  );

  return res.json({ ok: true });
};

exports.transferOwnership = async (req, res) => {
  const nextOwnerId = String(req.body.memberId || "");

  const board = await Board.findById(req.params.id).select("_id members createdBy memberRoles");
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const requesterRole = getBoardRole(board, req.userId);
  if (requesterRole !== "owner") {
    return res.status(403).json({ message: "Only owner can transfer ownership" });
  }
  if (String(req.userId) === nextOwnerId) {
    return res.status(400).json({ message: "You are already the owner" });
  }

  const targetRole = getBoardRole(board, nextOwnerId);
  if (!targetRole) {
    return res.status(404).json({ message: "Selected member is not on this board" });
  }

  await Board.updateOne(
    { _id: board._id },
    {
      $set: {
        createdBy: nextOwnerId,
        [`memberRoles.${nextOwnerId}`]: "owner",
        [`memberRoles.${String(req.userId)}`]: "admin"
      }
    }
  );

  const updated = await Board.findById(board._id).populate("members", "name email");
  return res.json({ board: updated });
};

exports.removeBoard = async (req, res) => {
  const board = await Board.findById(req.params.id).lean();
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const requesterRole = getBoardRole(board, req.userId);
  const hasExplicitRoles = Boolean(
    board?.memberRoles && (
      (board.memberRoles instanceof Map && board.memberRoles.size > 0)
      || (typeof board.memberRoles === "object" && Object.keys(board.memberRoles).length > 0)
    )
  );
  const ownerId = asId(board?.createdBy || board?.owner);
  const isLegacyBoardWithoutOwner = !ownerId && !hasExplicitRoles;

  // Backward compatibility for old boards that have members but no owner/roles metadata.
  const legacyMemberCanDelete =
    isLegacyBoardWithoutOwner
    && Array.isArray(board.members)
    && board.members.some((memberId) => asId(memberId) === String(req.userId));

  if (!legacyMemberCanDelete && (!requesterRole || !["owner", "admin"].includes(requesterRole))) {
    return res.status(403).json({ message: "Only owner/admin can delete board" });
  }

  await Promise.all([
    Task.deleteMany({ boardId: board._id }),
    List.deleteMany({ boardId: board._id }),
    Activity.deleteMany({ boardId: board._id }),
    Board.deleteOne({ _id: board._id })
  ]);

  return res.json({ ok: true });
};
