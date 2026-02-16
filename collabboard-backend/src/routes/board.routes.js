const router = require("express").Router();
const mongoose = require("mongoose");
const ctrl = require("../controllers/board.controller");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const createBoardValidator = (req) => {
  if (!req.body?.title || !String(req.body.title).trim()) return "title is required";
  if (String(req.body.title).trim().length < 2) return "title must be at least 2 characters";
  if (req.body?.description !== undefined && typeof req.body.description !== "string") {
    return "description must be a string";
  }
  if (typeof req.body?.description === "string" && req.body.description.trim().length > 280) {
    return "description must be at most 280 characters";
  }
  return null;
};

const boardIdParamValidator = (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) return "invalid board id";
  return null;
};

const updateMemberRoleValidator = (req) => {
  const { role } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id)) return "invalid board id";
  if (!mongoose.isValidObjectId(req.params.memberId)) return "invalid member id";
  if (!role || !["admin", "member"].includes(role)) return "role must be admin or member";
  return null;
};

const removeMemberValidator = (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) return "invalid board id";
  if (!mongoose.isValidObjectId(req.params.memberId)) return "invalid member id";
  return null;
};

const transferOwnerValidator = (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) return "invalid board id";
  if (!mongoose.isValidObjectId(req.body?.memberId)) return "invalid member id";
  return null;
};

router.use(auth);
router.get("/", ctrl.getBoards);
router.post("/", validate(createBoardValidator), ctrl.createBoard);
router.get("/:id/full", validate(boardIdParamValidator), ctrl.getBoardFull);
router.post("/:id/members", validate(boardIdParamValidator), ctrl.addMember);
router.patch("/:id/members/:memberId/role", validate(updateMemberRoleValidator), ctrl.updateMemberRole);
router.delete("/:id/members/:memberId", validate(removeMemberValidator), ctrl.removeMember);
router.post("/:id/leave", validate(boardIdParamValidator), ctrl.leaveBoard);
router.patch("/:id/owner", validate(transferOwnerValidator), ctrl.transferOwnership);
router.delete("/:id", validate(boardIdParamValidator), ctrl.removeBoard);

module.exports = router;
