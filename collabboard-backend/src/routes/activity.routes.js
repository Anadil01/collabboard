const router = require("express").Router();
const mongoose = require("mongoose");
const ctrl = require("../controllers/activity.controller");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const boardIdQueryValidator = (req) => {
  if (!req.query.boardId) return "boardId is required";
  if (!mongoose.isValidObjectId(req.query.boardId)) return "invalid boardId";
  return null;
};

router.use(auth);

router.get("/", validate(boardIdQueryValidator), ctrl.getBoardActivity);
router.delete("/", validate(boardIdQueryValidator), ctrl.clearBoardActivity);

module.exports = router;
