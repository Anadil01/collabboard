const router = require("express").Router();
const mongoose = require("mongoose");
const ctrl = require("../controllers/task.controller");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const createTaskValidator = (req) => {
  const { boardId, listId, title, label, priority, dueDate } = req.body || {};
  if (!boardId || !listId || !title || !String(title).trim()) return "boardId, listId and title are required";
  if (!mongoose.isValidObjectId(boardId)) return "invalid boardId";
  if (!mongoose.isValidObjectId(listId)) return "invalid listId";
  if (String(title).trim().length < 2) return "title must be at least 2 characters";
  if (label !== undefined && !["feature", "design", "bug", "system", "task"].includes(String(label))) {
    return "invalid label";
  }
  if (priority !== undefined && !["low", "medium", "high", "urgent"].includes(String(priority))) {
    return "invalid priority";
  }
  if (dueDate !== undefined && dueDate !== null && Number.isNaN(Date.parse(String(dueDate)))) {
    return "invalid dueDate";
  }
  return null;
};

const moveTaskValidator = (req) => {
  const { taskId, toListId, toIndex } = req.body || {};
  if (!taskId || !toListId) return "taskId and toListId are required";
  if (!mongoose.isValidObjectId(taskId)) return "invalid taskId";
  if (!mongoose.isValidObjectId(toListId)) return "invalid toListId";
  if (toIndex !== undefined && (!Number.isInteger(Number(toIndex)) || Number(toIndex) < 0)) {
    return "toIndex must be a non-negative number";
  }
  return null;
};

const taskIdParamValidator = (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) return "invalid task id";
  return null;
};

const updateTaskValidator = (req) => {
  const idError = taskIdParamValidator(req);
  if (idError) return idError;
  const { title, label, priority, dueDate } = req.body || {};
  if (title !== undefined && !String(title).trim()) return "title cannot be empty";
  if (label !== undefined && !["feature", "design", "bug", "system", "task"].includes(String(label))) {
    return "invalid label";
  }
  if (priority !== undefined && !["low", "medium", "high", "urgent"].includes(String(priority))) {
    return "invalid priority";
  }
  if (dueDate !== undefined && dueDate !== null && Number.isNaN(Date.parse(String(dueDate)))) {
    return "invalid dueDate";
  }
  return null;
};

const listIdQueryValidator = (req) => {
  if (!req.query.listId) return "listId is required";
  if (!mongoose.isValidObjectId(req.query.listId)) return "invalid listId";
  return null;
};

router.use(auth);
router.post("/", validate(createTaskValidator), ctrl.create);
router.patch("/:id", validate(updateTaskValidator), ctrl.update);
router.delete("/:id", validate(taskIdParamValidator), ctrl.remove);
router.get("/", validate(listIdQueryValidator), ctrl.get);
router.get("/:id", validate(taskIdParamValidator), ctrl.getOne);
router.post("/move", validate(moveTaskValidator), ctrl.move);

module.exports = router;
