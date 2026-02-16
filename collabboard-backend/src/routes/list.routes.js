const router = require("express").Router();
const mongoose = require("mongoose");
const ctrl = require("../controllers/list.controller");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const createListValidator = (req) => {
  const { boardId, title } = req.body || {};
  if (!boardId || !title || !String(title).trim()) return "boardId and title are required";
  if (!mongoose.isValidObjectId(boardId)) return "invalid boardId";
  if (String(title).trim().length < 2) return "title must be at least 2 characters";
  return null;
};

const reorderListValidator = (req) => {
  const { boardId, orderedListIds } = req.body || {};
  if (!boardId || !Array.isArray(orderedListIds) || orderedListIds.length === 0) {
    return "boardId and orderedListIds are required";
  }
  if (!mongoose.isValidObjectId(boardId)) return "invalid boardId";
  const hasInvalidId = orderedListIds.some((id) => !mongoose.isValidObjectId(id));
  if (hasInvalidId) return "orderedListIds must contain valid ids";
  return null;
};

const listIdParamValidator = (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) return "invalid list id";
  return null;
};

router.use(auth);
router.post("/", validate(createListValidator), ctrl.create);
router.patch("/reorder", validate(reorderListValidator), ctrl.reorder);
router.patch("/:id", validate(listIdParamValidator), ctrl.update);
router.delete("/:id", validate(listIdParamValidator), ctrl.remove);

module.exports = router;
